import { Hono } from 'hono'
import { InventoryService } from '../services/inventory-service'
import { InventoryItem } from '../types/inventory'
import { inventoryUpdateSchema } from '../validators/inventory-validator'
import { parseJsonBody } from './request-json'

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

const normalizeSku = (sku: string) => sku.trim()

export const createInventoryRouter = (
  inventory: InventoryService
) => {
  const app = new Hono()

  app.get('/inventory', async c =>
    c.json(await inventory.findAll())
  )

  app.patch('/inventory/:platform/:sku', async c => {
    const platform = parsePlatform(c.req.param('platform'))

    if (!platform) {
      return c.json({ message: 'Unsupported platform' }, 400)
    }

    const body = await parseJsonBody(c)

    if (!body.ok) {
      return body.response
    }

    const result =
      inventoryUpdateSchema.safeParse(body.data)

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
      await inventory.updateQuantity(
        platform,
        normalizeSku(c.req.param('sku')),
        result.data.quantity
      )
    )
  })

  app.patch('/inventory/:sku', async c => {
    const body = await parseJsonBody(c)

    if (!body.ok) {
      return body.response
    }

    const result =
      inventoryUpdateSchema.safeParse(body.data)

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
      await inventory.updateQuantity(
        'amazon',
        normalizeSku(c.req.param('sku')),
        result.data.quantity
      )
    )
  })

  app.get('/inventory/:platform/:sku', async c => {
    const platform = parsePlatform(c.req.param('platform'))

    if (!platform) {
      return c.json({ message: 'Unsupported platform' }, 400)
    }

    const item = await inventory.getBySku(
      platform,
      normalizeSku(c.req.param('sku'))
    )

    if (!item) {
      return c.json(
        { message: 'Inventory item not found' },
        404
      )
    }

    return c.json(item)
  })

  app.get('/inventory/:sku', async c => {
    const item = await inventory.getBySku(
      'amazon',
      normalizeSku(c.req.param('sku'))
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
