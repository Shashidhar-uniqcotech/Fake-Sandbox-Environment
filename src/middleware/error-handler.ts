import { Hono } from 'hono'

export const registerErrorHandler = (app: Hono) => {
  app.onError((error, c) => {
    console.error('Unhandled request error', error)

    return c.json(
      {
        message: 'Internal Server Error',
        errorId: crypto.randomUUID()
      },
      500
    )
  })
}
