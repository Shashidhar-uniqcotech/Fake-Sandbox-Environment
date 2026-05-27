import { Hono } from 'hono'
import { GenericMarketplaceListingService } from '../services/generic-marketplace-listing-service'
import {
  etsyListingSchema,
  googleShoppingListingSchema,
  metaMarketplaceListingSchema,
  shopifyListingSchema,
  tiktokShopListingSchema,
  aliexpressListingSchema,
  rakutenListingSchema,
  shopeeListingSchema,
  temuListingSchema
} from '../validators/listing-validator'
import { GenericMarketplaceListing } from '../types/listing'
import { parseJsonBody } from './request-json'

const schemas = {
  'google-shopping': googleShoppingListingSchema,
  'meta-marketplace': metaMarketplaceListingSchema,
  shopify: shopifyListingSchema,
  etsy: etsyListingSchema,
  'tiktok-shop': tiktokShopListingSchema,
  aliexpress: aliexpressListingSchema,
  rakuten: rakutenListingSchema,
  shopee: shopeeListingSchema,
  temu: temuListingSchema
} as const

type GenericPlatform =
  GenericMarketplaceListing['platform']

const isGenericPlatform = (
  platform: string
): platform is GenericPlatform =>
  platform in schemas

export const createMarketplaceListingsRouter = (
  listings: GenericMarketplaceListingService
) => {
  const app = new Hono()

  app.put('/:platform/items/:sellerId/:sku', async c => {
    const platform = c.req.param('platform')

    if (!isGenericPlatform(platform)) {
      return c.json(
        { message: 'Unsupported platform' },
        404
      )
    }

    const body = await parseJsonBody(c)

    if (!body.ok) {
      return body.response
    }

    const result =
      schemas[platform].safeParse(body.data)

    if (!result.success) {
      return c.json(
        {
          message: 'Invalid payload',
          errors: result.error.issues
        },
        400
      )
    }

    const sellerId = c.req.param('sellerId')
    const sku = c.req.param('sku')
    const existing =
      await listings.findByPlatformSellerSku(
        platform,
        sellerId,
        sku
      )

    if (existing) {
      return c.json(
        { message: 'Listing already exists' },
        409
      )
    }

    const listing = await listings.create({
      platform,
      sellerId,
      sku,
      payload: result.data,
      webhookUrl: result.data.webhookUrl,
      price: result.data.price,
      quantity: result.data.quantity,
      title: result.data.title,
      brand: result.data.brand,
      platformFields: result.data
    })

    return c.json({
      sku: listing.sku,
      submissionId: listing.submissionId,
      status: 'ACCEPTED'
    })
  })

  app.get('/:platform/listings', async c => {
    const platform = c.req.param('platform')

    if (!isGenericPlatform(platform)) {
      return c.json(
        { message: 'Unsupported platform' },
        404
      )
    }

    const allListings = await listings.findAll()

    return c.json(
      allListings.filter(
        listing => listing.platform === platform
      )
    )
  })

  app.get('/:platform/listings/:sku', async c => {
    const platform = c.req.param('platform')

    if (!isGenericPlatform(platform)) {
      return c.json(
        { message: 'Unsupported platform' },
        404
      )
    }

    const listing = (await listings.findAll()).find(
        item =>
          item.platform === platform &&
          item.sku === c.req.param('sku')
      )

    if (!listing) {
      return c.json(
        { message: 'Listing not found' },
        404
      )
    }

    return c.json(listing)
  })

  app.delete('/:platform/listings/id/:id', async c => {
    const platform = c.req.param('platform')

    if (!isGenericPlatform(platform)) {
      return c.json(
        { message: 'Unsupported platform' },
        404
      )
    }

    const listing = (await listings.findAll()).find(
        item =>
          item.platform === platform &&
          item.id === c.req.param('id')
      )

    if (!listing) {
      return c.json(
        { message: 'Listing not found' },
        404
      )
    }

    await listings.deleteById(listing.id)

    return c.json({
      message: 'Deleted successfully'
    })
  })

  app.delete('/:platform/listings/:sku', async c => {
    const platform = c.req.param('platform')

    if (!isGenericPlatform(platform)) {
      return c.json(
        { message: 'Unsupported platform' },
        404
      )
    }

    const listing = (await listings.findAll()).find(
        item =>
          item.platform === platform &&
          item.sku === c.req.param('sku')
      )

    if (!listing) {
      return c.json(
        { message: 'Listing not found' },
        404
      )
    }

    await listings.deleteById(listing.id)

    return c.json({
      message: 'Deleted successfully'
    })
  })

  return app
}
