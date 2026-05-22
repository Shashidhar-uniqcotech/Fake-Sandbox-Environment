import { env } from '../config/env'
import { WebhookDelivery } from '../types/webhook'
import { JsonFileStore } from '../utils/json-file-store'

export class WebhookDeliveryRepository {
  private readonly store =
    new JsonFileStore<WebhookDelivery[]>(
      env.webhookDeliveryLogPath,
      []
    )

  save(delivery: WebhookDelivery) {
    this.store.update(deliveries => [
      delivery,
      ...deliveries.filter(
        item => item.id !== delivery.id
      )
    ])

    return delivery
  }

  findAll() {
    return this.store.read()
  }
}
