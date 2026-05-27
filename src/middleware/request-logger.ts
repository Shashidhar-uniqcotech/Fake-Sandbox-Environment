import { createMiddleware } from 'hono/factory'
import { RequestLogRepository } from '../repositories/request-log-repository'

export const requestLoggerMiddleware = (
  logs: RequestLogRepository
) => createMiddleware(async (c, next) => {
  const startedAt = performance.now()
  const timestamp = new Date().toISOString()

  await next()

  await logs.append({
    method: c.req.method,
    url: c.req.url,
    timestamp,
    responseTimeMs:
      Math.round(performance.now() - startedAt),
    statusCode: c.res.status
  })
})
