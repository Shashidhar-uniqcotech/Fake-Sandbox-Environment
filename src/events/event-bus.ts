import { randomUUID } from 'crypto'
import { EventRepository } from '../repositories/event-repository'
import { EmulatorEventName } from '../types/events'

export class EventBus {
  constructor(
    private readonly eventRepository: EventRepository
  ) {}

  publish(input: {
    event: EmulatorEventName
    resourceType: 'listing' | 'inventory' | 'webhook'
    resourceId: string
    payload: Record<string, unknown>
  }) {
    return this.eventRepository.add({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input
    })
  }
}
