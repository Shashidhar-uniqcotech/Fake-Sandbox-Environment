import { Hono } from 'hono'
import { DashboardService } from '../services/dashboard-service'

export const createDashboardRouter = (
  dashboard: DashboardService
) => {
  const app = new Hono()

  app.get('/dashboard/analytics', c =>
    c.json(dashboard.getAnalytics())
  )

  app.get('/dashboard/events', c =>
    c.json(dashboard.getEvents())
  )

  app.get('/dashboard/processing-status', c =>
    c.json(dashboard.getProcessingStatus())
  )

  app.get('/dashboard/queue-metrics', async c =>
    c.json(await dashboard.getQueueMetrics())
  )

  app.get('/dashboard/webhooks', c =>
    c.json(dashboard.getWebhookHistory())
  )

  return app
}
