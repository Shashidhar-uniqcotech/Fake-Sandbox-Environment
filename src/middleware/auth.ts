import { createMiddleware } from 'hono/factory'
import { env } from '../config/env'

export const authMiddleware = createMiddleware(
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

    const auth = c.req.header('Authorization')

    if (auth !== `Bearer ${env.authToken}`) {
      return c.json(
        { message: 'Unauthorized' },
        401
      )
    }

    await next()
  }
)
