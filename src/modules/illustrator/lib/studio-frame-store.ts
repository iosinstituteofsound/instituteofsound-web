import type { CanvasElement } from '@/modules/illustrator/components/studio/studio-canvas-model'
import type { LayerCanvasSnapshot } from '@/modules/illustrator/components/studio/studio-layer-engine'
import { snapshotLayerCanvas } from '@/modules/illustrator/components/studio/studio-layer-engine'
import type { PaintLayer } from '@/modules/illustrator/components/studio/studio-layer-engine'

export type FrameDocumentState = {
  layers: LayerCanvasSnapshot[]
  elements: CanvasElement[]
}

type FrameKeyframe = {
  index: number
  state: FrameDocumentState
  changedLayerIds: string[]
}

/**
 * Sparse frame storage — only keyframes hold pixel data; intermediate frames inherit.
 * Scales to 100k+ timeline frames without 100k full-canvas copies.
 */
export class StudioFrameStore {
  private keyframes = new Map<number, FrameKeyframe>()
  private totalFrames = 1
  private lastKeyframeIndex = 0

  constructor(initial?: FrameDocumentState) {
    if (initial) {
      this.keyframes.set(0, { index: 0, state: initial, changedLayerIds: initial.layers.map((l) => l.id) })
    }
  }

  getTotalFrames() {
    return this.totalFrames
  }

  setTotalFrames(count: number) {
    this.totalFrames = Math.max(1, Math.floor(count))
  }

  captureKeyframe(
    frameIndex: number,
    layers: PaintLayer[],
    elements: CanvasElement[],
    changedLayerIds: string[],
    baseState?: FrameDocumentState,
  ) {
    const index = Math.max(0, Math.min(frameIndex, this.totalFrames - 1))
    const prev = this.resolveState(index, baseState)
    const nextLayers = prev.layers.map((snap) => {
      if (!changedLayerIds.includes(snap.id)) return snap
      const live = layers.find((layer) => layer.id === snap.id)
      return live ? snapshotLayerCanvas(live) : snap
    })
    const state: FrameDocumentState = { layers: nextLayers, elements: [...elements] }
    this.keyframes.set(index, { index, state, changedLayerIds: [...changedLayerIds] })
    this.lastKeyframeIndex = index
    return state
  }

  resolveState(frameIndex: number, fallback?: FrameDocumentState): FrameDocumentState {
    const clamped = Math.max(0, Math.min(frameIndex, this.totalFrames - 1))
    let nearest: FrameKeyframe | undefined
    for (const keyframe of this.keyframes.values()) {
      if (keyframe.index > clamped) continue
      if (!nearest || keyframe.index > nearest.index) nearest = keyframe
    }
    if (nearest) return nearest.state
    if (fallback) return fallback
    throw new Error('StudioFrameStore: no keyframe available')
  }

  getVisibleFrameRange(scrollLeft: number, viewportWidth: number, pixelsPerFrame: number) {
    const start = Math.max(0, Math.floor(scrollLeft / pixelsPerFrame) - 2)
    const visibleCount = Math.ceil(viewportWidth / pixelsPerFrame) + 4
    const end = Math.min(this.totalFrames - 1, start + visibleCount)
    return { start, end }
  }

  listKeyframeIndices() {
    return [...this.keyframes.keys()].sort((a, b) => a - b)
  }
}
