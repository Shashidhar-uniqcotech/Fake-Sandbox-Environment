import {
  ListingLifecycleJobData,
  ListingLifecycleQueue,
  QueueMetrics
} from './queue.types'

export type DelayedJob<T> = {
  name: string
  payload: T
  delayMs: number
  attempts?: number
}

export class LocalDelayedQueue
  implements ListingLifecycleQueue {
  private readonly handlers: Array<(
    data: ListingLifecycleJobData
  ) => Promise<void>> = []

  private metrics: QueueMetrics = {
    driver: 'local',
    waiting: 0,
    delayed: 0,
    active: 0,
    completed: 0,
    failed: 0,
    deadLettered: 0
  }

  async addListingLifecycleJob(
    data: ListingLifecycleJobData,
    options: {
      delayMs: number
      attempts: number
    }
  ) {
    if (this.handlers.length === 0) {
      throw new Error(
        'Listing lifecycle processor is not registered'
      )
    }

    this.add(
      {
        name: 'listing.lifecycle',
        payload: data,
        delayMs: options.delayMs,
        attempts: options.attempts
      },
      data => this.processWithRegisteredHandlers(data)
    )
  }

  processListingLifecycle(
    handler: (
      data: ListingLifecycleJobData
    ) => Promise<void>
  ) {
    this.handlers.push(handler)
  }

  async getMetrics() {
    return this.metrics
  }

  add<T>(
    job: DelayedJob<T>,
    handler: (payload: T) => Promise<void>
  ) {
    this.metrics.delayed += 1

    setTimeout(() => {
      this.run(job, handler, 1)
    }, job.delayMs)
  }

  private async run<T>(
    job: DelayedJob<T>,
    handler: (payload: T) => Promise<void>,
    attempt: number
  ) {
    try {
      this.metrics.delayed = Math.max(
        0,
        this.metrics.delayed - 1
      )
      this.metrics.active += 1

      await handler(job.payload)

      this.metrics.completed += 1
    } catch (error) {
      const maxAttempts = job.attempts ?? 1

      if (attempt >= maxAttempts) {
        this.metrics.failed += 1
        this.metrics.deadLettered += 1
        console.error(
          `Job ${job.name} failed permanently`,
          error
        )
        return
      }

      setTimeout(() => {
        this.run(job, handler, attempt + 1)
      }, job.delayMs)
    } finally {
      this.metrics.active = Math.max(
        0,
        this.metrics.active - 1
      )
    }
  }

  private async processWithRegisteredHandlers(
    data: ListingLifecycleJobData
  ) {
    await Promise.all(
      this.handlers.map(handler => handler(data))
    )
  }
}
