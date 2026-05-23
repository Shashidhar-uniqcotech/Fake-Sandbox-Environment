import { ListingLifecycleQueue } from '../queues/queue.types'
import { EventRepository } from '../repositories/event-repository'
import { EbayListingRepository } from '../repositories/ebay-listing-repository'
import { FlipkartListingRepository } from '../repositories/flipkart-listing-repository'
import { GenericMarketplaceListingRepository } from '../repositories/generic-marketplace-listing-repository'
import { InventoryRepository } from '../repositories/inventory-repository'
import { ListingRepository } from '../repositories/listing-repository'
import { WalmartListingRepository } from '../repositories/walmart-listing-repository'
import { WebhookDeliveryRepository } from '../repositories/webhook-delivery-repository'
import {
  EbayListing,
  FlipkartListing,
  GenericMarketplaceListing,
  Listing,
  WalmartListing
} from '../types/listing'

type MarketplaceListing =
  | Listing
  | FlipkartListing
  | WalmartListing
  | EbayListing
  | GenericMarketplaceListing

const marketplacePlatforms = [
  'amazon',
  'flipkart',
  'walmart',
  'ebay',
  'google-shopping',
  'meta-marketplace',
  'shopify',
  'etsy'
] as const

type MarketplacePlatform =
  (typeof marketplacePlatforms)[number]

export class DashboardService {
  constructor(
    private readonly listings: ListingRepository,
    private readonly flipkartListings: FlipkartListingRepository,
    private readonly walmartListings: WalmartListingRepository,
    private readonly ebayListings: EbayListingRepository,
    private readonly genericMarketplaceListings:
      GenericMarketplaceListingRepository,
    private readonly inventory: InventoryRepository,
    private readonly events: EventRepository,
    private readonly webhookDeliveries: WebhookDeliveryRepository,
    private readonly listingQueue: ListingLifecycleQueue
  ) {}

  private findAllListings(): MarketplaceListing[] {
    return [
      ...this.listings
        .findAll()
        .map(listing => ({
          ...listing,
          platform: listing.platform ?? 'amazon'
        })),
      ...this.flipkartListings
        .findAll()
        .map(listing => ({
          ...listing,
          platform: listing.platform ?? 'flipkart'
        })),
      ...this.walmartListings
        .findAll()
        .map(listing => ({
          ...listing,
          platform: listing.platform ?? 'walmart'
        })),
      ...this.ebayListings
        .findAll()
        .map(listing => ({
          ...listing,
          platform: listing.platform ?? 'ebay'
        })),
      ...this.genericMarketplaceListings
        .findAll()
        .map(listing => ({
          ...listing,
          platform: listing.platform
        }))
    ]
  }

  getAnalytics() {
    const listings = this.findAllListings()
    const inventory = this.inventory.findAll()
    const webhooks = this.webhookDeliveries.findAll()
    const byStatus = listings.reduce<Record<string, number>>(
      (acc, listing) => {
        acc[listing.status] =
          (acc[listing.status] ?? 0) + 1
        return acc
      },
      {}
    )
    const listingsByPlatform =
      marketplacePlatforms.reduce<Record<MarketplacePlatform, number>>(
        (acc, platform) => {
          acc[platform] = listings.filter(
            listing => listing.platform === platform
          ).length
          return acc
        },
        {
          amazon: 0,
          flipkart: 0,
          walmart: 0,
          ebay: 0,
          'google-shopping': 0,
          'meta-marketplace': 0,
          shopify: 0,
          etsy: 0
        }
      )
    const inventoryByPlatform =
      marketplacePlatforms.reduce<Record<MarketplacePlatform, number>>(
        (acc, platform) => {
          acc[platform] = inventory.filter(
            item => item.platform === platform
          ).length
          return acc
        },
        {
          amazon: 0,
          flipkart: 0,
          walmart: 0,
          ebay: 0,
          'google-shopping': 0,
          'meta-marketplace': 0,
          shopify: 0,
          etsy: 0
        }
      )
    const webhooksByPlatform =
      marketplacePlatforms.reduce<Record<MarketplacePlatform, number>>(
        (acc, platform) => {
          acc[platform] = webhooks.filter(
            delivery => delivery.payload.platform === platform
          ).length
          return acc
        },
        {
          amazon: 0,
          flipkart: 0,
          walmart: 0,
          ebay: 0,
          'google-shopping': 0,
          'meta-marketplace': 0,
          shopify: 0,
          etsy: 0
        }
      )

    return {
      listings: {
        total: listings.length,
        byStatus,
        byPlatform: listingsByPlatform
      },
      inventory: {
        total: inventory.length,
        byPlatform: inventoryByPlatform
      },
      webhooks: {
        totalDeliveries: webhooks.length,
        byPlatform: webhooksByPlatform
      },
      events: {
        total: this.events.findAll().length
      }
    }
  }

  getEvents() {
    return this.events.findAll()
  }

  getWebhookHistory() {
    return this.webhookDeliveries.findAll().map(delivery => ({
      ...delivery,
      platform:
        typeof delivery.payload.platform === 'string'
          ? delivery.payload.platform
          : 'legacy'
    }))
  }

  getProcessingStatus() {
    return this.findAllListings().map(listing => ({
      id: listing.id,
      platform: listing.platform,
      sku: listing.sku,
      sellerId: listing.sellerId,
      status: listing.status,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt
    }))
  }

  getQueueMetrics() {
    return this.listingQueue.getMetrics()
  }
}
