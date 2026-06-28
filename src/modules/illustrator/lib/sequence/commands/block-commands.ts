import type { SequenceCommand } from '@/modules/illustrator/lib/sequence/commands/command'
import type { HoldBlock, SequenceState } from '@/modules/illustrator/lib/sequence/sequence.types'
import { DEFAULT_BEHAVIOR } from '@/modules/illustrator/lib/sequence/sequence.types'
import { nextBlockId } from '@/modules/illustrator/lib/sequence/id-generator'

export type CreateHoldBlockPayload = {
  sequenceId: string
  trackId: string
  startTimeMs: number
  durationMs: number
  assetRefId: string
  label?: string
}

export function createHoldBlockCommand(payload: CreateHoldBlockPayload): SequenceCommand {
  let createdBlockId: string | null = null

  return {
    type: 'createHoldBlock',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const blockId = nextBlockId(sequence.blocks.map((b) => b.id))
      createdBlockId = blockId
      const block: HoldBlock = {
        id: blockId,
        trackId: payload.trackId,
        type: 'hold',
        startTimeMs: payload.startTimeMs,
        durationMs: payload.durationMs,
        label: payload.label ?? 'Hold',
        assetRefId: payload.assetRefId,
        behavior: DEFAULT_BEHAVIOR,
        modifiers: [],
      }
      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: {
            ...sequence,
            blocks: [...sequence.blocks, block],
          },
        },
        selection: { kind: 'blocks', ids: [blockId] },
      }
    },
    undo(state) {
      if (!createdBlockId) return state
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: {
            ...sequence,
            blocks: sequence.blocks.filter((b) => b.id !== createdBlockId),
          },
        },
        selection: { kind: 'empty' },
      }
    },
  }
}

export type MoveBlockPayload = {
  sequenceId: string
  blockId: string
  startTimeMs: number
  trackId?: string
}

export function createMoveBlockCommand(payload: MoveBlockPayload): SequenceCommand {
  let prev: { startTimeMs: number; trackId: string } | null = null

  return {
    type: 'moveBlock',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const blocks = sequence.blocks.map((b) => {
        if (b.id !== payload.blockId) return b
        if (!prev) prev = { startTimeMs: b.startTimeMs, trackId: b.trackId }
        return {
          ...b,
          startTimeMs: payload.startTimeMs,
          trackId: payload.trackId ?? b.trackId,
        }
      })
      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: { ...sequence, blocks },
        },
      }
    },
    undo(state) {
      if (!prev) return state
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const p = prev
      const blocks = sequence.blocks.map((b) =>
        b.id === payload.blockId ? { ...b, startTimeMs: p.startTimeMs, trackId: p.trackId } : b,
      )
      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: { ...sequence, blocks },
        },
      }
    },
  }
}

export type UpdateSelectionPayload = {
  selection: SequenceState['selection']
}

export function createUpdateSelectionCommand(payload: UpdateSelectionPayload): SequenceCommand {
  let prev: SequenceState['selection'] = { kind: 'empty' }

  return {
    type: 'updateSelection',
    execute(state) {
      prev = state.selection
      return { ...state, selection: payload.selection }
    },
    undo(state) {
      return { ...state, selection: prev }
    },
  }
}

export type ResizeHoldBlockPayload = {
  sequenceId: string
  blockId: string
  durationMs: number
}

/** Stretch hold block — same assetRefId per UX contract */
export function createResizeHoldBlockCommand(payload: ResizeHoldBlockPayload): SequenceCommand {
  let prevDuration = 0

  return {
    type: 'resizeHoldBlock',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const blocks = sequence.blocks.map((b) => {
        if (b.id !== payload.blockId || b.type !== 'hold') return b
        prevDuration = b.durationMs
        return { ...b, durationMs: Math.max(1, payload.durationMs) }
      })
      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: { ...sequence, blocks },
        },
      }
    },
    undo(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const blocks = sequence.blocks.map((b) =>
        b.id === payload.blockId && b.type === 'hold' ? { ...b, durationMs: prevDuration } : b,
      )
      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: { ...sequence, blocks },
        },
      }
    },
  }
}
