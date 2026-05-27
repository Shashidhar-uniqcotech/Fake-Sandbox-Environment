import { prisma } from '../database/prisma'

export type RequestLogEntry = {
  method: string
  url: string
  timestamp: string
  responseTimeMs: number
  statusCode: number
}

export class RequestLogRepository {
  async append(entry: RequestLogEntry) {
    await prisma.requestLog.create({
      data: {
        method: entry.method,
        url: entry.url,
        timestamp: new Date(entry.timestamp),
        responseTimeMs: entry.responseTimeMs,
        statusCode: entry.statusCode
      }
    })
  }
}
