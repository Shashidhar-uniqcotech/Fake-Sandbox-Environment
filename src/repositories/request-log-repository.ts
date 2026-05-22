import { env } from '../config/env'
import { JsonlLogStore } from '../utils/jsonl-log-store'

export type RequestLogEntry = {
  method: string
  url: string
  timestamp: string
  responseTimeMs: number
  statusCode: number
}

export class RequestLogRepository {
  private readonly store =
    new JsonlLogStore<RequestLogEntry>(
      env.requestLogPath
    )

  append(entry: RequestLogEntry) {
    this.store.append(entry)
  }
}
