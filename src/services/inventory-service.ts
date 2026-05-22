import { EventBus } from '../events/event-bus'
import { InventoryRepository } from '../repositories/inventory-repository'
import { InventoryItem } from '../types/inventory'

export class InventoryService {
  constructor(
    private readonly inventory: InventoryRepository,
    private readonly events: EventBus
  ) {}

  findAll() {
    return this.inventory.findAll()
  }

  getBySku(platform: InventoryItem['platform'], sku: string) {
    return this.inventory.findBySku(platform, sku)
  }

  updateQuantity(
    platform: InventoryItem['platform'],
    sku: string,
    quantity: number
  ) {
    const item = this.inventory.upsert({
      platform,
      sku,
      quantity,
      updatedAt: new Date().toISOString()
    })

    this.events.publish({
      event: 'INVENTORY_UPDATED',
      resourceType: 'inventory',
      resourceId: `${platform}:${sku}`,
      payload: item
    })

    return item
  }
}
