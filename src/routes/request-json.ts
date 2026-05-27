import { Context } from 'hono'

export const parseJsonBody = async (c: Context) => {
  try {
    return {
      ok: true as const,
      data: await c.req.json()
    }
  } catch {
    return {
      ok: false as const,
      response: c.json(
        { message: 'Invalid JSON payload' },
        400
      )
    }
  }
}
