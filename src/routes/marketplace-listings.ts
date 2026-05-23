import { Hono } from 'hono'
import { GenericMarketplaceListingService } from '../services/generic-marketplace-listing-service'
import {
  etsyListingSchema,
  googleShoppingListingSchema,
  metaMarketplaceListingSchema,
  shopifyListingSchema
} from '../validators/listing-validator'
import { GenericMarketplaceListing } from '../types/listing'

const schemas = {
  'google-shopping': googleShoppingListingSchema,
  'meta-marketplace': metaMarketplaceListingSchema,
  shopify: shopifyListingSchema,
  etsy: etsyListingSchema
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

    const body = await c.req.json()
    const result =
      schemas[platform].safeParse(body)

    if (!result.success) {
      return c.json(
        {
          message: 'Invalid payload',
          errors: result.error.issues
        },
        400
      )
    }

    const listing = await listings.create({
      platform,
      sellerId: c.req.param('sellerId'),
      sku: c.req.param('sku'),
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

  app.get('/:platform/listings', c => {
    const platform = c.req.param('platform')

    if (!isGenericPlatform(platform)) {
      return c.json(
        { message: 'Unsupported platform' },
        404
      )
    }

    return c.json(
      listings
        .findAll()
        .filter(
          listing => listing.platform === platform
        )
    )
  })

  app.get('/:platform/listings/:sku', c => {
    const platform = c.req.param('platform')

    if (!isGenericPlatform(platform)) {
      return c.json(
        { message: 'Unsupported platform' },
        404
      )
    }

    const listing = listings
      .findAll()
      .find(
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

  app.delete('/:platform/listings/id/:id', c => {
    const platform = c.req.param('platform')

    if (!isGenericPlatform(platform)) {
      return c.json(
        { message: 'Unsupported platform' },
        404
      )
    }

    const listing = listings
      .findAll()
      .find(
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

    listings.deleteById(listing.id)

    return c.json({
      message: 'Deleted successfully'
    })
  })

  app.delete('/:platform/listings/:sku', c => {
    const platform = c.req.param('platform')

    if (!isGenericPlatform(platform)) {
      return c.json(
        { message: 'Unsupported platform' },
        404
      )
    }

    const listing = listings
      .findAll()
      .find(
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

    listings.deleteById(listing.id)

    return c.json({
      message: 'Deleted successfully'
    })
  })

  return app
}
