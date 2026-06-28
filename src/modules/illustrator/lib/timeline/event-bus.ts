export type TimelineEventMap = {
  'block.dragStart': { blockId: string; sequenceId: string }
  'block.dragEnd': { blockId: string; sequenceId: string; startTimeMs: number; trackId: string }
  'block.openInner': { blockId: string; innerSequenceId: string }
  'block.resizeStart': { blockId: string; edge: 'left' | 'right' }
  'block.resizeEnd': { blockId: string; durationMs: number }
  'drawing.committed': { assetRefId: string; trackId: string; layerId: string }
  'command.request': { transactionId: string; label: string }
  'playback.seek': { timeMs: number }
  'playback.toggle': Record<string, never>
  'selection.changed': { selection: unknown }
}

type Handler<T> = (payload: T) => void

/** UI → Transactions boundary. UI never mutates SequenceStore directly. */
export class TimelineEventBus {
  private handlers = new Map<string, Set<Handler<unknown>>>()

  on<K extends keyof TimelineEventMap>(event: K, handler: Handler<TimelineEventMap[K]>): () => void {
    const key = event as string
    if (!this.handlers.has(key)) this.handlers.set(key, new Set())
    const set = this.handlers.get(key)!
    set.add(handler as Handler<unknown>)
    return () => set.delete(handler as Handler<unknown>)
  }

  emit<K extends keyof TimelineEventMap>(event: K, payload: TimelineEventMap[K]): void {
    const set = this.handlers.get(event as string)
    if (!set) return
    for (const handler of set) handler(payload)
  }

  clear(): void {
    this.handlers.clear()
  }
}

export const timelineEventBus = new TimelineEventBus()
