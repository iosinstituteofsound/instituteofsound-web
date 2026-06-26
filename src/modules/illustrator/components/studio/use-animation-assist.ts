import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PaintLayer } from '@/modules/illustrator/components/studio/studio-layer-engine'
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
import { StudioFrameStore } from '@/modules/illustrator/lib/studio-frame-store'

type UseAnimationAssistOptions = {
  layers: PaintLayer[]
  layerThumbnails: Record<string, string>
  captureSnapshot: () => FrameDocumentState
  applySnapshot: (layers: FrameDocumentState['layers'], elements: FrameDocumentState['elements']) => void
  onOnionSkinPreviewChange?: (preview: OnionSkinPreview | null) => void
  pixelsPerFrame?: number
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function buildTracksFromLayers(layers: PaintLayer[]): TimelineTrack[] {
  return layers.map((layer) => ({
    id: layer.id,
    label: layer.name,
    layerId: layer.id,
    kind: layer.name === 'Background' ? 'background' : layer.name.toLowerCase().includes('audio') ? 'audio' : 'layer',
  }))
}

function mergeTracks(prev: TimelineTrack[], layers: PaintLayer[]): TimelineTrack[] {
  const layerTracks = buildTracksFromLayers(layers)
  const layerIds = new Set(layers.map((layer) => layer.id))
  const extras = prev.filter((track) => !track.layerId || !layerIds.has(track.layerId))
  const merged = [...layerTracks]
  for (const track of extras) {
    if (!merged.some((entry) => entry.id === track.id)) merged.push(track)
  }
  return merged
}

function layerTracksMatch(tracks: TimelineTrack[], layers: PaintLayer[]) {
  if (tracks.length < layers.length) return false
  for (let index = 0; index < layers.length; index += 1) {
    const track = tracks[index]
    const layer = layers[index]
    if (!track || track.layerId !== layer.id || track.label !== layer.name) return false
  }
  return true
}

function mergeTracksIfChanged(prev: TimelineTrack[], layers: PaintLayer[]): TimelineTrack[] {
  if (layerTracksMatch(prev, layers)) {
    const layerIds = new Set(layers.map((layer) => layer.id))
    const extras = prev.slice(layers.length).filter((track) => !track.layerId || !layerIds.has(track.layerId))
    if (extras.length === prev.length - layers.length) return prev
  }
  return mergeTracks(prev, layers)
}

const MAX_AUTO_SEED_CLIPS = 48

export function useAnimationAssist({
  layers,
  layerThumbnails,
  captureSnapshot,
  applySnapshot,
  onOnionSkinPreviewChange,
  pixelsPerFrame = 3,
}: UseAnimationAssistOptions) {
  const frameStoreRef = useRef<StudioFrameStore | null>(null)
  const playingRef = useRef(false)
  const directionRef = useRef<1 | -1>(1)
  const rafRef = useRef<number | null>(null)
  const lastTickRef = useRef(0)
  const scrubbingRef = useRef(false)

  const [settings, setSettings] = useState<AnimationAssistSettings>(DEFAULT_ANIMATION_SETTINGS)
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [colorsOpen, setColorsOpen] = useState(false)
  const [tracks, setTracks] = useState<TimelineTrack[]>(() => buildTracksFromLayers(layers))
  const [clips, setClips] = useState<TimelineClip[]>([])
  const [frameThumbs, setFrameThumbs] = useState<FrameThumb[]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [totalFrames, setTotalFrames] = useState(120)

  useEffect(() => {
    setTracks((prev) => mergeTracksIfChanged(prev, layers))
  }, [layers])

  useEffect(() => {
    if (frameStoreRef.current) return
    try {
      const initial = captureSnapshot()
      frameStoreRef.current = new StudioFrameStore(initial)
      frameStoreRef.current.setTotalFrames(totalFrames)
      const previewLayer = layers.find((layer) => layer.name !== 'Background')
      setFrameThumbs([
        {
          index: 0,
          previewUrl: previewLayer ? layerThumbnails[previewLayer.id] : undefined,
          state: initial,
        },
      ])
    } catch {
      frameStoreRef.current = new StudioFrameStore()
      frameStoreRef.current.setTotalFrames(totalFrames)
    }
  }, [captureSnapshot, layerThumbnails, layers, totalFrames])

  useEffect(() => {
    if (clips.length) return
    const seed: TimelineClip[] = []
    let seedIndex = 0
    for (let layerIndex = 0; layerIndex < layers.length && seed.length < MAX_AUTO_SEED_CLIPS; layerIndex += 1) {
      const layer = layers[layerIndex]
      if (layer.name === 'Background') continue
      seed.push({
        id: uid(),
        trackId: layer.id,
        startFrame: seedIndex * 24,
        durationFrames: 24,
        label: layer.name,
        thumbUrl: layerThumbnails[layer.id],
        source: 'layer',
      })
      seedIndex += 1
    }
    if (seed.length) setClips(seed)
  }, [clips.length, layerThumbnails, layers])

  const maxFrame = Math.max(0, totalFrames - 1)

  const resolveAndApply = useCallback(
    (frameIndex: number) => {
      const store = frameStoreRef.current
      if (!store) return
      try {
        const state = store.resolveState(frameIndex, captureSnapshot())
        applySnapshot(state.layers, state.elements)
      } catch {
        /* no keyframe yet */
      }
    },
    [applySnapshot, captureSnapshot],
  )

  const seekFrame = useCallback(
    (frame: number, options?: { apply?: boolean }) => {
      const clamped = Math.max(0, Math.min(frame, maxFrame))
      setCurrentFrame(clamped)
      if (options?.apply !== false && !playingRef.current) {
        resolveAndApply(clamped)
      }
    },
    [maxFrame, resolveAndApply],
  )

  const stopPlayback = useCallback(() => {
    playingRef.current = false
    setIsPlaying(false)
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const tickPlayback = useCallback(
    (timestamp: number) => {
      if (!playingRef.current) return
      const { fps, playbackMode } = settingsRef.current
      const elapsed = timestamp - lastTickRef.current
      const frameDuration = 1000 / Math.max(1, fps)
      if (elapsed >= frameDuration) {
        const steps = Math.floor(elapsed / frameDuration)
        lastTickRef.current = timestamp - (elapsed % frameDuration)
        setCurrentFrame((prev) => {
          let next = prev + steps * directionRef.current
          if (playbackMode === 'ping-pong') {
            if (next >= maxFrame) {
              next = maxFrame
              directionRef.current = -1
            } else if (next <= 0) {
              next = 0
              directionRef.current = 1
            }
          } else if (next >= maxFrame) {
            if (playbackMode === 'loop') {
              next = 0
            } else {
              next = maxFrame
              playingRef.current = false
              setIsPlaying(false)
            }
          } else if (next < 0) {
            next = 0
          }
          resolveAndApply(next)
          return next
        })
      }
      rafRef.current = requestAnimationFrame(tickPlayback)
    },
    [maxFrame, resolveAndApply],
  )

  const togglePlayback = useCallback(() => {
    if (playingRef.current) {
      stopPlayback()
      return
    }
    playingRef.current = true
    setIsPlaying(true)
    directionRef.current = 1
    lastTickRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tickPlayback)
  }, [stopPlayback, tickPlayback])

  const stepFrame = useCallback(
    (delta: number) => {
      stopPlayback()
      seekFrame(currentFrame + delta)
    },
    [currentFrame, seekFrame, stopPlayback],
  )

  const addFrame = useCallback(() => {
    const store = frameStoreRef.current
    if (!store) return
    const snapshot = captureSnapshot()
    const nextIndex = frameThumbs.length ? Math.max(...frameThumbs.map((thumb) => thumb.index)) + 1 : 0
    const frameIndex = Math.max(currentFrame, nextIndex)
    const previewLayer = layers.find((layer) => layer.name !== 'Background')
    const previewUrl = previewLayer ? layerThumbnails[previewLayer.id] : undefined

    store.captureKeyframe(
      frameIndex,
      layers,
      snapshot.elements,
      layers.map((layer) => layer.id),
      snapshot,
    )

    const nextTotal = Math.max(totalFrames, frameIndex + 1)
    store.setTotalFrames(nextTotal)
    setTotalFrames(nextTotal)
    setFrameThumbs((prev) => {
      const without = prev.filter((thumb) => thumb.index !== frameIndex)
      return [...without, { index: frameIndex, previewUrl, state: snapshot }].sort((a, b) => a.index - b.index)
    })
    seekFrame(frameIndex)
  }, [captureSnapshot, currentFrame, frameThumbs, layerThumbnails, layers, seekFrame, totalFrames])

  const addLibraryClip = useCallback(
    (trackId: string, startFrame: number, label = 'Library clip') => {
      const thumbUrl = layerThumbnails[trackId]
      setClips((prev) => [
        ...prev,
        {
          id: uid(),
          trackId,
          startFrame: Math.max(0, startFrame),
          durationFrames: 24,
          label,
          thumbUrl,
          source: 'library',
        },
      ])
    },
    [layerThumbnails],
  )

  const moveClip = useCallback((clipId: string, trackId: string, startFrame: number) => {
    setClips((prev) =>
      prev.map((clip) =>
        clip.id === clipId
          ? {
              ...clip,
              trackId,
              startFrame: Math.max(0, startFrame),
            }
          : clip,
      ),
    )
  }, [])

  const removeClip = useCallback((clipId: string) => {
    setClips((prev) => prev.filter((clip) => clip.id !== clipId))
  }, [])

  const updateSettings = useCallback((patch: Partial<AnimationAssistSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const setPlaybackMode = useCallback((playbackMode: PlaybackMode) => {
    setSettings((prev) => ({ ...prev, playbackMode }))
  }, [])

  const beginScrub = useCallback(() => {
    scrubbingRef.current = true
    stopPlayback()
  }, [stopPlayback])

  const endScrub = useCallback(() => {
    scrubbingRef.current = false
    resolveAndApply(currentFrame)
  }, [currentFrame, resolveAndApply])

  useEffect(() => () => stopPlayback(), [stopPlayback])

  const buildOnionSkinPreview = useCallback((): OnionSkinPreview | null => {
    const store = frameStoreRef.current
    const current = settingsRef.current
    if (!store || current.onionSkinFrames <= 0) return null

    const span = current.onionSkinFrames >= 12 ? 12 : current.onionSkinFrames
    const before: OnionSkinPreview['before'] = []
    const after: OnionSkinPreview['after'] = []

    for (let offset = 1; offset <= span; offset += 1) {
      const prevIndex = currentFrame - offset
      const nextIndex = currentFrame + offset
      if (prevIndex >= 0) {
        try {
          before.push(store.resolveState(prevIndex, captureSnapshot()).layers)
        } catch {
          /* no keyframe */
        }
      }
      if (nextIndex <= maxFrame) {
        try {
          after.push(store.resolveState(nextIndex, captureSnapshot()).layers)
        } catch {
          /* no keyframe */
        }
      }
    }

    if (!before.length && !after.length) return null

    return {
      before,
      after,
      opacity: current.onionSkinOpacity / 100,
      blendPrimary: current.blendPrimaryFrame,
      colorBefore: current.onionSkinColorBefore,
      colorAfter: current.onionSkinColorAfter,
    }
  }, [captureSnapshot, currentFrame, maxFrame])

  useEffect(() => {
    onOnionSkinPreviewChange?.(buildOnionSkinPreview())
  }, [buildOnionSkinPreview, onOnionSkinPreviewChange, settings, currentFrame])

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

  return {
    settings,
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
    togglePlayback,
    stopPlayback,
    stepFrame,
    seekFrame,
    addFrame,
    addLibraryClip,
    moveClip,
    removeClip,
    beginScrub,
    endScrub,
  }
}
