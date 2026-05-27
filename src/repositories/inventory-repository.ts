import { prisma } from '../database/prisma'
import { InventoryItem } from '../types/inventory'
import { mapInventoryItem } from './prisma-mappers'

export class InventoryRepository {
  async findAll() {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { updatedAt: 'desc' }
    })

    return items.map(mapInventoryItem)
  }

  async findBySku(
    platform: InventoryItem['platform'],
    sku: string
  ) {
    const item = await prisma.inventoryItem.findUnique({
      where: {
        platform_sku: {
          platform,
          sku
        }
      }
    })

    return item ? mapInventoryItem(item) : undefined
  }

  async upsert(item: InventoryItem) {
    const saved = await prisma.inventoryItem.upsert({
      where: {
        platform_sku: {
          platform: item.platform,
          sku: item.sku
        }
      },
      create: {
        platform: item.platform,
        sku: item.sku,
        quantity: item.quantity
      },
      update: {
        quantity: item.quantity
      }
    })

    return mapInventoryItem(saved)
  }
}
