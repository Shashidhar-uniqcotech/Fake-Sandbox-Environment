import 'dotenv/config'

export type ErrorSimulationKind =
  | '500'
  | '429'
  | '503'
  | 'timeout'

export type ErrorSimulationRule = {
  method: string
  pathPrefix: string
  probability: number
  kind: ErrorSimulationKind
}

const numberFromEnv = (
  key: string,
  fallback: number
) => {
  const raw = process.env[key]
  const parsed = raw ? Number(raw) : NaN

  return Number.isFinite(parsed)
    ? parsed
    : fallback
}

const parseErrorRules = (
  raw?: string
): ErrorSimulationRule[] => {
  if (!raw) {
    return []
  }

  return raw
    .split(',')
    .map(rule => rule.trim())
    .filter(Boolean)
    .map(rule => {
      const [
        method = '*',
        pathPrefix = '/',
        probability = '0',
        kind = '500'
      ] = rule.split(':')

      return {
        method: method.toUpperCase(),
        pathPrefix,
        probability: Number(probability),
        kind: kind as ErrorSimulationKind
      }
    })
    .filter(rule =>
      Number.isFinite(rule.probability) &&
      rule.probability > 0
    )
}

export const env = {
  port: numberFromEnv('PORT', 4000),
  authToken: process.env.AUTH_TOKEN ?? 'fake-token',
  queue: {
    driver: 'local',
    redis: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: numberFromEnv('REDIS_PORT', 6379)
    }
  },
  listingProcessingDelayMs: numberFromEnv(
    'LISTING_PROCESSING_DELAY_MS',
    5000
  ),
  requestLogPath:
    process.env.REQUEST_LOG_PATH ??
    'src/logs/request-logs.jsonl',
  webhookDeliveryLogPath:
    process.env.WEBHOOK_DELIVERY_LOG_PATH ??
    'src/logs/webhook-deliveries.json',
  eventLogPath:
    process.env.EVENT_LOG_PATH ??
    'src/logs/events.json',
  rateLimit: {
    windowMs: numberFromEnv(
      'RATE_LIMIT_WINDOW_MS',
      60_000
    ),
    maxRequests: numberFromEnv(
      'RATE_LIMIT_MAX_REQUESTS',
      1000
    )
  },
  webhook: {
    maxAttempts: numberFromEnv(
      'WEBHOOK_MAX_ATTEMPTS',
      3
    ),
    retryDelayMs: numberFromEnv(
      'WEBHOOK_RETRY_DELAY_MS',
      1000
    ),
    timeoutMs: numberFromEnv(
      'WEBHOOK_TIMEOUT_MS',
      3000
    )
  },
  errorSimulation: {
    timeoutMs: numberFromEnv(
      'ERROR_SIMULATION_TIMEOUT_MS',
      10_000
    ),
    rules: parseErrorRules(
      process.env.ERROR_SIMULATION_RULES
    )
  }
}
