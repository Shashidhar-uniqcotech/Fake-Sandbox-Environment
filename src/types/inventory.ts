import { ListingPlatform } from './listing'

export type InventoryItem = {
  platform: ListingPlatform
  sku: string
  quantity: number
  updatedAt: string
}
