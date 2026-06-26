import type { FrameDocumentState } from '@/modules/illustrator/lib/studio-frame-store'
import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'

export type PlaybackMode = 'loop' | 'ping-pong' | 'one-shot'

export type AnimationAssistSettings = {
  playbackMode: PlaybackMode
  fps: number
  onionSkinFrames: number
  onionSkinOpacity: number
  blendPrimaryFrame: boolean
  onionSkinColorBefore: string
  onionSkinColorAfter: string
}

export type OnionSkinPreview = {
  before: LayerCanvasSnapshot[][]
  after: LayerCanvasSnapshot[][]
  opacity: number
  blendPrimary: boolean
  colorBefore: string
  colorAfter: string
}

export type TimelineTrack = {
  id: string
  label: string
  layerId?: string
  kind: 'layer' | 'audio' | 'background'
}

export type TimelineClip = {
  id: string
  trackId: string
  startFrame: number
  durationFrames: number
  label: string
  thumbUrl?: string
  source: 'layer' | 'library'
}

export type FrameThumb = {
  index: number
  previewUrl?: string
  state?: FrameDocumentState
}

export const DEFAULT_ANIMATION_SETTINGS: AnimationAssistSettings = {
  playbackMode: 'loop',
  fps: 15,
  onionSkinFrames: 8,
  onionSkinOpacity: 60,
  blendPrimaryFrame: false,
  onionSkinColorBefore: '#3ecf8e',
  onionSkinColorAfter: '#ff5a7a',
}

export const TIMELINE_CLIP_MIME = 'application/x-mas-timeline-clip'
