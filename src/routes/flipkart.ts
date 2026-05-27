import { Hono } from 'hono'
import { FlipkartListingService } from '../services/flipkart-listing-service'
import { flipkartListingSchema } from '../validators/listing-validator'
import { parseJsonBody } from './request-json'

export const createFlipkartRouter = (
  listings: FlipkartListingService
) => {
  const app = new Hono()

  app.put('/flipkart/items/:sellerId/:sku', async c => {
    const body = await parseJsonBody(c)

    if (!body.ok) {
      return body.response
    }

    const result = flipkartListingSchema.safeParse(body.data)

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

  app.get('/flipkart/listings', async c =>
    c.json(await listings.findAll())
  )

  app.get('/flipkart/listings/:sku', async c => {
    const listing = await listings.findBySku(c.req.param('sku'))

    if (!listing) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json(listing)
  })

  app.delete('/flipkart/listings/id/:id', async c => {
    const deleted = await listings.deleteById(c.req.param('id'))

    if (!deleted) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json({ message: 'Deleted successfully' })
  })

  app.delete('/flipkart/listings/:sku', async c => {
    const deleted = await listings.deleteBySku(c.req.param('sku'))

    if (!deleted) {
      return c.json({ message: 'Listing not found' }, 404)
    }

    return c.json({ message: 'Deleted successfully' })
  })

  return app
}
