import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'

// --- Time & playback ---

export type BlockBehavior =
  | { kind: 'loop' }
  | { kind: 'ping-pong' }
  | { kind: 'one-shot' }
  | { kind: 'clamp' }
  | { kind: 'bounce' }

export type BlockModifier =
  | { type: 'speed'; rate: number }
  | { type: 'reverse' }
  | { type: 'trim'; inMs: number; outMs: number }
  | { type: 'freeze'; atTimeMs?: number }
  | { type: 'color'; tint: string; opacity: number }
  | { type: 'mirror'; axis: 'x' | 'y' }
  | { type: 'timeOffset'; offsetMs: number }

export const DEFAULT_BEHAVIOR: BlockBehavior = { kind: 'loop' }

// --- Assets (Sequence never stores pixels — refs only) ---

export type AssetKind = 'drawing' | 'master' | 'sequence' | 'video' | 'svg' | 'mesh' | 'particle'

export type AssetRef = {
  id: string
  assetId: string
  kind: AssetKind
  versionPin?: string
}

export type DrawingAsset = {
  id: string
  logicalId: string
  version: number
  parentVersionId?: string
  layerId: string
  label: string
  createdAt: string
  /** Opaque payload — resolved by AssetManager only */
  payloadRef: string
}

export type MasterAsset = {
  id: string
  label: string
  kind: 'hold' | 'sequence' | 'compound'
  innerSequenceId?: string
  assetRefId?: string
  thumbnailUrl?: string
}

// --- Blocks ---

export type BlockColor = string

export type BlockBase = {
  id: string
  trackId: string
  startTimeMs: number
  durationMs: number
  label: string
  color?: BlockColor
  locked?: boolean
  muted?: boolean
  opacity?: number
  blendMode?: string
  behavior: BlockBehavior
  modifiers: BlockModifier[]
}

export type HoldBlock = BlockBase & {
  type: 'hold'
  assetRefId: string
}

export type SequenceBlock = BlockBase & {
  type: 'sequence'
  innerSequenceId: string
}

export type ReferenceBlock = BlockBase & {
  type: 'reference'
  instanceId: string
  masterAssetRefId: string
  pinnedVersionId?: string
  instanceModifiers?: BlockModifier[]
}

export type CompoundBlock = BlockBase & {
  type: 'compound'
  innerSequenceId: string
}

export type AnimationBlock = HoldBlock | SequenceBlock | ReferenceBlock | CompoundBlock

// --- Tracks & sequences ---

export type TrackKind = 'character' | 'fx' | 'camera' | 'audio' | 'folder'

export type AnimationTrack = {
  id: string
  label: string
  kind: TrackKind
  layerId?: string
  parentId?: string
  collapsed?: boolean
  muted?: boolean
  color?: BlockColor
  sortIndex: number
}

export type MarkerType = 'note' | 'beat' | 'dialogue' | 'camera' | 'review'

export type Marker = {
  id: string
  timeMs: number
  type: MarkerType
  color: string
  comment: string
  linkedBlockId?: string
  linkedSequenceId?: string
}

export type SequenceMetadata = {
  fps: number
  resolution: { width: number; height: number }
  durationMs: number
  color?: string
  thumbnailDataUrl?: string
  author?: string
  createdAt: string
  updatedAt: string
  notes?: string
}

export type Sequence = {
  id: string
  name: string
  metadata: SequenceMetadata
  tracks: AnimationTrack[]
  blocks: AnimationBlock[]
  markers: Marker[]
}

export type EditPathNode = {
  sequenceId: string
  blockId?: string
  zoomLevel: number
}

// --- Selection ---

export type TimelineSelection =
  | { kind: 'empty' }
  | { kind: 'blocks'; ids: string[] }
  | { kind: 'tracks'; ids: string[] }
  | { kind: 'frames'; sequenceId: string; trackId: string; timeRangeMs: [number, number] }
  | { kind: 'layers'; layerIds: string[] }
  | { kind: 'markers'; ids: string[] }
  | { kind: 'mixed'; blocks: string[]; tracks: string[] }

// --- Project ---

export type SequenceEngineSettings = {
  fps: number
  onionSkinFrames: number
  onionSkinOpacity: number
  onionSkinColorBefore: string
  onionSkinColorAfter: string
  onionSkinEnabled: boolean
  rippleDelete: boolean
  snapEnabled: boolean
  playbackMode: 'loop' | 'ping-pong' | 'one-shot'
}

export const DEFAULT_SEQUENCE_SETTINGS: SequenceEngineSettings = {
  fps: 24,
  onionSkinFrames: 8,
  onionSkinOpacity: 60,
  onionSkinColorBefore: '#3ecf8e',
  onionSkinColorAfter: '#ff5a7a',
  onionSkinEnabled: false,
  rippleDelete: false,
  snapEnabled: true,
  playbackMode: 'loop',
}

export type SequenceState = {
  activeSequenceId: string
  openTabIds: string[]
  sequences: Record<string, Sequence>
  selection: TimelineSelection
  editPath: EditPathNode[]
  settings: SequenceEngineSettings
}

export type LayerComposite = {
  layers: Map<string, LayerCanvasSnapshot>
  cameraTransform?: CameraTransform
}

export type CameraTransform = {
  panX: number
  panY: number
  zoom: number
  rotation: number
}

export type CompositeResult = {
  composite: LayerComposite
  graphVersion: number
}
