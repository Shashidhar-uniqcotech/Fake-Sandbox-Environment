import { env } from '../config/env'
import { EmulatorEvent } from '../types/events'
import { JsonFileStore } from '../utils/json-file-store'

export class EventRepository {
  private readonly store =
    new JsonFileStore<EmulatorEvent[]>(
      env.eventLogPath,
      []
    )

  add(event: EmulatorEvent) {
    this.store.update(events => [
      event,
      ...events
    ])

    return event
  }

  findAll() {
    return this.store.read()
  }
}
