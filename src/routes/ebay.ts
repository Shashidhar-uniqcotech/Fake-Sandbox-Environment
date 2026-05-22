import { Hono } from 'hono'
import { EbayListingService } from '../services/ebay-listing-service'
import { ebayListingSchema } from '../validators/listing-validator'

export const createEbayRouter = (
  listings: EbayListingService
) => {
  const app = new Hono()

  app.put('/ebay/items/:sellerId/:sku', async c => {
    const body = await c.req.json()
    const result = ebayListingSchema.safeParse(body)

    if (!result.success) {
      return c.json({ message: 'Invalid payload', errors: result.error.issues }, 400)
    }

    const listing = await listings.create({
      sellerId: c.req.param('sellerId'),
      sku: c.req.param('sku'),
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

  app.get('/ebay/listings', c => c.json(listings.findAll()))

  app.get('/ebay/listings/:sku', c => {
    const listing = listings.findBySku(c.req.param('sku'))

    if (!listing) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json(listing)
  })

  app.delete('/ebay/listings/id/:id', c => {
    const deleted = listings.deleteById(c.req.param('id'))

    if (!deleted) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json({ message: 'Deleted successfully' })
  })

  app.delete('/ebay/listings/:sku', c => {
    const deleted = listings.deleteBySku(c.req.param('sku'))

    if (!deleted) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json({ message: 'Deleted successfully' })
  })

  return app
}
