import { env } from '../config/env'
import { BullMqListingQueue } from './bullmq-listing-queue'
import { LocalDelayedQueue } from './local-delayed-queue'
import { ListingLifecycleQueue } from './queue.types'

export const createListingLifecycleQueue =
  (): ListingLifecycleQueue => {
    if (env.queue.driver === 'bullmq') {
      return new BullMqListingQueue()
    }

    return new LocalDelayedQueue()
  }
