import { Hono } from 'hono'
import { EbayListingService } from '../services/ebay-listing-service'
import { ebayListingSchema } from '../validators/listing-validator'
import { parseJsonBody } from './request-json'

export const createEbayRouter = (
  listings: EbayListingService
) => {
  const app = new Hono()

  app.put('/ebay/items/:sellerId/:sku', async c => {
    const body = await parseJsonBody(c)

    if (!body.ok) {
      return body.response
    }

    const result = ebayListingSchema.safeParse(body.data)

    if (!result.success) {
      return c.json({ message: 'Invalid payload', errors: result.error.issues }, 400)
    }

    const sellerId = c.req.param('sellerId')
    const sku = c.req.param('sku')
    const existing =
      await listings.findBySellerSku(sellerId, sku)

    if (existing) {
      return c.json({ message: 'Listing already exists' }, 409)
    }

    const listing = await listings.create({
      sellerId,
      sku,
      payload: result.data,
      webhookUrl: result.data.webhookUrl,
      itemId: result.data.itemId,
      listingType: result.data.listingType,
      startPrice: result.data.startPrice,
      buyItNowPrice: result.data.buyItNowPrice,
      condition: result.data.condition,
      quantity: result.data.quantity,
      title: result.data.title
    })

    return c.json({ sku: listing.sku, submissionId: listing.submissionId, status: 'ACCEPTED' })
  })

  app.get('/ebay/listings', async c =>
    c.json(await listings.findAll())
  )

  app.get('/ebay/listings/:sku', async c => {
    const listing = await listings.findBySku(c.req.param('sku'))

    if (!listing) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json(listing)
  })

  app.delete('/ebay/listings/id/:id', async c => {
    const deleted = await listings.deleteById(c.req.param('id'))

    if (!deleted) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json({ message: 'Deleted successfully' })
  })

  app.delete('/ebay/listings/:sku', async c => {
    const deleted = await listings.deleteBySku(c.req.param('sku'))

    if (!deleted) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json({ message: 'Deleted successfully' })
  })

  return app
}
