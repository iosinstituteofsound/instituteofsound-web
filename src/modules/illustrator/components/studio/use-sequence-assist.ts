import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { PaintLayer, LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { mergeCompositeIntoLayerSnapshots } from '@/modules/illustrator/components/studio/studio-layer-engine'
import {
  DEFAULT_ANIMATION_SETTINGS,
  type AnimationAssistSettings,
  type FrameThumb,
  type OnionSkinPreview,
  type PlaybackMode,
  type TimelineClip,
  type TimelineTrack,
} from '@/modules/illustrator/components/studio/studio-animation.types'
import type { FrameDocumentState } from '@/modules/illustrator/lib/studio-frame-store'
import { useSequenceEngine } from '@/modules/illustrator/context/sequence-engine-context'
import type { SequenceEngineSettings } from '@/modules/illustrator/lib/sequence/sequence.types'
import { toast } from '@/shared/components/ui/sonner'
import { msToFrameIndex, frameIndexToMs } from '@/modules/illustrator/lib/sequence/time/timecode'
import { buildSnapCandidates, snapTimeMs } from '@/modules/illustrator/lib/sequence/timeline/snap-engine'

type UseSequenceAssistOptions = {
  layers: PaintLayer[]
  layerThumbnails: Record<string, string>
  captureSnapshot: () => FrameDocumentState
  applySnapshot: (layers: LayerCanvasSnapshot[], elements: FrameDocumentState['elements']) => void
  onOnionSkinPreviewChange?: (preview: OnionSkinPreview | null) => void
  pixelsPerFrame?: number
}

function buildTracksFromSequence(
  tracks: { id: string; label: string; layerId?: string; kind: string }[],
): TimelineTrack[] {
  return tracks.map((track) => ({
    id: track.id,
    label: track.label,
    layerId: track.layerId,
    kind: track.kind === 'audio' ? 'audio' : 'layer',
  }))
}

export function useSequenceAssist({
  layers,
  layerThumbnails,
  captureSnapshot,
  applySnapshot,
  onOnionSkinPreviewChange,
  pixelsPerFrame = 3,
}: UseSequenceAssistOptions) {
  const { store, bridge, revision } = useSequenceEngine()
  const scrubbingRef = useRef(false)
  const playbackTickRef = useRef(0)
  const layersRef = useRef(layers)
  layersRef.current = layers

  const subscribeStore = useCallback((onChange: () => void) => store.subscribe(onChange), [store])
  const getStoreState = useCallback(() => store.getState(), [store])
  const sequenceState = useSyncExternalStore(subscribeStore, getStoreState, getStoreState)

  const seq = sequenceState.sequences[sequenceState.activeSequenceId]
  const fps = seq?.metadata.fps ?? sequenceState.settings.fps
  const settings = sequenceState.settings

  const subscribePlayback = useCallback(
    (onChange: () => void) => {
      playbackTickRef.current = window.setInterval(onChange, 33)
      return () => window.clearInterval(playbackTickRef.current)
    },
    [],
  )
  const getPlaybackSnapshot = useCallback(
    () => `${bridge.isPlaying()}:${bridge.getCurrentTimeMs()}`,
    [bridge],
  )
  useSyncExternalStore(subscribePlayback, getPlaybackSnapshot, () => '0:0')

  const timeMs = bridge.getCurrentTimeMs()
  const currentFrame = msToFrameIndex(timeMs, fps)
  const totalFrames = msToFrameIndex(seq?.metadata.durationMs ?? 5000, fps)
  const isPlaying = bridge.isPlaying()

  const selectedBlockIds =
    sequenceState.selection.kind === 'blocks' ? sequenceState.selection.ids : []

  useEffect(() => {
    bridge.syncTracksFromLayers(layers)
  }, [bridge, layers])

  const resolveAndApply = useCallback(
    (frame: number) => {
      const tMs = frameIndexToMs(frame, fps)
      const evaluated = bridge.evaluateComposite(tMs)
      const linkedLayerIds = new Set(
        (seq?.tracks ?? []).map((t) => t.layerId).filter((id): id is string => Boolean(id)),
      )
      const layerSnaps = mergeCompositeIntoLayerSnapshots(layersRef.current, evaluated, linkedLayerIds)
      applySnapshot(layerSnaps, captureSnapshot().elements)
    },
    [applySnapshot, bridge, captureSnapshot, fps, seq?.tracks],
  )

  useEffect(() => {
    if (!isPlaying && !scrubbingRef.current) {
      resolveAndApply(currentFrame)
    }
  }, [currentFrame, isPlaying, resolveAndApply, revision])

  useEffect(() => {
    if (isPlaying) resolveAndApply(currentFrame)
  }, [currentFrame, isPlaying, resolveAndApply])

  const buildOnionSkinPreview = useCallback((): OnionSkinPreview | null => {
    if (!settings.onionSkinEnabled || settings.onionSkinFrames <= 0) return null
    const span = Math.min(settings.onionSkinFrames, 12)
    const before: LayerCanvasSnapshot[][] = []
    const after: LayerCanvasSnapshot[][] = []

    for (let offset = 1; offset <= span; offset += 1) {
      const prevFrame = currentFrame - offset
      const nextFrame = currentFrame + offset
      if (prevFrame >= 0) before.push(bridge.evaluateComposite(frameIndexToMs(prevFrame, fps)))
      if (nextFrame <= totalFrames) after.push(bridge.evaluateComposite(frameIndexToMs(nextFrame, fps)))
    }

    if (!before.length && !after.length) return null
    return {
      before,
      after,
      opacity: settings.onionSkinOpacity / 100,
      blendPrimary: false,
      colorBefore: settings.onionSkinColorBefore,
      colorAfter: settings.onionSkinColorAfter,
    }
  }, [bridge, currentFrame, fps, settings, totalFrames])

  useEffect(() => {
    onOnionSkinPreviewChange?.(buildOnionSkinPreview())
  }, [buildOnionSkinPreview, onOnionSkinPreviewChange, currentFrame, settings])

  const tracks = useMemo(() => buildTracksFromSequence(seq?.tracks ?? []), [seq?.tracks])

  const clips = useMemo((): TimelineClip[] => {
    if (!seq) return []
    return seq.blocks
      .filter((b) => b.type === 'hold' || b.type === 'sequence' || b.type === 'compound' || b.type === 'reference')
      .map((block) => {
        const layerId = seq.tracks.find((t) => t.id === block.trackId)?.layerId
        const innerFrameCount =
          block.type === 'sequence' || block.type === 'compound'
            ? sequenceState.sequences[block.innerSequenceId]?.blocks.filter((b) => b.type === 'hold').length
            : undefined
        return {
          id: block.id,
          trackId: block.trackId,
          startFrame: msToFrameIndex(block.startTimeMs, fps),
          durationFrames: Math.max(1, msToFrameIndex(block.durationMs, fps)),
          label: block.label,
          thumbUrl: layerId ? layerThumbnails[layerId] : undefined,
          source: 'layer' as const,
          blockKind: block.type,
          innerFrameCount,
        }
      })
  }, [fps, layerThumbnails, seq, sequenceState.sequences])

  const clipsByTrack = useMemo(() => {
    const map = new Map<string, TimelineClip[]>()
    for (const clip of clips) {
      const list = map.get(clip.trackId)
      if (list) list.push(clip)
      else map.set(clip.trackId, [clip])
    }
    return map
  }, [clips])

  const trackIndexById = useMemo(() => {
    const map = new Map<string, number>()
    for (let index = 0; index < tracks.length; index += 1) {
      map.set(tracks[index].id, index)
    }
    return map
  }, [tracks])

  const assistSettings: AnimationAssistSettings = useMemo(
    () => ({
      ...DEFAULT_ANIMATION_SETTINGS,
      fps,
      playbackMode: settings.playbackMode,
      onionSkinFrames: settings.onionSkinFrames,
      onionSkinOpacity: settings.onionSkinOpacity,
      onionSkinColorBefore: settings.onionSkinColorBefore,
      onionSkinColorAfter: settings.onionSkinColorAfter,
    }),
    [fps, settings],
  )

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [colorsOpen, setColorsOpen] = useState(false)
  const [blockZoomLevel, setBlockZoomLevel] = useState(1)

  const editPath = useMemo(() => bridge.getEditPath(), [bridge, sequenceState])
  const isNestedEdit = editPath.length > 1

  const snapFrame = useCallback(
    (frame: number, excludeBlockId?: string) => {
      if (!seq || !settings.snapEnabled) return { frame, snapped: false as const }
      const candidates = buildSnapCandidates({
        playheadMs: bridge.getCurrentTimeMs(),
        blocks: seq.blocks.map((b) => ({
          id: b.id,
          startTimeMs: b.startTimeMs,
          durationMs: b.durationMs,
        })),
        excludeBlockId,
      })
      const result = snapTimeMs(frameIndexToMs(frame, fps), candidates)
      return {
        frame: msToFrameIndex(result.snappedTimeMs, fps),
        snapped: Boolean(result.snapPoint),
      }
    },
    [bridge, fps, seq, settings.snapEnabled],
  )

  const seekFrame = useCallback(
    (frame: number, options?: { apply?: boolean }) => {
      const clamped = Math.max(0, Math.min(frame, Math.max(0, totalFrames - 1)))
      const timeMs = frameIndexToMs(clamped, fps)
      if (scrubbingRef.current) {
        bridge.seekScrub(timeMs)
      } else {
        bridge.seek(timeMs)
      }
      const shouldApply = options?.apply !== false && !scrubbingRef.current
      if (shouldApply) resolveAndApply(clamped)
    },
    [bridge, fps, resolveAndApply, totalFrames],
  )

  const togglePlayback = useCallback(() => {
    bridge.togglePlayback()
  }, [bridge])

  const stopPlayback = useCallback(() => {
    bridge.pause()
  }, [bridge])

  const stepFrame = useCallback(
    (delta: number) => {
      stopPlayback()
      seekFrame(currentFrame + delta)
    },
    [currentFrame, seekFrame, stopPlayback],
  )

  const beginScrub = useCallback(() => {
    scrubbingRef.current = true
    stopPlayback()
  }, [stopPlayback])

  const endScrub = useCallback(() => {
    scrubbingRef.current = false
    resolveAndApply(currentFrame)
  }, [currentFrame, resolveAndApply])

  const moveClip = useCallback(
    (clipId: string, trackId: string, startFrame: number) => {
      bridge.moveBlock(clipId, trackId, frameIndexToMs(startFrame, fps))
    },
    [bridge, fps],
  )

  const resizeHoldClip = useCallback(
    (clipId: string, durationFrames: number) => {
      bridge.resizeHoldBlock(clipId, Math.max(1, frameIndexToMs(durationFrames, fps)))
    },
    [bridge, fps],
  )

  const selectClip = useCallback(
    (clipId: string, options?: { additive?: boolean }) => {
      bridge.selectBlock(clipId, options)
    },
    [bridge],
  )

  const groupSelectedBlocks = useCallback(() => {
    return bridge.groupSelectedBlocks()
  }, [bridge])

  const ungroupSelectedCompound = useCallback(() => {
    const id = selectedBlockIds[0]
    if (!id) return false
    return bridge.ungroupCompound(id)
  }, [bridge, selectedBlockIds])

  const convertSelectedToReference = useCallback(() => {
    const id = selectedBlockIds[0]
    if (!id) {
      toast.error('Pehle timeline pe clip select karo')
      return false
    }
    const block = seq?.blocks.find((b) => b.id === id)
    if (block?.type !== 'hold') {
      toast.error('Sirf hold clip reference ban sakta hai')
      return false
    }
    if (bridge.convertHoldToReference(id)) {
      toast.success('Converted to Reference')
      return true
    }
    toast.error('Reference convert fail')
    return false
  }, [bridge, selectedBlockIds, seq?.blocks])

  const duplicateSelectedReference = useCallback(() => {
    const id = selectedBlockIds[0]
    if (!id) return false
    const block = seq?.blocks.find((b) => b.id === id)
    if (block?.type !== 'reference') {
      toast.error('Sirf reference clip duplicate ho sakta hai')
      return false
    }
    if (bridge.duplicateReferenceInstance(id)) {
      toast.success('Reference instance duplicated')
      return true
    }
    return false
  }, [bridge, selectedBlockIds, seq?.blocks])

  const splitSelectedAtPlayhead = useCallback(() => {
    const id = selectedBlockIds[0]
    if (!id || !seq) return
    const block = seq.blocks.find((b) => b.id === id)
    if (!block || block.type !== 'hold') return
    const t = bridge.getCurrentTimeMs()
    if (t <= block.startTimeMs || t >= block.startTimeMs + block.durationMs) return
    bridge.splitHoldBlockAtPlayhead(id, t)
  }, [bridge, selectedBlockIds, seq])

  const deleteSelected = useCallback(() => {
    for (const id of selectedBlockIds) bridge.deleteBlock(id)
  }, [bridge, selectedBlockIds])

  const convertSelectedToSequence = useCallback(() => {
    const id = selectedBlockIds[0]
    if (!id) {
      toast.error('Pehle timeline pe clip select karo')
      return
    }
    const block = seq?.blocks.find((b) => b.id === id)
    if (block?.type !== 'hold') {
      toast.error('Sirf hold clip convert ho sakta hai')
      return
    }
    const count = bridge.convertHoldToSequence(id)
    if (count) toast.success(`Converted to Sequence (${count} frames)`)
    else toast.error('Convert fail — clip dubara select karke try karo')
  }, [bridge, selectedBlockIds, seq?.blocks])

  const expandSelectedToFrames = useCallback(() => {
    const id = selectedBlockIds[0]
    if (!id) return
    const count = bridge.expandSequenceToFrames(id)
    if (count) toast.success(`Expanded to ${count} frames`)
  }, [bridge, selectedBlockIds])

  const openInnerClip = useCallback(
    (clipId: string) => {
      const block = seq?.blocks.find((b) => b.id === clipId)
      if (block?.type !== 'sequence' && block?.type !== 'compound') {
        toast.error('Ye clip sequence nahi hai — pehle Convert karo')
        return
      }
      if (bridge.openInnerBlock(clipId)) {
        const path = bridge.getEditPath()
        const inner = path[path.length - 1]
        toast.success(`Editing ${inner?.label ?? 'sequence'}`)
      } else {
        toast.error('Inner sequence open nahi hua')
      }
    },
    [bridge, seq?.blocks],
  )

  const closeInnerEdit = useCallback(() => {
    bridge.closeInnerEdit()
  }, [bridge])

  const zoomSelectedBlock = useCallback((delta: number) => {
    setBlockZoomLevel((level) => Math.max(1, Math.min(4, level + delta)))
  }, [])

  const updateSettings = useCallback(
    (patch: Partial<SequenceEngineSettings>) => {
      bridge.updateSettings(patch)
    },
    [bridge],
  )

  const setPlaybackMode = useCallback(
    (playbackMode: PlaybackMode) => {
      bridge.updateSettings({ playbackMode })
    },
    [bridge],
  )

  const previewBlock = useCallback(
    (blockId: string) => bridge.evaluateBlockPreview(blockId),
    [bridge],
  )

  const removeClip = useCallback(() => deleteSelected(), [deleteSelected])
  const addFrame = useCallback(() => {}, [])
  const addLibraryClip = useCallback(() => {}, [])

  const frameThumbs: FrameThumb[] = useMemo(() => [], [])

  return {
    settings: assistSettings,
    settingsOpen,
    setSettingsOpen,
    colorsOpen,
    setColorsOpen,
    updateSettings,
    setPlaybackMode,
    tracks,
    clips,
    clipsByTrack,
    trackIndexById,
    frameThumbs,
    currentFrame,
    totalFrames,
    isPlaying,
    pixelsPerFrame,
    selectedBlockIds,
    snapFrame,
    onionSkinEnabled: settings.onionSkinEnabled,
    rippleDelete: settings.rippleDelete,
    editPath,
    isNestedEdit,
    blockZoomLevel,
    convertSelectedToSequence,
    expandSelectedToFrames,
    groupSelectedBlocks,
    ungroupSelectedCompound,
    convertSelectedToReference,
    duplicateSelectedReference,
    openInnerClip,
    closeInnerEdit,
    zoomSelectedBlock,
    togglePlayback,
    stopPlayback,
    stepFrame,
    seekFrame,
    addFrame,
    addLibraryClip,
    moveClip,
    resizeHoldClip,
    selectClip,
    splitSelectedAtPlayhead,
    deleteSelected,
    removeClip,
    beginScrub,
    endScrub,
    previewBlock,
  }
}
