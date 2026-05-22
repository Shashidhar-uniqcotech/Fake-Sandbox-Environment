import { createMiddleware } from 'hono/factory'
import { env } from '../config/env'

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export const rateLimitMiddleware = createMiddleware(
  async (c, next) => {
    const pathname = new URL(c.req.url).pathname

    const publicPaths = new Set([
      '/',
      '/app.css',
      '/dist/app.js',
      '/favicon.ico'
    ])

    if (
      publicPaths.has(pathname) ||
      pathname.startsWith('/auth/')
    ) {
      await next()
      return
    }

    const key =
      c.req.header('Authorization') ??
      c.req.header('x-forwarded-for') ??
      'anonymous'

    const now = Date.now()
    const current = buckets.get(key)

    if (!current || current.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + env.rateLimit.windowMs
      })
      c.header(
        'X-RateLimit-Limit',
        String(env.rateLimit.maxRequests)
      )
      c.header(
        'X-RateLimit-Remaining',
        String(env.rateLimit.maxRequests - 1)
      )
      await next()
      return
    }

    if (current.count >= env.rateLimit.maxRequests) {
      const retryAfterSeconds = Math.ceil(
        (current.resetAt - now) / 1000
      )

      c.header(
        'Retry-After',
        String(retryAfterSeconds)
      )

      return c.json(
        {
          message: 'Too Many Requests',
          retryAfterSeconds
        },
        429
      )
    }

    current.count += 1
    c.header(
      'X-RateLimit-Limit',
      String(env.rateLimit.maxRequests)
    )
    c.header(
      'X-RateLimit-Remaining',
      String(
        Math.max(
          0,
          env.rateLimit.maxRequests - current.count
        )
      )
    )
    await next()
  }
)
