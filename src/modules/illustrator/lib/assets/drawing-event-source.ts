export type DrawingEventKind =
  | 'stroke'
  | 'erase'
  | 'fill'
  | 'transform'
  | 'merge'
  | 'mask'
  | 'snapshotCommitted'

export type DrawingEvent = {
  id: string
  kind: DrawingEventKind
  at: string
  payload: Record<string, unknown>
}

export type DrawingEventInput = {
  kind: DrawingEventKind
  payload: Record<string, unknown>
  at?: string
}

/** Event log per logical drawing — future replay, delta saves, CRDT. */
export class DrawingEventSource {
  private logs = new Map<string, DrawingEvent[]>()

  append(logicalId: string, input: DrawingEventInput): DrawingEvent {
    const event: DrawingEvent = {
      id: `evt_${logicalId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      kind: input.kind,
      at: input.at ?? new Date().toISOString(),
      payload: input.payload,
    }
    const list = this.logs.get(logicalId) ?? []
    list.push(event)
    this.logs.set(logicalId, list)
    return event
  }

  getEvents(logicalId: string): readonly DrawingEvent[] {
    return this.logs.get(logicalId) ?? []
  }

  eventsUpToVersion(logicalId: string, version: number): readonly DrawingEvent[] {
    return this.getEvents(logicalId).filter((event) => {
      const eventVersion = event.payload.version
      return typeof eventVersion === 'number' && eventVersion <= version
    })
  }

  clear(logicalId?: string): void {
    if (logicalId) this.logs.delete(logicalId)
    else this.logs.clear()
  }
}
