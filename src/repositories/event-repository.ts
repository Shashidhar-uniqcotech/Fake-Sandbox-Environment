import { prisma } from '../database/prisma'
import { EmulatorEvent } from '../types/events'
import { mapEvent } from './prisma-mappers'

export class EventRepository {
  async add(event: EmulatorEvent) {
    const saved = await prisma.emulatorEvent.create({
      data: {
        id: event.id,
        event: event.event,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        payload: event.payload as any
      }
    })

    return mapEvent(saved)
  }

  async findAll() {
    const events = await prisma.emulatorEvent.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return events.map(mapEvent)
  }
}
