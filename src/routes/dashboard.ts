import { Hono } from 'hono'
import { DashboardService } from '../services/dashboard-service'

export const createDashboardRouter = (
  dashboard: DashboardService
) => {
  const app = new Hono()

  app.get('/dashboard/analytics', async c =>
    c.json(await dashboard.getAnalytics())
  )

  app.get('/dashboard/events', async c =>
    c.json(await dashboard.getEvents())
  )

  app.get('/dashboard/processing-status', async c =>
    c.json(await dashboard.getProcessingStatus())
  )

  app.get('/dashboard/queue-metrics', async c =>
    c.json(await dashboard.getQueueMetrics())
  )

  app.get('/dashboard/webhooks', async c =>
    c.json(await dashboard.getWebhookHistory())
  )

  return app
}
