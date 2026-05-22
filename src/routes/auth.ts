import { Hono } from 'hono'
import { randomUUID } from 'crypto'
import { env } from '../config/env'

const app = new Hono()

app.post('/auth/token', async (c) => {

  return c.json({
    access_token:
      env.authToken,

    refresh_token:
      randomUUID(),

    expires_in: 3600,

    token_type: 'Bearer'
  })
})

export default app
