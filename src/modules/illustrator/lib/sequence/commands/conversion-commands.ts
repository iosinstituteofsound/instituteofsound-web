import type { SequenceCommand } from '@/modules/illustrator/lib/sequence/commands/command'
import { nextBlockId, nextSequenceId } from '@/modules/illustrator/lib/sequence/id-generator'
import type {
  AnimationBlock,
  HoldBlock,
  Sequence,
  SequenceBlock,
  SequenceState,
} from '@/modules/illustrator/lib/sequence/sequence.types'
import { DEFAULT_BEHAVIOR } from '@/modules/illustrator/lib/sequence/sequence.types'
import { frameIndexToMs, msToFrameIndex } from '@/modules/illustrator/lib/sequence/time/timecode'

export type ConvertHoldToSequencePayload = {
  sequenceId: string
  blockId: string
  fps: number
}

function frameDurationMs(fps: number): number {
  return Math.max(1, Math.round(frameIndexToMs(1, fps)))
}

export function resolveTrackForHold(
  sequence: Sequence,
  hold: HoldBlock,
): { track: Sequence['tracks'][number]; repairedTrackId?: string } | null {
  const byId = sequence.tracks.find((t) => t.id === hold.trackId)
  if (byId) return { track: byId }

  const withLayer = sequence.tracks.find((t) => t.layerId)
  if (withLayer) return { track: withLayer, repairedTrackId: withLayer.id }

  const fallback = sequence.tracks[0]
  return fallback ? { track: fallback, repairedTrackId: fallback.id } : null
}

/** Split hold duration into per-frame inner holds — same assetRefId on every frame. */
export function buildInnerSequenceFromHold(
  hold: HoldBlock,
  parentTrack: { id: string; label: string; layerId?: string; kind: string },
  fps: number,
  innerSequenceId: string,
): { sequence: Sequence; frameCount: number } {
  const frameMs = frameDurationMs(fps)
  const frameCount = Math.max(1, msToFrameIndex(hold.durationMs, fps))
  const innerDurationMs = frameCount * frameMs
  const now = new Date().toISOString()

  const innerTrackId = parentTrack.id.replace(/^track_/, 'track_inner_') || 'track_inner'
  const innerBlocks: HoldBlock[] = []
  let blockIds: string[] = []

  for (let i = 0; i < frameCount; i += 1) {
    const id = nextBlockId(blockIds)
    blockIds = [...blockIds, id]
    innerBlocks.push({
      id,
      type: 'hold',
      trackId: innerTrackId,
      startTimeMs: i * frameMs,
      durationMs: frameMs,
      label: `${hold.label} ${i + 1}`,
      assetRefId: hold.assetRefId,
      behavior: DEFAULT_BEHAVIOR,
      modifiers: [],
    })
  }

  const sequence: Sequence = {
    id: innerSequenceId,
    name: hold.label,
    metadata: {
      fps,
      resolution: { width: 2048, height: 2048 },
      durationMs: innerDurationMs,
      createdAt: now,
      updatedAt: now,
    },
    tracks: [
      {
        id: innerTrackId,
        label: parentTrack.label,
        kind: parentTrack.kind === 'audio' ? 'audio' : 'character',
        layerId: parentTrack.layerId,
        sortIndex: 0,
      },
    ],
    blocks: innerBlocks,
    markers: [],
  }

  return { sequence, frameCount }
}

export function createConvertHoldToSequenceCommand(payload: ConvertHoldToSequencePayload): SequenceCommand {
  let prevSequences: Record<string, Sequence> | null = null
  let prevBlocks: AnimationBlock[] | null = null
  let prevSelection: SequenceState['selection'] | null = null

  return {
    type: 'convertHoldToSequence',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const source = sequence.blocks.find((b) => b.id === payload.blockId)
      if (!source || source.type !== 'hold') return state

      const hold = source as HoldBlock
      const resolved = resolveTrackForHold(sequence, hold)
      if (!resolved) return state

      const { track: parentTrack, repairedTrackId } = resolved
      const holdForConvert = repairedTrackId ? { ...hold, trackId: repairedTrackId } : hold

      prevSequences = state.sequences
      prevBlocks = sequence.blocks
      prevSelection = state.selection

      const innerSequenceId = nextSequenceId(Object.keys(state.sequences))
      const built = buildInnerSequenceFromHold(holdForConvert, parentTrack, payload.fps, innerSequenceId)

      const sequenceBlock: SequenceBlock = {
        id: holdForConvert.id,
        type: 'sequence',
        trackId: holdForConvert.trackId,
        startTimeMs: holdForConvert.startTimeMs,
        durationMs: holdForConvert.durationMs,
        label: holdForConvert.label,
        color: holdForConvert.color,
        locked: holdForConvert.locked,
        muted: holdForConvert.muted,
        opacity: holdForConvert.opacity,
        blendMode: holdForConvert.blendMode,
        behavior: holdForConvert.behavior,
        modifiers: holdForConvert.modifiers,
        innerSequenceId,
      }

      const blocks = sequence.blocks.map((b) => (b.id === hold.id ? sequenceBlock : b))
      return {
        ...state,
        sequences: {
          ...state.sequences,
          [innerSequenceId]: built.sequence,
          [payload.sequenceId]: { ...sequence, blocks },
        },
        selection: { kind: 'blocks', ids: [sequenceBlock.id] },
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

export type ExpandSequenceToFramesPayload = {
  sequenceId: string
  blockId: string
}

export function createExpandSequenceToFramesCommand(payload: ExpandSequenceToFramesPayload): SequenceCommand {
  let prevSequences: Record<string, Sequence> | null = null
  let prevBlocks: AnimationBlock[] | null = null
  let prevSelection: SequenceState['selection'] | null = null

  return {
    type: 'expandSequenceToFrames',
    execute(state) {
      const sequence = state.sequences[payload.sequenceId]
      if (!sequence) return state
      const source = sequence.blocks.find((b) => b.id === payload.blockId)
      if (!source || source.type !== 'sequence') return state

      const seqBlock = source as SequenceBlock
      const inner = state.sequences[seqBlock.innerSequenceId]
      if (!inner) return state

      prevSequences = state.sequences
      prevBlocks = sequence.blocks
      prevSelection = state.selection

      const innerHolds = inner.blocks
        .filter((b): b is HoldBlock => b.type === 'hold')
        .sort((a, b) => a.startTimeMs - b.startTimeMs)

      const withoutSource = sequence.blocks.filter((b) => b.id !== seqBlock.id)
      const idPool = withoutSource.map((b) => b.id)
      const expandedBlocks: HoldBlock[] = []

      for (let i = 0; i < innerHolds.length; i += 1) {
        const innerHold = innerHolds[i]
        const id =
          i === 0 ? seqBlock.id : nextBlockId([...idPool, ...expandedBlocks.map((b) => b.id)])
        expandedBlocks.push({
          ...innerHold,
          id,
          trackId: seqBlock.trackId,
          startTimeMs: seqBlock.startTimeMs + innerHold.startTimeMs,
          durationMs: innerHold.durationMs,
        })
      }

      const blocks = [...withoutSource, ...expandedBlocks].sort((a, b) => a.startTimeMs - b.startTimeMs)

      return {
        ...state,
        sequences: {
          ...state.sequences,
          [payload.sequenceId]: { ...sequence, blocks },
        },
        selection: { kind: 'blocks', ids: expandedBlocks.map((b) => b.id) },
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

/** Unique sorted assetRefIds from blocks — round-trip gate compares sets, not frame counts. */
export function collectAssetRefIds(blocks: AnimationBlock[]): string[] {
  return [...new Set(blocks.filter((b): b is HoldBlock => b.type === 'hold').map((b) => b.assetRefId))].sort()
}
