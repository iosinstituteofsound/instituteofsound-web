import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Data } from '@measured/puck'
import { ArticleCanvasArtifactLayer } from '@/modules/editor/components/article-canvas-artifact-layer'
import { ArticleCanvasBlock } from '@/modules/editor/components/article-canvas-block'
import {
  ArticleCanvasLayersPanel,
  ArticleCanvasLayersRail,
} from '@/modules/editor/components/article-canvas-layers-panel'
import { ArticleCanvasGroupSelection } from '@/modules/editor/components/article-canvas-group-selection'
import type { ResizeHandle } from '@/modules/editor/components/article-canvas-selection'
import {
  computeGroupBounds,
  getBlockIdsInMarquee,
  normalizeMarqueeRect,
  type GroupBounds,
  type PixelRect,
} from '@/modules/editor/lib/canvas-marquee-utils'
import {
  addCanvasBlockWithId,
  ensureCanvasLayouts,
  IOS_BLOCK_PAYLOAD_MIME,
  IOS_BLOCK_TYPE_MIME,
  parseBlockLayout,
  parseBlockStyle,
  puckNeedsLayoutSync,
  removeCanvasBlocks,
  type AudioBlockDragPayload,
  updateCanvasBlock,
  updateCanvasBlockLayout,
  updateCanvasBlockStyle,
} from '@/modules/editor/lib/canvas-block-utils'
import {
  canvasBackgroundToStyle,
  readCanvasBackground,
} from '@/modules/editor/lib/canvas-background-utils'
import { readCanvasArtifact } from '@/modules/editor/lib/canvas-artifact-utils'
import {
  canvasEffectsFilterStyle,
  readCanvasEffects,
} from '@/modules/editor/lib/canvas-effects-utils'
import { ArticleCanvasEffectsOverlay } from '@/modules/editor/components/article-canvas-effects-overlay'
import { percentFromPointer, pointerAngle } from '@/modules/editor/lib/canvas-pointer-utils'
import type { CanvasBlockLayout } from '@/modules/editor/types/article-canvas.types'
import type { CanvasBlockType } from '@/modules/editor/types/article-canvas.types'
import type { CanvasPreviewMode } from '@/modules/editor/hooks/use-article-canvas-history'
import { cn } from '@/shared/lib/cn'

interface ArticleCanvasBoardProps {
  data: Data
  baselineData?: Data
  previewMode?: CanvasPreviewMode
  selectedBlockIds: string[]
  onChange: (data: Data) => void
  onSelectBlocks: (blockIds: string[]) => void
}

type BoardInteraction =
  | {
      kind: 'marquee'
      startX: number
      startY: number
    }
  | {
      kind: 'move'
      blockId: string
      offsetX: number
      offsetY: number
      boardRect: DOMRect
    }
  | {
      kind: 'move-group'
      blockIds: string[]
      startPointer: { x: number; y: number }
      startLayouts: Record<string, { x: number; y: number }>
      boardRect: DOMRect
    }
  | {
      kind: 'resize'
      blockId: string
      handle: ResizeHandle
      startX: number
      startY: number
      startLayout: CanvasBlockLayout
      startFontSize: number
    }
  | {
      kind: 'rotate'
      blockId: string
      centerX: number
      centerY: number
      startAngle: number
      startPointerAngle: number
    }

const MARQUEE_MIN_PX = 4

function boundsEqual(a: GroupBounds | null, b: GroupBounds | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height
}

function getBlockElement(board: HTMLElement, blockId: string): HTMLElement | null {
  return board.querySelector(`[data-block-id="${blockId}"]`)
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return Boolean(
    target.closest('.tiptap, .ProseMirror, [contenteditable], .article-inline-rich-text, .article-editor'),
  )
}

export function ArticleCanvasBoard({
  data,
  baselineData,
  previewMode = 'current',
  selectedBlockIds,
  onChange,
  onSelectBlocks,
}: ArticleCanvasBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const interactionRef = useRef<BoardInteraction | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragLayouts, setDragLayouts] = useState<Record<string, { x: number; y: number }> | null>(
    null,
  )
  const [marqueeRect, setMarqueeRect] = useState<PixelRect | null>(null)
  const [groupBounds, setGroupBounds] = useState<GroupBounds | null>(null)
  const [layersOpen, setLayersOpen] = useState(false)

  const normalized = ensureCanvasLayouts(data)
  const baselineNormalized = baselineData ? ensureCanvasLayouts(baselineData) : null
  const isOriginalPreview = previewMode === 'original' && Boolean(baselineNormalized)
  const isComparePreview = previewMode === 'compare' && Boolean(baselineNormalized)
  const activeData = isOriginalPreview && baselineNormalized ? baselineNormalized : normalized
  const canvasBackground = readCanvasBackground(activeData)
  const canvasBackgroundStyle = canvasBackground.hidden
    ? { background: 'transparent' }
    : canvasBackgroundToStyle(canvasBackground)
  const canvasArtifact = readCanvasArtifact(activeData)
  const canvasEffects = readCanvasEffects(activeData)
  const canvasEffectsFilter = canvasEffectsFilterStyle(canvasEffects)
  const isMultiSelect = selectedBlockIds.length > 1
  const selectedBlockIdsKey = selectedBlockIds.join(',')

  useLayoutEffect(() => {
    if (puckNeedsLayoutSync(data)) {
      onChange(ensureCanvasLayouts(data))
    }
  }, [data, onChange])

  const updateGroupBounds = useCallback(() => {
    if (!boardRef.current || selectedBlockIds.length < 2) {
      setGroupBounds((prev) => (prev === null ? prev : null))
      return
    }
    const ids = selectedBlockIdsKey.split(',').filter(Boolean)
    const next = computeGroupBounds(boardRef.current, ids)
    setGroupBounds((prev) => (boundsEqual(prev, next) ? prev : next))
  }, [selectedBlockIdsKey, selectedBlockIds.length])

  useLayoutEffect(() => {
    updateGroupBounds()
  }, [updateGroupBounds, selectedBlockIdsKey, draggingId, dragLayouts])

  const deleteSelectedBlocks = useCallback(() => {
    if (!selectedBlockIds.length) return
    onChange(removeCanvasBlocks(ensureCanvasLayouts(data), selectedBlockIds))
    onSelectBlocks([])
  }, [data, onChange, onSelectBlocks, selectedBlockIds])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return
      if (!selectedBlockIds.length) return
      if (isEditableTarget(event.target)) return

      event.preventDefault()
      deleteSelectedBlocks()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelectedBlocks, selectedBlockIds.length])

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const type = event.dataTransfer.getData(IOS_BLOCK_TYPE_MIME) as CanvasBlockType
    if (!type || !boardRef.current) return
    const rect = boardRef.current.getBoundingClientRect()
    const { x, y } = percentFromPointer(rect, event.clientX, event.clientY)
    const { data: next, blockId } = addCanvasBlockWithId(ensureCanvasLayouts(data), type, { x, y })

    const payloadRaw = event.dataTransfer.getData(IOS_BLOCK_PAYLOAD_MIME)
    if (payloadRaw) {
      try {
        const payload = JSON.parse(payloadRaw) as AudioBlockDragPayload
        onChange(updateCanvasBlock(next, blockId, { ...payload }))
        onSelectBlocks([blockId])
        return
      } catch {
        /* fall through */
      }
    }

    onChange(next)
    onSelectBlocks([blockId])
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const startMarquee = (clientX: number, clientY: number) => {
    interactionRef.current = { kind: 'marquee', startX: clientX, startY: clientY }
    setMarqueeRect(normalizeMarqueeRect(clientX, clientY, clientX, clientY))
  }

  const handleBoardPointerDown = (event: React.PointerEvent) => {
    if (isOriginalPreview) return
    if (event.button !== 0) return
    if (event.target !== boardRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    startMarquee(event.clientX, event.clientY)
  }

  const startMove = useCallback(
    (blockId: string, clientX: number, clientY: number) => {
      if (!boardRef.current) return
      const block = normalized.content.find(
        (item) => (item.props as Record<string, unknown>).blockId === blockId,
      )
      if (!block) return

      if (isMultiSelect && selectedBlockIds.includes(blockId)) {
        const startLayouts: Record<string, { x: number; y: number }> = {}
        for (const id of selectedBlockIds) {
          const item = normalized.content.find((b) => (b.props as Record<string, unknown>).blockId === id)
          if (!item) continue
          const layout = parseBlockLayout(
            (item.props as Record<string, unknown>).layout,
            item.type as CanvasBlockType,
            0,
          )
          startLayouts[id] = { x: layout.x, y: layout.y }
        }
        interactionRef.current = {
          kind: 'move-group',
          blockIds: selectedBlockIds,
          startPointer: percentFromPointer(boardRef.current.getBoundingClientRect(), clientX, clientY),
          startLayouts,
          boardRect: boardRef.current.getBoundingClientRect(),
        }
        setDragLayouts(startLayouts)
        setDraggingId('group')
        return
      }

      const layout = parseBlockLayout(
        (block.props as Record<string, unknown>).layout,
        block.type as CanvasBlockType,
        0,
      )
      const boardRect = boardRef.current.getBoundingClientRect()
      const pointer = percentFromPointer(boardRect, clientX, clientY)
      interactionRef.current = {
        kind: 'move',
        blockId,
        offsetX: pointer.x - layout.x,
        offsetY: pointer.y - layout.y,
        boardRect,
      }
      setDragLayouts({ [blockId]: { x: layout.x, y: layout.y } })
      setDraggingId(blockId)
      onSelectBlocks([blockId])
    },
    [isMultiSelect, normalized.content, onSelectBlocks, selectedBlockIds],
  )

  const startGroupMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!boardRef.current || selectedBlockIds.length < 2) return
      const startLayouts: Record<string, { x: number; y: number }> = {}
      for (const id of selectedBlockIds) {
        const item = normalized.content.find((b) => (b.props as Record<string, unknown>).blockId === id)
        if (!item) continue
        const layout = parseBlockLayout(
          (item.props as Record<string, unknown>).layout,
          item.type as CanvasBlockType,
          0,
        )
        startLayouts[id] = { x: layout.x, y: layout.y }
      }
      interactionRef.current = {
        kind: 'move-group',
        blockIds: selectedBlockIds,
        startPointer: percentFromPointer(boardRef.current.getBoundingClientRect(), clientX, clientY),
        startLayouts,
        boardRect: boardRef.current.getBoundingClientRect(),
      }
      setDragLayouts(startLayouts)
      setDraggingId('group')
    },
    [normalized.content, selectedBlockIds],
  )

  const startResize = useCallback(
    (blockId: string, handle: ResizeHandle, clientX: number, clientY: number) => {
      const block = normalized.content.find(
        (item) => (item.props as Record<string, unknown>).blockId === blockId,
      )
      if (!block) return
      const props = block.props as Record<string, unknown>
      const layout = parseBlockLayout(props.layout, block.type as CanvasBlockType, 0)
      const style = parseBlockStyle(props.style)
      interactionRef.current = {
        kind: 'resize',
        blockId,
        handle,
        startX: clientX,
        startY: clientY,
        startLayout: layout,
        startFontSize: style.fontSize,
      }
      setDraggingId(blockId)
      onSelectBlocks([blockId])
    },
    [normalized.content, onSelectBlocks],
  )

  const startRotate = useCallback(
    (blockId: string, clientX: number, clientY: number) => {
      if (!boardRef.current) return
      const block = normalized.content.find(
        (item) => (item.props as Record<string, unknown>).blockId === blockId,
      )
      if (!block) return
      const el = getBlockElement(boardRef.current, blockId)
      if (!el) return
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const style = parseBlockStyle((block.props as Record<string, unknown>).style)
      interactionRef.current = {
        kind: 'rotate',
        blockId,
        centerX,
        centerY,
        startAngle: style.angle,
        startPointerAngle: pointerAngle(centerX, centerY, clientX, clientY),
      }
      setDraggingId(blockId)
      onSelectBlocks([blockId])
    },
    [normalized.content, onSelectBlocks],
  )

  const onPointerMove = (event: React.PointerEvent) => {
    const interaction = interactionRef.current
    if (!interaction || !boardRef.current) return
    const boardRect = boardRef.current.getBoundingClientRect()
    const current = ensureCanvasLayouts(data)

    if (interaction.kind === 'marquee') {
      const rect = normalizeMarqueeRect(
        interaction.startX,
        interaction.startY,
        event.clientX,
        event.clientY,
      )
      setMarqueeRect(rect)
      return
    }

    if (interaction.kind === 'move-group') {
      const pointer = percentFromPointer(interaction.boardRect, event.clientX, event.clientY)
      const dx = pointer.x - interaction.startPointer.x
      const dy = pointer.y - interaction.startPointer.y
      const nextLayouts: Record<string, { x: number; y: number }> = {}
      for (const blockId of interaction.blockIds) {
        const start = interaction.startLayouts[blockId]
        if (!start) continue
        nextLayouts[blockId] = {
          x: Math.min(92, Math.max(2, start.x + dx)),
          y: Math.min(96, Math.max(2, start.y + dy)),
        }
      }
      setDragLayouts(nextLayouts)
      requestAnimationFrame(updateGroupBounds)
      return
    }

    if (interaction.kind === 'move') {
      const pointer = percentFromPointer(interaction.boardRect, event.clientX, event.clientY)
      setDragLayouts({
        [interaction.blockId]: {
          x: Math.min(92, Math.max(2, pointer.x - interaction.offsetX)),
          y: Math.min(96, Math.max(2, pointer.y - interaction.offsetY)),
        },
      })
      return
    }

    if (interaction.kind === 'rotate') {
      const pointer = pointerAngle(
        interaction.centerX,
        interaction.centerY,
        event.clientX,
        event.clientY,
      )
      const delta = pointer - interaction.startPointerAngle
      const angle = Math.round((interaction.startAngle + delta + 360) % 360)
      onChange(updateCanvasBlockStyle(current, interaction.blockId, { angle }))
      return
    }

    const dx = ((event.clientX - interaction.startX) / boardRect.width) * 100
    const dy = ((event.clientY - interaction.startY) / boardRect.height) * 100
    const { startLayout, handle, startFontSize } = interaction
    let nextX = startLayout.x
    let nextWidth = startLayout.width
    let nextFontSize = startFontSize

    const isLeft = handle === 'w' || handle === 'nw' || handle === 'sw'
    const isRight = handle === 'e' || handle === 'ne' || handle === 'se'
    const isTop = handle === 'n' || handle === 'nw' || handle === 'ne'
    const isBottom = handle === 's' || handle === 'sw' || handle === 'se'

    if (isRight) nextWidth = startLayout.width + dx
    if (isLeft) {
      nextWidth = startLayout.width - dx
      nextX = startLayout.x + dx
    }

    if (isTop) nextFontSize = Math.round(startFontSize - dy * 2)
    if (isBottom) nextFontSize = Math.round(startFontSize + dy * 2)

    nextWidth = Math.min(92, Math.max(12, nextWidth))
    nextX = Math.min(90, Math.max(2, nextX))
    nextFontSize = Math.min(400, Math.max(8, nextFontSize))

    const layoutPatch: Partial<CanvasBlockLayout> = { x: nextX, width: nextWidth }
    if (isLeft || isRight) layoutPatch.sizing = 'fixed'

    let nextData = updateCanvasBlockLayout(current, interaction.blockId, layoutPatch)
    if (nextFontSize !== startFontSize) {
      nextData = updateCanvasBlockStyle(nextData, interaction.blockId, { fontSize: nextFontSize })
    }
    onChange(nextData)
  }

  const endInteraction = useCallback(
    (event: React.PointerEvent) => {
      const interaction = interactionRef.current

      if (interaction?.kind === 'move' && dragLayouts?.[interaction.blockId]) {
        onChange(
          updateCanvasBlockLayout(ensureCanvasLayouts(data), interaction.blockId, dragLayouts[interaction.blockId]),
        )
      }

      if (interaction?.kind === 'move-group' && dragLayouts) {
        let nextData = ensureCanvasLayouts(data)
        for (const [blockId, layout] of Object.entries(dragLayouts)) {
          nextData = updateCanvasBlockLayout(nextData, blockId, layout)
        }
        onChange(nextData)
      }

      if (interaction?.kind === 'marquee' && boardRef.current) {
        const rect = normalizeMarqueeRect(
          interaction.startX,
          interaction.startY,
          event.clientX,
          event.clientY,
        )
        const width = rect.right - rect.left
        const height = rect.bottom - rect.top

        if (width >= MARQUEE_MIN_PX || height >= MARQUEE_MIN_PX) {
          const ids = getBlockIdsInMarquee(boardRef.current, rect)
          onSelectBlocks(ids)
        } else {
          onSelectBlocks([])
        }
      }

      interactionRef.current = null
      setDraggingId(null)
      setDragLayouts(null)
      setMarqueeRect(null)
    },
    [dragLayouts, data, onChange, onSelectBlocks],
  )

  const handleBlockSelect = (blockId: string, additive: boolean) => {
    if (additive) {
      onSelectBlocks(
        selectedBlockIds.includes(blockId)
          ? selectedBlockIds.filter((id) => id !== blockId)
          : [...selectedBlockIds, blockId],
      )
      return
    }
    onSelectBlocks([blockId])
  }

  const marqueeStyle = marqueeRect && boardRef.current
    ? (() => {
        const boardRect = boardRef.current!.getBoundingClientRect()
        return {
          left: marqueeRect.left - boardRect.left,
          top: marqueeRect.top - boardRect.top,
          width: marqueeRect.right - marqueeRect.left,
          height: marqueeRect.bottom - marqueeRect.top,
        }
      })()
    : null

  const renderBlocks = (blocks: Data, readOnly: boolean) =>
    blocks.content.map((block, index) => {
      const props = block.props as Record<string, unknown>
      const blockId = String(props.blockId ?? `fallback-${index}`)
      const isSelected = !readOnly && selectedBlockIds.includes(blockId)
      return (
        <ArticleCanvasBlock
          key={`${readOnly ? 'baseline-' : ''}${blockId}`}
          block={block}
          blockId={blockId}
          layoutOverride={readOnly ? undefined : dragLayouts?.[blockId]}
          selected={isSelected}
          showSelectionChrome={isSelected && selectedBlockIds.length === 1}
          dragging={!readOnly && (draggingId === blockId || draggingId === 'group')}
          onSelect={(additive) => {
            if (readOnly) return
            handleBlockSelect(blockId, additive)
          }}
          onUpdate={(patch) => {
            if (readOnly) return
            onChange(updateCanvasBlock(ensureCanvasLayouts(data), blockId, patch))
          }}
          onDelete={() => {
            if (readOnly) return
            const synced = ensureCanvasLayouts(data)
            onChange(removeCanvasBlocks(synced, [blockId]))
            onSelectBlocks(selectedBlockIds.filter((id) => id !== blockId))
          }}
          onMoveStart={(x, y) => {
            if (readOnly) return
            startMove(blockId, x, y)
          }}
          onResizeStart={(handle, x, y) => {
            if (readOnly) return
            startResize(blockId, handle, x, y)
          }}
          onRotateStart={(x, y) => {
            if (readOnly) return
            startRotate(blockId, x, y)
          }}
        />
      )
    })

  return (
    <div className="article-canvas-workspace relative min-h-full w-full">
      <div className="article-canvas-frame">
      {!layersOpen ? (
        <ArticleCanvasLayersRail open={layersOpen} onToggle={() => setLayersOpen(true)} />
      ) : null}
      <ArticleCanvasLayersPanel
        open={layersOpen}
        data={normalized}
        selectedBlockIds={selectedBlockIds}
        onChange={onChange}
        onSelectBlock={(blockId) => onSelectBlocks(blockId ? [blockId] : [])}
        onClose={() => setLayersOpen(false)}
      />

      <div
        ref={boardRef}
        className={cn(
          'article-canvas-board relative',
          layersOpen && 'article-canvas-board--layers-open',
          (draggingId || marqueeRect) && 'article-canvas-board--dragging',
          isOriginalPreview && 'article-canvas-board--original-preview',
          isComparePreview && 'article-canvas-board--compare-preview',
        )}
        style={canvasBackgroundStyle}
        onPointerDown={handleBoardPointerDown}
        onDragOver={isOriginalPreview ? undefined : handleDragOver}
        onDrop={isOriginalPreview ? undefined : handleDrop}
        onPointerMove={onPointerMove}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
      >
      <div className="article-canvas-board__stage min-h-full w-full" style={canvasEffectsFilter}>
      <ArticleCanvasArtifactLayer artifact={canvasArtifact} data={activeData} />

      {isComparePreview && baselineNormalized ? (
        <div className="article-canvas-baseline-ghost pointer-events-none absolute inset-0 z-[1]" aria-hidden>
          {renderBlocks(baselineNormalized, true)}
        </div>
      ) : null}

      {isOriginalPreview || isComparePreview ? (
        <div className="article-canvas-preview-badge">
          {isOriginalPreview ? 'Original' : 'Compare'}
        </div>
      ) : null}

      {activeData.content.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
          <p className="max-w-sm text-center text-sm text-muted-foreground/70">
            Drawing board — drag blocks from the Edit panel, or marquee-select on blank space.
          </p>
        </div>
      ) : null}

      {marqueeStyle && !isOriginalPreview ? (
        <div className="article-canvas-marquee" style={marqueeStyle} aria-hidden />
      ) : null}

      {renderBlocks(isOriginalPreview && baselineNormalized ? baselineNormalized : normalized, isOriginalPreview)}

      {isMultiSelect && groupBounds && !isOriginalPreview ? (
        <ArticleCanvasGroupSelection
          bounds={groupBounds}
          objectCount={selectedBlockIds.length}
          onDelete={() => {
            onChange(removeCanvasBlocks(ensureCanvasLayouts(data), selectedBlockIds))
            onSelectBlocks([])
          }}
          onMoveStart={startGroupMove}
        />
      ) : null}
      </div>
      <ArticleCanvasEffectsOverlay effects={canvasEffects} />
      </div>
      </div>
    </div>
  )
}
