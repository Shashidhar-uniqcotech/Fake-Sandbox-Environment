import { DashboardService } from './services/dashboard-service'
import { EventBus } from './events/event-bus'
import { EventRepository } from './repositories/event-repository'
import { InventoryRepository } from './repositories/inventory-repository'
import { InventoryService } from './services/inventory-service'
import { ListingRepository } from './repositories/listing-repository'
import { ListingService } from './services/listing-service'
import { FlipkartListingRepository } from './repositories/flipkart-listing-repository'
import { FlipkartListingService } from './services/flipkart-listing-service'
import { WalmartListingRepository } from './repositories/walmart-listing-repository'
import { WalmartListingService } from './services/walmart-listing-service'
import { EbayListingRepository } from './repositories/ebay-listing-repository'
import { EbayListingService } from './services/ebay-listing-service'
import { GenericMarketplaceListingRepository } from './repositories/generic-marketplace-listing-repository'
import { GenericMarketplaceListingService } from './services/generic-marketplace-listing-service'
import { ListingStateMachine } from './state-machines/listing-state-machine'
import { createListingLifecycleQueue } from './queues/queue-factory'
import { RequestLogRepository } from './repositories/request-log-repository'
import { WebhookDeliveryRepository } from './repositories/webhook-delivery-repository'
import { WebhookService } from './webhooks/webhook-service'

const eventRepository = new EventRepository()
const listingRepository = new ListingRepository()
const flipkartListingRepository =
  new FlipkartListingRepository()
const walmartListingRepository =
  new WalmartListingRepository()
const ebayListingRepository =
  new EbayListingRepository()
const genericMarketplaceListingRepository =
  new GenericMarketplaceListingRepository()
const inventoryRepository = new InventoryRepository()
const webhookDeliveryRepository =
  new WebhookDeliveryRepository()

const eventBus = new EventBus(eventRepository)
const webhookService = new WebhookService(
  webhookDeliveryRepository,
  eventBus
)
const listingLifecycleQueue =
  createListingLifecycleQueue()

export const container = {
  requestLogs: new RequestLogRepository(),
  listings: new ListingService(
    listingRepository,
    new ListingStateMachine(),
    listingLifecycleQueue,
    eventBus,
    webhookService
  ),
  flipkartListings: new FlipkartListingService(
    flipkartListingRepository,
    new ListingStateMachine(),
    listingLifecycleQueue,
    eventBus,
    webhookService
  ),
  walmartListings: new WalmartListingService(
    walmartListingRepository,
    new ListingStateMachine(),
    listingLifecycleQueue,
    eventBus,
    webhookService
  ),
  ebayListings: new EbayListingService(
    ebayListingRepository,
    new ListingStateMachine(),
    listingLifecycleQueue,
    eventBus,
    webhookService
  ),
  genericMarketplaceListings:
    new GenericMarketplaceListingService(
      genericMarketplaceListingRepository,
      new ListingStateMachine(),
      listingLifecycleQueue,
      eventBus,
      webhookService
    ),
  inventory: new InventoryService(
    inventoryRepository,
    eventBus
  ),
  dashboard: new DashboardService(
    listingRepository,
    flipkartListingRepository,
    walmartListingRepository,
    ebayListingRepository,
    genericMarketplaceListingRepository,
    inventoryRepository,
    eventRepository,
    webhookDeliveryRepository,
    listingLifecycleQueue
  )
}
