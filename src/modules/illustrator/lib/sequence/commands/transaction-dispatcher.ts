import {
  executeTransaction,
  undoTransaction,
  type CommandContext,
  type Transaction,
} from '@/modules/illustrator/lib/sequence/commands/command'
import type { SequenceState } from '@/modules/illustrator/lib/sequence/sequence.types'

export class TransactionDispatcher {
  private undoStack: Transaction[] = []
  private redoStack: Transaction[] = []
  private state: SequenceState
  private ctx: CommandContext

  constructor(initial: SequenceState, ctx?: Partial<CommandContext>) {
    this.state = initial
    this.ctx = { now: new Date().toISOString(), ...ctx }
  }

  getState(): Readonly<SequenceState> {
    return this.state
  }

  dispatch(transaction: Transaction): SequenceState {
    this.state = executeTransaction(this.state, transaction, this.ctx)
    this.undoStack.push(transaction)
    this.redoStack = []
    return this.state
  }

  undo(): SequenceState | null {
    const tx = this.undoStack.pop()
    if (!tx) return null
    this.state = undoTransaction(this.state, tx, this.ctx)
    this.redoStack.push(tx)
    return this.state
  }

  redo(): SequenceState | null {
    const tx = this.redoStack.pop()
    if (!tx) return null
    this.state = executeTransaction(this.state, tx, this.ctx)
    this.undoStack.push(tx)
    return this.state
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  replaceState(state: SequenceState): void {
    this.state = state
    this.undoStack = []
    this.redoStack = []
  }
}
