import { createMiddleware } from 'hono/factory'
import { env } from '../config/env'

const wait = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const errorSimulatorMiddleware =
  createMiddleware(async (c, next) => {
    const rule = env.errorSimulation.rules.find(
      candidate =>
        (candidate.method === '*' ||
          candidate.method === c.req.method) &&
        new URL(c.req.url).pathname.startsWith(
          candidate.pathPrefix
        )
    )

    if (
      !rule ||
      Math.random() > rule.probability
    ) {
      await next()
      return
    }

    if (rule.kind === 'timeout') {
      await wait(env.errorSimulation.timeoutMs)
      return c.json(
        { message: 'Simulated network timeout' },
        503
      )
    }

    if (rule.kind === '429') {
      c.header('Retry-After', '5')
      return c.json(
        { message: 'Simulated throttling' },
        429
      )
    }

    if (rule.kind === '503') {
      return c.json(
        { message: 'Simulated service unavailable' },
        503
      )
    }

    return c.json(
      { message: 'Simulated internal server error' },
      500
    )
  })
