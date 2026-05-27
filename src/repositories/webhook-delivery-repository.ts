import { prisma } from '../database/prisma'
import { WebhookDelivery } from '../types/webhook'
import { mapWebhookDelivery } from './prisma-mappers'

export class WebhookDeliveryRepository {
  async save(delivery: WebhookDelivery) {
    const saved = await prisma.webhookDelivery.upsert({
      where: { id: delivery.id },
      create: {
        id: delivery.id,
        url: delivery.url,
        event: delivery.event,
        payload: delivery.payload as any,
        status: delivery.status,
        attempts: delivery.attempts,
        lastStatusCode: delivery.lastStatusCode,
        lastError: delivery.lastError
      },
      update: {
        url: delivery.url,
        event: delivery.event,
        payload: delivery.payload as any,
        status: delivery.status,
        attempts: delivery.attempts,
        lastStatusCode: delivery.lastStatusCode,
        lastError: delivery.lastError
      }
    })

    return mapWebhookDelivery(saved)
  }

  async findAll() {
    const deliveries =
      await prisma.webhookDelivery.findMany({
        orderBy: { createdAt: 'desc' }
      })

    return deliveries.map(mapWebhookDelivery)
  }
}
