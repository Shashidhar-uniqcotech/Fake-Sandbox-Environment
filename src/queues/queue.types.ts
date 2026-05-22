export type ListingLifecycleJobData = {
  listingId: string
}

export type QueueMetrics = {
  driver: 'local' | 'bullmq'
  waiting: number
  delayed: number
  active: number
  completed: number
  failed: number
  deadLettered: number
}

export type ListingLifecycleQueue = {
  addListingLifecycleJob(
    data: ListingLifecycleJobData,
    options: {
      delayMs: number
      attempts: number
    }
  ): Promise<void>

  processListingLifecycle(
    handler: (
      data: ListingLifecycleJobData
    ) => Promise<void>
  ): void

  getMetrics(): Promise<QueueMetrics>
}
