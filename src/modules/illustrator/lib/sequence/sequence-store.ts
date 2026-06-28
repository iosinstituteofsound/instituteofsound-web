import { TransactionDispatcher } from '@/modules/illustrator/lib/sequence/commands/transaction-dispatcher'
import type { Transaction } from '@/modules/illustrator/lib/sequence/commands/command'
import { createTrackId } from '@/modules/illustrator/lib/sequence/id-generator'
import {
  DEFAULT_SEQUENCE_SETTINGS,
  type Sequence,
  type SequenceState,
} from '@/modules/illustrator/lib/sequence/sequence.types'

export function createDefaultSequence(id: string, name: string): Sequence {
  const now = new Date().toISOString()
  return {
    id,
    name,
    metadata: {
      fps: 24,
      resolution: { width: 2048, height: 2048 },
      durationMs: 5000,
      createdAt: now,
      updatedAt: now,
    },
    tracks: [
      {
        id: createTrackId('character'),
        label: 'Character',
        kind: 'character',
        sortIndex: 0,
      },
    ],
    blocks: [],
    markers: [],
  }
}

export function createInitialSequenceState(rootId = 'seq_root', name = 'Scene 1'): SequenceState {
  const root = createDefaultSequence(rootId, name)
  return {
    activeSequenceId: rootId,
    openTabIds: [rootId],
    sequences: { [rootId]: root },
    selection: { kind: 'empty' },
    editPath: [{ sequenceId: rootId, zoomLevel: 1 }],
    settings: { ...DEFAULT_SEQUENCE_SETTINGS },
  }
}

export class SequenceStore {
  private dispatcher: TransactionDispatcher
  private listeners = new Set<() => void>()

  constructor(initial?: SequenceState) {
    this.dispatcher = new TransactionDispatcher(initial ?? createInitialSequenceState())
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    for (const listener of this.listeners) listener()
  }

  getState(): Readonly<SequenceState> {
    return this.dispatcher.getState()
  }

  dispatch(transaction: Transaction): SequenceState {
    const next = this.dispatcher.dispatch(transaction)
    this.notify()
    return next
  }

  undo(): SequenceState | null {
    const next = this.dispatcher.undo()
    if (next) this.notify()
    return next
  }

  redo(): SequenceState | null {
    const next = this.dispatcher.redo()
    if (next) this.notify()
    return next
  }

  canUndo(): boolean {
    return this.dispatcher.canUndo()
  }

  canRedo(): boolean {
    return this.dispatcher.canRedo()
  }

  replaceState(state: SequenceState): void {
    this.dispatcher.replaceState(state)
    this.notify()
  }
}
