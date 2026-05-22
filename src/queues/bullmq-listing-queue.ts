import {
  Job,
  Queue,
  Worker
} from 'bullmq'
import IORedis from 'ioredis'
import { env } from '../config/env'
import {
  ListingLifecycleJobData,
  ListingLifecycleQueue
} from './queue.types'

const listingLifecycleQueueName =
  'marketplace-sandbox-listing-lifecycle'

const deadLetterQueueName =
  'marketplace-sandbox-listing-lifecycle-dead-letter'

export class BullMqListingQueue
  implements ListingLifecycleQueue {
  private readonly handlers: Array<(
    data: ListingLifecycleJobData
  ) => Promise<void>> = []

  private readonly connection = new IORedis({
    host: env.queue.redis.host,
    port: env.queue.redis.port,
    maxRetriesPerRequest: null
  })

  private readonly queue =
    new Queue<ListingLifecycleJobData>(
      listingLifecycleQueueName,
      { connection: this.connection }
    )

  private readonly deadLetterQueue =
    new Queue<ListingLifecycleJobData>(
      deadLetterQueueName,
      { connection: this.connection }
    )

  private worker?: Worker<ListingLifecycleJobData>

  async addListingLifecycleJob(
    data: ListingLifecycleJobData,
    options: {
      delayMs: number
      attempts: number
    }
  ) {
    await this.queue.add(
      'listing.lifecycle',
      data,
      {
        delay: options.delayMs,
        attempts: options.attempts,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: {
          age: 60 * 60,
          count: 1000
        },
        removeOnFail: false
      }
    )
  }

  processListingLifecycle(
    handler: (
      data: ListingLifecycleJobData
    ) => Promise<void>
  ) {
    this.handlers.push(handler)

    if (this.worker) {
      return
    }

    this.worker = new Worker<ListingLifecycleJobData>(
      listingLifecycleQueueName,
      async (job: Job<ListingLifecycleJobData>) => {
        await Promise.all(
          this.handlers.map(registeredHandler =>
            registeredHandler(job.data)
          )
        )
      },
      {
        connection: this.connection,
        concurrency: 5
      }
    )

    this.worker.on(
      'failed',
      async (job, error) => {
        if (!job) {
          return
        }

        if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
          await this.deadLetterQueue.add(
            'listing.lifecycle.dead-letter',
            job.data,
            {
              removeOnComplete: false
            }
          )

          console.error(
            'Listing lifecycle job dead-lettered',
            {
              jobId: job.id,
              listingId: job.data.listingId,
              error: error.message
            }
          )
        }
      }
    )
  }

  async getMetrics() {
    const [
      counts,
      deadLetterCounts
    ] = await Promise.all([
      this.queue.getJobCounts(
        'waiting',
        'delayed',
        'active',
        'completed',
        'failed'
      ),
      this.deadLetterQueue.getJobCounts(
        'waiting',
        'delayed',
        'active',
        'completed',
        'failed'
      )
    ])

    return {
      driver: 'bullmq' as const,
      waiting: counts.waiting ?? 0,
      delayed: counts.delayed ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      deadLettered:
        (deadLetterCounts.waiting ?? 0) +
        (deadLetterCounts.delayed ?? 0) +
        (deadLetterCounts.active ?? 0) +
        (deadLetterCounts.completed ?? 0) +
        (deadLetterCounts.failed ?? 0)
    }
  }
}
