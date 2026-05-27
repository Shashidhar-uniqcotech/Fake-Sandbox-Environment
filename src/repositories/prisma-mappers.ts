import {
  EbayListing,
  FlipkartListing,
  GenericMarketplaceListing,
  Listing,
  WalmartListing
} from '../types/listing'
import { InventoryItem } from '../types/inventory'
import { EmulatorEvent } from '../types/events'
import { WebhookDelivery } from '../types/webhook'

const toIso = (value: Date | string) =>
  value instanceof Date ? value.toISOString() : value

export const mapListing = (listing: any): Listing => ({
  ...listing,
  platform: 'amazon',
  createdAt: toIso(listing.createdAt),
  updatedAt: toIso(listing.updatedAt)
})

export const mapFlipkartListing = (
  listing: any
): FlipkartListing => ({
  ...listing,
  platform: 'flipkart',
  createdAt: toIso(listing.createdAt),
  updatedAt: toIso(listing.updatedAt)
})

export const mapWalmartListing = (
  listing: any
): WalmartListing => ({
  ...listing,
  platform: 'walmart',
  createdAt: toIso(listing.createdAt),
  updatedAt: toIso(listing.updatedAt)
})

export const mapEbayListing = (
  listing: any
): EbayListing => ({
  ...listing,
  platform: 'ebay',
  createdAt: toIso(listing.createdAt),
  updatedAt: toIso(listing.updatedAt)
})

export const mapGenericMarketplaceListing = (
  listing: any
): GenericMarketplaceListing => ({
  ...listing,
  createdAt: toIso(listing.createdAt),
  updatedAt: toIso(listing.updatedAt)
})

export const mapInventoryItem = (
  item: any
): InventoryItem => ({
  platform: item.platform,
  sku: item.sku,
  quantity: item.quantity,
  updatedAt: toIso(item.updatedAt)
})

export const mapEvent = (event: any): EmulatorEvent => ({
  ...event,
  createdAt: toIso(event.createdAt)
})

export const mapWebhookDelivery = (
  delivery: any
): WebhookDelivery => ({
  ...delivery,
  createdAt: toIso(delivery.createdAt),
  updatedAt: toIso(delivery.updatedAt)
})
