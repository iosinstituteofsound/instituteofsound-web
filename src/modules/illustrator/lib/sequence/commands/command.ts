import type { SequenceState } from '@/modules/illustrator/lib/sequence/sequence.types'

export type CommandContext = {
  /** Reserved for asset manager lookups during command execution */
  readonly now: string
}

export interface SequenceCommand {
  readonly type: string
  execute(state: SequenceState, ctx: CommandContext): SequenceState
  undo(state: SequenceState, ctx: CommandContext): SequenceState
}

export type Transaction = {
  readonly id: string
  readonly label: string
  readonly commands: SequenceCommand[]
}

export function executeTransaction(
  state: SequenceState,
  transaction: Transaction,
  ctx: CommandContext,
): SequenceState {
  return transaction.commands.reduce((s, cmd) => cmd.execute(s, ctx), state)
}

export function undoTransaction(
  state: SequenceState,
  transaction: Transaction,
  ctx: CommandContext,
): SequenceState {
  return [...transaction.commands].reverse().reduce((s, cmd) => cmd.undo(s, ctx), state)
}
