import { Hono } from 'hono'
import { InventoryService } from '../services/inventory-service'
import { InventoryItem } from '../types/inventory'
import { inventoryUpdateSchema } from '../validators/inventory-validator'

const platforms = new Set([
  'amazon',
  'flipkart',
  'walmart',
  'ebay',
  'google-shopping',
  'meta-marketplace',
  'shopify',
  'etsy',
  'tiktok-shop',
  'aliexpress',
  'rakuten',
  'shopee',
  'temu'
])

const parsePlatform = (value: string) => {
  if (!platforms.has(value)) {
    return undefined
  }

  return value as InventoryItem['platform']
}

export const createInventoryRouter = (
  inventory: InventoryService
) => {
  const app = new Hono()

  app.get('/inventory', c => c.json(inventory.findAll()))

  app.patch('/inventory/:platform/:sku', async c => {
    const platform = parsePlatform(c.req.param('platform'))

    if (!platform) {
      return c.json({ message: 'Unsupported platform' }, 400)
    }

    const body = await c.req.json()
    const result =
      inventoryUpdateSchema.safeParse(body)

    if (!result.success) {
      return c.json(
        {
          message: 'Invalid payload',
          errors: result.error.issues
        },
        400
      )
    }

    return c.json(
      inventory.updateQuantity(
        platform,
        c.req.param('sku'),
        result.data.quantity
      )
    )
  })

  app.get('/inventory/:platform/:sku', c => {
    const platform = parsePlatform(c.req.param('platform'))

    if (!platform) {
      return c.json({ message: 'Unsupported platform' }, 400)
    }

    const item = inventory.getBySku(
      platform,
      c.req.param('sku')
    )

    if (!item) {
      return c.json(
        { message: 'Inventory item not found' },
        404
      )
    }

    return c.json(item)
  })

  return app
}
