import type { SequenceCommand } from '@/modules/illustrator/lib/sequence/commands/command'
import { nextBlockId, nextSequenceId } from '@/modules/illustrator/lib/sequence/id-generator'
import type {
  AnimationBlock,
  CompoundBlock,
  Sequence,
  SequenceState,
} from '@/modules/illustrator/lib/sequence/sequence.types'
import { DEFAULT_BEHAVIOR } from '@/modules/illustrator/lib/sequence/sequence.types'

export type GroupCompoundPayload = {
  sequenceId: string
  blockIds: string[]
  label?: string
}

export function createGroupCompoundCommand(payload: GroupCompoundPayload): SequenceCommand {
  let prevSequences: Record<string, Sequence> | null = null
  let prevBlocks: AnimationBlock[] | null = null
  let prevSelection: SequenceState['selection'] | null = null

  return {
    type: 'groupCompound',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      if (payload.blockIds.length < 2) return state

      const selected = payload.blockIds
        .map((id) => sequence.blocks.find((b) => b.id === id))
        .filter((b): b is AnimationBlock => Boolean(b))
      if (selected.length < 2) return state

      prevSequences = state.sequences
      prevBlocks = sequence.blocks
      prevSelection = state.selection

      const minStart = Math.min(...selected.map((b) => b.startTimeMs))
      const maxEnd = Math.max(...selected.map((b) => b.startTimeMs + b.durationMs))
      const durationMs = Math.max(1, maxEnd - minStart)
      const primaryTrackId = [...selected].sort((a, b) => a.startTimeMs - b.startTimeMs)[0].trackId

      const innerSequenceId = nextSequenceId(Object.keys(state.sequences))
      const now = new Date().toISOString()
      const trackIds = [...new Set(selected.map((b) => b.trackId))]
      const innerTracks = trackIds.map((trackId, index) => {
        const source = sequence.tracks.find((t) => t.id === trackId)
        return {
          id: trackId,
          label: source?.label ?? trackId,
          kind: source?.kind ?? ('character' as const),
          layerId: source?.layerId,
          sortIndex: index,
        }
      })

      const innerBlocks = selected.map((block) => ({
        ...block,
        startTimeMs: block.startTimeMs - minStart,
      }))

      const innerSequence: Sequence = {
        id: innerSequenceId,
        name: payload.label ?? 'Compound',
        metadata: {
          fps: sequence.metadata.fps,
          resolution: sequence.metadata.resolution,
          durationMs,
          createdAt: now,
          updatedAt: now,
        },
        tracks: innerTracks,
        blocks: innerBlocks,
        markers: [],
      }

      const compoundId = nextBlockId(sequence.blocks.map((b) => b.id))
      const compound: CompoundBlock = {
        id: compoundId,
        type: 'compound',
        trackId: primaryTrackId,
        startTimeMs: minStart,
        durationMs,
        label: payload.label ?? 'Compound',
        behavior: DEFAULT_BEHAVIOR,
        modifiers: [],
        innerSequenceId,
      }

      const remaining = sequence.blocks.filter((b) => !payload.blockIds.includes(b.id))
      const blocks = [...remaining, compound]

      return {
        ...state,
        sequences: {
          ...state.sequences,
          [innerSequenceId]: innerSequence,
          [payload.sequenceId]: { ...sequence, blocks },
        },
        selection: { kind: 'blocks', ids: [compoundId] },
      }
    },
    undo(state) {
      if (!prevSequences || !prevBlocks || !prevSelection) return state
      return {
        ...state,
        sequences: prevSequences,
        selection: prevSelection,
      }
    },
  }
}

export type UngroupCompoundPayload = {
  sequenceId: string
  blockId: string
}

export function createUngroupCompoundCommand(payload: UngroupCompoundPayload): SequenceCommand {
  let prevSequences: Record<string, Sequence> | null = null
  let prevBlocks: AnimationBlock[] | null = null
  let prevSelection: SequenceState['selection'] | null = null

  return {
    type: 'ungroupCompound',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const source = sequence.blocks.find((b) => b.id === payload.blockId)
      if (!source || source.type !== 'compound') return state

      const inner = state.sequences[source.innerSequenceId]
      if (!inner) return state

      prevSequences = state.sequences
      prevBlocks = sequence.blocks
      prevSelection = state.selection

      const restored = inner.blocks.map((block, index) => ({
        ...block,
        id: index === 0 ? source.id : nextBlockId([...sequence.blocks.map((b) => b.id), ...inner.blocks.slice(0, index).map((b) => b.id)]),
        startTimeMs: source.startTimeMs + block.startTimeMs,
      }))

      const withoutCompound = sequence.blocks.filter((b) => b.id !== source.id)
      const blocks = [...withoutCompound, ...restored].sort((a, b) => a.startTimeMs - b.startTimeMs)

      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: { ...sequence, blocks },
        },
        selection: { kind: 'blocks', ids: restored.map((b) => b.id) },
      }
    },
    undo(state) {
      if (!prevSequences || !prevBlocks || !prevSelection) return state
      return {
        ...state,
        sequences: prevSequences,
        selection: prevSelection,
      }
    },
  }
}
