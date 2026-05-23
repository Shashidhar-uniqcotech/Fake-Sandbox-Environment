export type ListingStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VALIDATING'
  | 'PROCESSING'
  | 'DISCOVERABLE'
  | 'VALIDATION_FAILED'
  | 'PROCESSING_FAILED'

export type CorePlatform = 'amazon'

export type MarketplacePlatform =
  | 'flipkart'
  | 'walmart'
  | 'ebay'
  | 'google-shopping'
  | 'meta-marketplace'
  | 'shopify'
  | 'etsy'

export type ListingPlatform =
  | CorePlatform
  | MarketplacePlatform

export type Listing = {
  id: string
  platform: CorePlatform
  sellerId: string
  sku: string
  status: ListingStatus
  submissionId: string
  payload: unknown
  webhookUrl?: string
  createdAt: string
  updatedAt?: string
}

export type CreateListingInput = {
  sellerId: string
  sku: string
  payload: unknown
  webhookUrl?: string
}

export type FlipkartListing = {
  id: string
  platform: 'flipkart'
  sellerId: string
  sku: string
  channelSkuId?: string
  productId?: string
  submissionId: string
  status: ListingStatus
  price?: number
  quantity?: number
  hsn?: string
  gstRate?: number
  fulfillment?: string
  payload: unknown
  webhookUrl?: string
  createdAt: string
  updatedAt?: string
}

export type CreateFlipkartListingInput = {
  sellerId: string
  sku: string
  payload: unknown
  webhookUrl?: string
  channelSkuId?: string
  productId?: string
  price?: number
  quantity?: number
  hsn?: string
  gstRate?: number
  fulfillment?: string
}

export type WalmartListing = {
  id: string
  platform: 'walmart'
  sellerId: string
  sku: string
  itemId?: string
  submissionId: string
  status: ListingStatus
  price?: number
  quantity?: number
  upc?: string
  mpn?: string
  brand?: string
  shippingTemplate?: string
  payload: unknown
  webhookUrl?: string
  createdAt: string
  updatedAt?: string
}

export type CreateWalmartListingInput = {
  sellerId: string
  sku: string
  payload: unknown
  webhookUrl?: string
  itemId?: string
  price?: number
  quantity?: number
  upc?: string
  mpn?: string
  brand?: string
  shippingTemplate?: string
}

export type EbayListing = {
  id: string
  platform: 'ebay'
  sellerId: string
  sku: string
  itemId?: string
  submissionId: string
  status: ListingStatus
  listingType?: string
  startPrice?: number
  buyItNowPrice?: number
  condition?: string
  quantity?: number
  title?: string
  payload: unknown
  webhookUrl?: string
  createdAt: string
  updatedAt?: string
}

export type CreateEbayListingInput = {
  sellerId: string
  sku: string
  payload: unknown
  webhookUrl?: string
  itemId?: string
  listingType?: string
  startPrice?: number
  buyItNowPrice?: number
  condition?: string
  quantity?: number
  title?: string
}

export type GenericMarketplaceListing = {
  id: string
  platform: Exclude<
    MarketplacePlatform,
    'flipkart' | 'walmart' | 'ebay'
  >
  sellerId: string
  sku: string
  submissionId: string
  status: ListingStatus
  price?: number
  quantity?: number
  title?: string
  brand?: string
  payload: unknown
  webhookUrl?: string
  platformFields: Record<string, unknown>
  createdAt: string
  updatedAt?: string
}

export type CreateGenericMarketplaceListingInput = {
  platform: GenericMarketplaceListing['platform']
  sellerId: string
  sku: string
  payload: unknown
  webhookUrl?: string
  price?: number
  quantity?: number
  title?: string
  brand?: string
  platformFields?: Record<string, unknown>
}
