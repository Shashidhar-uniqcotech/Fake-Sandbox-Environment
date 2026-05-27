import { randomUUID } from 'crypto'
import { env } from '../config/env'
import { EventBus } from '../events/event-bus'
import { ListingLifecycleQueue } from '../queues/queue.types'
import { GenericMarketplaceListingRepository } from '../repositories/generic-marketplace-listing-repository'
import { ListingStateMachine } from '../state-machines/listing-state-machine'
import {
  CreateGenericMarketplaceListingInput,
  GenericMarketplaceListing,
  ListingStatus
} from '../types/listing'
import { WebhookService } from '../webhooks/webhook-service'

export class GenericMarketplaceListingService {
  constructor(
    private readonly listings: GenericMarketplaceListingRepository,
    private readonly stateMachine: ListingStateMachine,
    private readonly queue: ListingLifecycleQueue,
    private readonly events: EventBus,
    private readonly webhooks: WebhookService
  ) {
    this.queue.processListingLifecycle(
      payload =>
        this.advanceLifecycle(payload.listingId)
    )
  }

  async create(
    input: CreateGenericMarketplaceListingInput
  ) {
    const now = new Date().toISOString()
    const listing: GenericMarketplaceListing = {
      id: randomUUID(),
      platform: input.platform,
      submissionId: randomUUID(),
      sellerId: input.sellerId,
      sku: input.sku,
      status: 'SUBMITTED',
      price: input.price,
      quantity: input.quantity,
      title: input.title,
      brand: input.brand,
      payload: input.payload,
      webhookUrl: input.webhookUrl,
      platformFields: input.platformFields ?? {},
      createdAt: now,
      updatedAt: now
    }

    await this.listings.save(listing)

    await this.events.publish({
      event: 'LISTING_CREATED',
      resourceType: 'listing',
      resourceId: listing.id,
      payload: {
        sku: listing.sku,
        sellerId: listing.sellerId,
        platform: listing.platform
      }
    })

    await this.queue.addListingLifecycleJob(
      { listingId: listing.id },
      {
        delayMs: env.listingProcessingDelayMs,
        attempts: 3
      }
    )

    return listing
  }

  findAll() {
    return this.listings.findAll()
  }

  findBySku(sku: string) {
    return this.listings.findBySku(sku)
  }

  findByPlatformSellerSku(
    platform: GenericMarketplaceListing['platform'],
    sellerId: string,
    sku: string
  ) {
    return this.listings.findByPlatformSellerSku(
      platform,
      sellerId,
      sku
    )
  }

  deleteBySku(sku: string) {
    return this.listings.deleteBySku(sku)
  }

  deleteById(id: string) {
    return this.listings.deleteById(id)
  }

  private async advanceLifecycle(listingId: string) {
    const listing = await this.listings.findById(listingId)

    if (!listing) {
      return
    }

    await this.transition(listing, 'VALIDATING')
    const validating = await this.listings.findById(listingId)

    if (!validating) {
      return
    }

    await this.transition(validating, 'PROCESSING')
    const processing = await this.listings.findById(listingId)

    if (!processing) {
      return
    }

    const discoverable =
      await this.transition(processing, 'DISCOVERABLE')

    await this.events.publish({
      event: 'LISTING_DISCOVERABLE',
      resourceType: 'listing',
      resourceId: discoverable.id,
      payload: {
        sku: discoverable.sku,
        status: discoverable.status,
        platform: discoverable.platform
      }
    })

    if (discoverable.webhookUrl) {
      await this.webhooks.deliver(
        discoverable.webhookUrl,
        {
          event: 'LISTING_DISCOVERABLE',
          sku: discoverable.sku,
          status: discoverable.status,
          platform: discoverable.platform
        }
      )
    }
  }

  private async transition(
    listing: GenericMarketplaceListing,
    nextStatus: ListingStatus
  ) {
    this.stateMachine.assertTransition(
      listing.status,
      nextStatus
    )

    const updated = await this.listings.updateStatus(
      listing.id,
      nextStatus
    )

    if (!updated) {
      throw new Error(
        `Listing ${listing.id} not found`
      )
    }

    if (nextStatus === 'PROCESSING') {
      await this.events.publish({
        event: 'LISTING_VALIDATED',
        resourceType: 'listing',
        resourceId: listing.id,
        payload: {
          sku: listing.sku,
          status: nextStatus,
          platform: listing.platform
        }
      })
    }

    return updated
  }
}
