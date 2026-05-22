import { ListingStatus } from '../types/listing'

const allowedTransitions: Record<ListingStatus, ListingStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['VALIDATING'],
  VALIDATING: [
    'PROCESSING',
    'VALIDATION_FAILED'
  ],
  PROCESSING: [
    'DISCOVERABLE',
    'PROCESSING_FAILED'
  ],
  DISCOVERABLE: [],
  VALIDATION_FAILED: [],
  PROCESSING_FAILED: []
}

export class ListingStateMachine {
  canTransition(
    from: ListingStatus,
    to: ListingStatus
  ) {
    return allowedTransitions[from].includes(to)
  }

  assertTransition(
    from: ListingStatus,
    to: ListingStatus
  ) {
    if (!this.canTransition(from, to)) {
      throw new Error(
        `Invalid listing transition from ${from} to ${to}`
      )
    }
  }
}
