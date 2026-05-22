import { serve } from '@hono/node-server'
import 'dotenv/config'

import { createApp } from './app'
import { env } from './config/env'

const app = createApp()

const server = serve({
  fetch: app.fetch,
  port: env.port
})

console.log(
  `Marketplace Sandbox running on port ${env.port}`
)

process.on('SIGTERM', () => {
  server.close()
})
