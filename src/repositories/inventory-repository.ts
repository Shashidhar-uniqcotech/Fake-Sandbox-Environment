import { InventoryItem } from '../types/inventory'
import { JsonFileStore } from '../utils/json-file-store'

export class InventoryRepository {
  private readonly store =
    new JsonFileStore<InventoryItem[]>(
      'src/db/inventory.json',
      []
    )

  findAll() {
    return this.store.read()
  }

  findBySku(platform: InventoryItem['platform'], sku: string) {
    return this.store.read().find(
      item =>
        item.platform === platform &&
        item.sku === sku
    )
  }

  upsert(item: InventoryItem) {
    this.store.update(items => [
      item,
      ...items.filter(
        current =>
          current.platform !== item.platform ||
          current.sku !== item.sku
      )
    ])

    return item
  }
}
