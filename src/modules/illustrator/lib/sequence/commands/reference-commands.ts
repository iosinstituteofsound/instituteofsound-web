import type { SequenceCommand } from '@/modules/illustrator/lib/sequence/commands/command'
import { nextBlockId, nextInstanceId } from '@/modules/illustrator/lib/sequence/id-generator'
import type {
  AnimationBlock,
  HoldBlock,
  ReferenceBlock,
  SequenceState,
} from '@/modules/illustrator/lib/sequence/sequence.types'

export type ConvertHoldToReferencePayload = {
  sequenceId: string
  blockId: string
  masterAssetRefId: string
  instanceId?: string
}

/** Replace hold block with a reference instance (master registered separately in AssetManager). */
export function createConvertHoldToReferenceCommand(
  payload: ConvertHoldToReferencePayload,
): SequenceCommand {
  let prevBlocks: AnimationBlock[] | null = null

  return {
    type: 'convertHoldToReference',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const source = sequence.blocks.find((b) => b.id === payload.blockId)
      if (!source || source.type !== 'hold') return state

      prevBlocks = sequence.blocks
      const hold = source as HoldBlock
      const reference: ReferenceBlock = {
        id: hold.id,
        type: 'reference',
        trackId: hold.trackId,
        startTimeMs: hold.startTimeMs,
        durationMs: hold.durationMs,
        label: hold.label,
        color: hold.color,
        locked: hold.locked,
        muted: hold.muted,
        opacity: hold.opacity,
        blendMode: hold.blendMode,
        behavior: hold.behavior,
        modifiers: hold.modifiers,
        instanceId: payload.instanceId ?? nextInstanceId([]),
        masterAssetRefId: payload.masterAssetRefId,
      }

      const blocks = sequence.blocks.map((b) => (b.id === hold.id ? reference : b))
      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: { ...sequence, blocks },
        },
        selection: { kind: 'blocks', ids: [reference.id] },
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
      }
    },
  }
}

export type DuplicateReferencePayload = {
  sequenceId: string
  sourceBlockId: string
  startTimeMs: number
  trackId?: string
}

export function createDuplicateReferenceCommand(payload: DuplicateReferencePayload): SequenceCommand {
  let createdId: string | null = null

  return {
    type: 'duplicateReference',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const source = sequence.blocks.find((b) => b.id === payload.sourceBlockId)
      if (!source || source.type !== 'reference') return state

      const ref = source as ReferenceBlock
      const newId = nextBlockId(sequence.blocks.map((b) => b.id))
      createdId = newId
      const duplicate: ReferenceBlock = {
        ...ref,
        id: newId,
        instanceId: nextInstanceId(sequence.blocks.filter((b) => b.type === 'reference').map((b) => (b as ReferenceBlock).instanceId)),
        trackId: payload.trackId ?? ref.trackId,
        startTimeMs: payload.startTimeMs,
        label: `${ref.label} (copy)`,
      }

      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: { ...sequence, blocks: [...sequence.blocks, duplicate] },
        },
        selection: { kind: 'blocks', ids: [newId] },
      }
    },
    undo(state) {
      if (!createdId) return state
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: {
            ...sequence,
            blocks: sequence.blocks.filter((b) => b.id !== createdId),
          },
        },
        selection: { kind: 'empty' },
      }
    },
  }
}

/** Count reference instances using a master across all open sequences. */
export function countMasterInstances(state: SequenceState, masterAssetRefId: string): number {
  let count = 0
  for (const sequence of Object.values(state.sequences)) {
    for (const block of sequence.blocks) {
      if (block.type === 'reference' && block.masterAssetRefId === masterAssetRefId) count += 1
    }
  }
  return count
}
