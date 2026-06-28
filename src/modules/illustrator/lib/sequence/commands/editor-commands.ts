import type { SequenceCommand } from '@/modules/illustrator/lib/sequence/commands/command'
import type {
  AnimationBlock,
  BlockBehavior,
  BlockModifier,
  HoldBlock,
  SequenceEngineSettings,
} from '@/modules/illustrator/lib/sequence/sequence.types'
import { nextBlockId } from '@/modules/illustrator/lib/sequence/id-generator'

export type SplitHoldBlockPayload = {
  sequenceId: string
  blockId: string
  splitTimeMs: number
}

/** Split hold block at playhead — both halves keep same assetRefId */
export function createSplitHoldBlockCommand(payload: SplitHoldBlockPayload): SequenceCommand {
  let prevBlocks: AnimationBlock[] | null = null

  return {
    type: 'splitHoldBlock',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const source = sequence.blocks.find((b) => b.id === payload.blockId)
      if (!source || source.type !== 'hold') return state

      const hold = source as HoldBlock
      const splitAt = Math.max(
        hold.startTimeMs + 1,
        Math.min(payload.splitTimeMs, hold.startTimeMs + hold.durationMs - 1),
      )
      const firstDuration = splitAt - hold.startTimeMs
      const secondDuration = hold.startTimeMs + hold.durationMs - splitAt
      if (firstDuration < 1 || secondDuration < 1) return state

      prevBlocks = sequence.blocks
      const newId = nextBlockId(sequence.blocks.map((b) => b.id))

      const first: HoldBlock = { ...hold, durationMs: firstDuration }
      const second: HoldBlock = {
        ...hold,
        id: newId,
        startTimeMs: splitAt,
        durationMs: secondDuration,
        label: `${hold.label} (2)`,
      }

      const blocks = sequence.blocks.flatMap((b) => (b.id === hold.id ? [first, second] : [b]))
      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: { ...sequence, blocks },
        },
        selection: { kind: 'blocks', ids: [first.id, second.id] },
      }
    },
    undo(state) {
      if (!prevBlocks) return state
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: { ...sequence, blocks: prevBlocks },
        },
        selection: { kind: 'blocks', ids: [payload.blockId] },
      }
    },
  }
}

export type UpdateBlockBehaviorPayload = {
  sequenceId: string
  blockId: string
  behavior: BlockBehavior
}

export function createUpdateBlockBehaviorCommand(payload: UpdateBlockBehaviorPayload): SequenceCommand {
  let prev: BlockBehavior | null = null

  return {
    type: 'updateBlockBehavior',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const blocks = sequence.blocks.map((b) => {
        if (b.id !== payload.blockId) return b
        prev = b.behavior
        return { ...b, behavior: payload.behavior }
      })
      return {
        ...state,
        sequences: { ...state.sequences, [payload.sequenceId]: { ...sequence, blocks } },
      }
    },
    undo(state) {
      if (!prev) return state
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const p = prev
      const blocks = sequence.blocks.map((b) => (b.id === payload.blockId ? { ...b, behavior: p } : b))
      return {
        ...state,
        sequences: { ...state.sequences, [payload.sequenceId]: { ...sequence, blocks } },
      }
    },
  }
}

export type UpdateBlockModifiersPayload = {
  sequenceId: string
  blockId: string
  modifiers: BlockModifier[]
}

export function createUpdateBlockModifiersCommand(payload: UpdateBlockModifiersPayload): SequenceCommand {
  let prev: BlockModifier[] = []

  return {
    type: 'updateBlockModifiers',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const blocks = sequence.blocks.map((b) => {
        if (b.id !== payload.blockId) return b
        prev = b.modifiers
        return { ...b, modifiers: payload.modifiers }
      })
      return {
        ...state,
        sequences: { ...state.sequences, [payload.sequenceId]: { ...sequence, blocks } },
      }
    },
    undo(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const blocks = sequence.blocks.map((b) =>
        b.id === payload.blockId ? { ...b, modifiers: prev } : b,
      )
      return {
        ...state,
        sequences: { ...state.sequences, [payload.sequenceId]: { ...sequence, blocks } },
      }
    },
  }
}

export type DeleteBlockPayload = {
  sequenceId: string
  blockId: string
  ripple?: boolean
}

export function createDeleteBlockCommand(payload: DeleteBlockPayload): SequenceCommand {
  let prevBlocks: AnimationBlock[] | null = null

  return {
    type: 'deleteBlock',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const target = sequence.blocks.find((b) => b.id === payload.blockId)
      if (!target) return state

      prevBlocks = sequence.blocks
      const gapMs = target.durationMs
      const deleteEnd = target.startTimeMs + target.durationMs

      let blocks = sequence.blocks.filter((b) => b.id !== payload.blockId)
      if (payload.ripple) {
        blocks = blocks.map((b) => {
          if (b.trackId !== target.trackId) return b
          if (b.startTimeMs >= deleteEnd) {
            return { ...b, startTimeMs: Math.max(0, b.startTimeMs - gapMs) }
          }
          return b
        })
      }

      return {
        ...state,
        sequences: { ...state.sequences, [payload.sequenceId]: { ...sequence, blocks } },
        selection: { kind: 'empty' },
      }
    },
    undo(state) {
      if (!prevBlocks) return state
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: { ...sequence, blocks: prevBlocks },
        },
        selection: { kind: 'blocks', ids: [payload.blockId] },
      }
    },
  }
}

export type UpdateSequenceSettingsPayload = {
  settings: Partial<SequenceEngineSettings>
}

export function createUpdateSequenceSettingsCommand(payload: UpdateSequenceSettingsPayload): SequenceCommand {
  let prev: SequenceEngineSettings | null = null

  return {
    type: 'updateSequenceSettings',
    execute(state) {
      prev = state.settings
      return { ...state, settings: { ...state.settings, ...payload.settings } }
    },
    undo(state) {
      if (!prev) return state
      return { ...state, settings: prev }
    },
  }
}
