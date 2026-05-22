import { randomUUID } from 'crypto'
import { env } from '../config/env'
import { EventBus } from '../events/event-bus'
import { WebhookDeliveryRepository } from '../repositories/webhook-delivery-repository'
import { WebhookDelivery } from '../types/webhook'

const wait = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export class WebhookService {
  constructor(
    private readonly deliveries: WebhookDeliveryRepository,
    private readonly events: EventBus
  ) {}

  async deliver(
    url: string,
    payload: Record<string, unknown>
  ) {
    let delivery: WebhookDelivery = {
      id: randomUUID(),
      url,
      event: String(payload.event ?? 'UNKNOWN'),
      payload,
      status: 'PENDING',
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.deliveries.save(delivery)

    for (
      let attempt = 1;
      attempt <= env.webhook.maxAttempts;
      attempt += 1
    ) {
      delivery = {
        ...delivery,
        attempts: attempt,
        updatedAt: new Date().toISOString()
      }

      try {
        const controller = new AbortController()
        const timeout = setTimeout(
          () => controller.abort(),
          env.webhook.timeoutMs
        )

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        })

        clearTimeout(timeout)

        delivery = {
          ...delivery,
          lastStatusCode: response.status,
          status: response.ok ? 'DELIVERED' : 'FAILED',
          lastError: response.ok
            ? undefined
            : `HTTP ${response.status}`,
          updatedAt: new Date().toISOString()
        }

        this.deliveries.save(delivery)

        if (response.ok) {
          this.events.publish({
            event: 'WEBHOOK_DELIVERED',
            resourceType: 'webhook',
            resourceId: delivery.id,
            payload: {
              platform: payload.platform,
              url,
              attempts: attempt
            }
          })
          return delivery
        }
      } catch (error) {
        delivery = {
          ...delivery,
          status: 'FAILED',
          lastError: error instanceof Error
            ? error.message
            : 'Unknown webhook delivery error',
          updatedAt: new Date().toISOString()
        }

        this.deliveries.save(delivery)
      }

      if (attempt < env.webhook.maxAttempts) {
        await wait(env.webhook.retryDelayMs * attempt)
      }
    }

    this.events.publish({
      event: 'WEBHOOK_FAILED',
      resourceType: 'webhook',
      resourceId: delivery.id,
      payload: {
        platform: payload.platform,
        url,
        attempts: delivery.attempts,
        error: delivery.lastError
      }
    })

    return delivery
  }
}
