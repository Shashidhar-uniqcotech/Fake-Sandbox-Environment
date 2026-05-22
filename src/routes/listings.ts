import { Hono } from 'hono'
import { ListingService } from '../services/listing-service'
import { listingSchema } from '../validators/listing-validator'

export const createListingsRouter = (
  listings: ListingService
) => {
  const app = new Hono()

  app.put(
    '/listings/2021-08-01/items/:sellerId/:sku',
    async c => {
      const body = await c.req.json()
      const result = listingSchema.safeParse(body)

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
        sellerId: c.req.param('sellerId'),
        sku: c.req.param('sku'),
        payload: result.data,
        webhookUrl: result.data.webhookUrl
      })

      return c.json({
        sku: listing.sku,
        submissionId: listing.submissionId,
        status: 'ACCEPTED'
      })
    }
  )

  app.get('/listings', c =>
    c.json(listings.findAll())
  )

  app.get('/listings/:sku', c => {
    const listing = listings.findBySku(
      c.req.param('sku')
    )

    if (!listing) {
      return c.json(
        { message: 'Listing not found' },
        404
      )
    }

    return c.json(listing)
  })

  app.delete('/listings/id/:id', c => {
    const deleted = listings.deleteById(
      c.req.param('id')
    )

    if (!deleted) {
      return c.json(
        { message: 'Listing not found' },
        404
      )
    }

    return c.json({
      message: 'Deleted successfully'
    })
  })

  app.delete('/listings/:sku', c => {
    const deleted = listings.deleteBySku(
      c.req.param('sku')
    )

    if (!deleted) {
      return c.json(
        { message: 'Listing not found' },
        404
      )
    }

    return c.json({
      message: 'Deleted successfully'
    })
  })

  return app
}
