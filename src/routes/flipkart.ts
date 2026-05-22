import { Hono } from 'hono'
import { FlipkartListingService } from '../services/flipkart-listing-service'
import { flipkartListingSchema } from '../validators/listing-validator'

export const createFlipkartRouter = (
  listings: FlipkartListingService
) => {
  const app = new Hono()

  app.put('/flipkart/items/:sellerId/:sku', async c => {
    const body = await c.req.json()
    const result = flipkartListingSchema.safeParse(body)

    if (!result.success) {
      return c.json({ message: 'Invalid payload', errors: result.error.issues }, 400)
    }

    const listing = await listings.create({
      sellerId: c.req.param('sellerId'),
      sku: c.req.param('sku'),
      payload: result.data,
      webhookUrl: result.data.webhookUrl,
      channelSkuId: result.data.channelSkuId,
      productId: result.data.productId,
      price: result.data.price,
      quantity: result.data.quantity,
      hsn: result.data.hsn,
      gstRate: result.data.gstRate,
      fulfillment: result.data.fulfillment
    })

    return c.json({ sku: listing.sku, submissionId: listing.submissionId, status: 'ACCEPTED' })
  })

  app.get('/flipkart/listings', c => c.json(listings.findAll()))

  app.get('/flipkart/listings/:sku', c => {
    const listing = listings.findBySku(c.req.param('sku'))

    if (!listing) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json(listing)
  })

  app.delete('/flipkart/listings/id/:id', c => {
    const deleted = listings.deleteById(c.req.param('id'))

    if (!deleted) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json({ message: 'Deleted successfully' })
  })

  app.delete('/flipkart/listings/:sku', c => {
    const deleted = listings.deleteBySku(c.req.param('sku'))

    if (!deleted) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json({ message: 'Deleted successfully' })
  })

  return app
}
