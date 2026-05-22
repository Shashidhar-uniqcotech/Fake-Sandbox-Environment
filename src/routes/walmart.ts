import { Hono } from 'hono'
import { WalmartListingService } from '../services/walmart-listing-service'
import { walmartListingSchema } from '../validators/listing-validator'

export const createWalmartRouter = (
  listings: WalmartListingService
) => {
  const app = new Hono()

  app.put('/walmart/items/:sellerId/:sku', async c => {
    const body = await c.req.json()
    const result = walmartListingSchema.safeParse(body)

    if (!result.success) {
      return c.json({ message: 'Invalid payload', errors: result.error.issues }, 400)
    }

    const listing = await listings.create({
      sellerId: c.req.param('sellerId'),
      sku: c.req.param('sku'),
      payload: result.data,
      webhookUrl: result.data.webhookUrl,
      itemId: result.data.itemId,
      price: result.data.price,
      quantity: result.data.quantity,
      upc: result.data.upc,
      mpn: result.data.mpn,
      brand: result.data.brand,
      shippingTemplate: result.data.shippingTemplate
    })

    return c.json({ sku: listing.sku, submissionId: listing.submissionId, status: 'ACCEPTED' })
  })

  app.get('/walmart/listings', c => c.json(listings.findAll()))

  app.get('/walmart/listings/:sku', c => {
    const listing = listings.findBySku(c.req.param('sku'))

    if (!listing) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json(listing)
  })

  app.delete('/walmart/listings/id/:id', c => {
    const deleted = listings.deleteById(c.req.param('id'))

    if (!deleted) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json({ message: 'Deleted successfully' })
  })

  app.delete('/walmart/listings/:sku', c => {
    const deleted = listings.deleteBySku(c.req.param('sku'))

    if (!deleted) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json({ message: 'Deleted successfully' })
  })

  return app
}
