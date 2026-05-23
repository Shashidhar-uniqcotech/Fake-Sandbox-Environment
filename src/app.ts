import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { container } from './container'
import auth from './routes/auth'
import { authMiddleware } from './middleware/auth'
import { createDashboardRouter } from './routes/dashboard'
import { createInventoryRouter } from './routes/inventory'
import { createListingsRouter } from './routes/listings'
import { createFlipkartRouter } from './routes/flipkart'
import { createWalmartRouter } from './routes/walmart'
import { createEbayRouter } from './routes/ebay'
import { createMarketplaceListingsRouter } from './routes/marketplace-listings'
import { errorSimulatorMiddleware } from './middleware/error-simulator'
import { rateLimitMiddleware } from './middleware/rate-limit'
import { registerErrorHandler } from './middleware/error-handler'
import { requestLoggerMiddleware } from './middleware/request-logger'

export const createApp = () => {
  const app = new Hono()

  registerErrorHandler(app)

  // Static file routes - no middleware applied
  app.get('/', serveStatic({ path: './public/index.html' }))
  app.get('/app.css', serveStatic({ path: './public/app.css' }))
  app.get(
    '/dist/app.js',
    serveStatic({ path: './public/dist/app.js' })
  )

  // Middleware stack for API routes
  app.use(
    '*',
    requestLoggerMiddleware(container.requestLogs)
  )
  app.use('*', errorSimulatorMiddleware)
  app.use('*', rateLimitMiddleware)

  app.route('/', auth)

  app.use('*', authMiddleware)
  app.route('/', createListingsRouter(container.listings))
  app.route('/', createFlipkartRouter(container.flipkartListings))
  app.route('/', createWalmartRouter(container.walmartListings))
  app.route('/', createEbayRouter(container.ebayListings))
  app.route(
    '/',
    createMarketplaceListingsRouter(
      container.genericMarketplaceListings
    )
  )
  app.route('/', createInventoryRouter(container.inventory))
  app.route('/', createDashboardRouter(container.dashboard))

  return app
}
