import { useCallback, useRef, useState, type RefObject } from 'react'
import type { Data } from '@measured/puck'
import { ArticleCanvasBlock } from '@/modules/editor/components/article-canvas-block'
import type { ResizeHandle } from '@/modules/editor/components/article-canvas-selection'
import {
  ensureCanvasLayouts,
  getFreeCanvasBlocks,
  parseBlockLayout,
  parseBlockStyle,
  removeCanvasBlocks,
  updateCanvasBlock,
  updateCanvasBlockLayout,
  updateCanvasBlockStyle,
} from '@/modules/editor/lib/canvas-block-utils'
import { percentFromPointer, pointerAngle } from '@/modules/editor/lib/canvas-pointer-utils'
import { computeTextBlockResize } from '@/modules/editor/lib/canvas-text-resize-utils'
import type { CanvasBlockLayout } from '@/modules/editor/types/article-canvas.types'
import type { CanvasBlockType } from '@/modules/editor/types/article-canvas.types'

interface ArticleLiveFreeBlocksLayerProps {
  boardRef: RefObject<HTMLDivElement | null>
  data: Data
  selectedBlockIds: string[]
  onChange: (data: Data) => void
  onSelectBlocks: (blockIds: string[]) => void
  readOnly?: boolean
}

type FreeBlockInteraction =
  | {
      kind: 'move'
      blockId: string
      offsetX: number
      offsetY: number
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
      preserveAspectRatio: boolean
    }
  | {
      kind: 'rotate'
      blockId: string
      centerX: number
      centerY: number
      startAngle: number
      startPointerAngle: number
    }

function getBlockElement(board: HTMLElement, blockId: string): HTMLElement | null {
  return board.querySelector(`[data-block-id="${blockId}"]`)
}

export function ArticleLiveFreeBlocksLayer({
  boardRef,
  data,
  selectedBlockIds,
  onChange,
  onSelectBlocks,
  readOnly = false,
}: ArticleLiveFreeBlocksLayerProps) {
  const interactionRef = useRef<FreeBlockInteraction | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragLayouts, setDragLayouts] = useState<Record<string, { x: number; y: number }> | null>(
    null,
  )

  const normalized = ensureCanvasLayouts(data)
  const freeBlocks = getFreeCanvasBlocks(normalized)

  const startMove = useCallback(
    (blockId: string, clientX: number, clientY: number) => {
      if (!boardRef.current) return
      const block = normalized.content.find(
        (item) => String((item.props as Record<string, unknown>).blockId) === blockId,
      )
      if (!block) return

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
    [boardRef, normalized.content, onSelectBlocks],
  )

  const startResize = useCallback(
    (blockId: string, handle: ResizeHandle, clientX: number, clientY: number) => {
      const block = normalized.content.find(
        (item) => String((item.props as Record<string, unknown>).blockId) === blockId,
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
        preserveAspectRatio: style.preserveAspectRatio,
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
        (item) => String((item.props as Record<string, unknown>).blockId) === blockId,
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
    [boardRef, normalized.content, onSelectBlocks],
  )

  const onPointerMove = (event: React.PointerEvent) => {
    const interaction = interactionRef.current
    if (!interaction) return

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
      onChange(
        updateCanvasBlockStyle(ensureCanvasLayouts(data), interaction.blockId, {
          angle: interaction.startAngle + delta,
        }),
      )
      return
    }

    if (interaction.kind === 'resize' && boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect()
      const dx = ((event.clientX - interaction.startX) / boardRect.width) * 100
      const dy = ((event.clientY - interaction.startY) / boardRect.height) * 100

      const { layout: layoutPatch, fontSize: nextFontSize } = computeTextBlockResize({
        handle: interaction.handle,
        startLayout: interaction.startLayout,
        startFontSize: interaction.startFontSize,
        dx,
        dy,
        preserveAspectRatio: interaction.preserveAspectRatio,
      })

      let nextData = updateCanvasBlockLayout(ensureCanvasLayouts(data), interaction.blockId, layoutPatch)
      if (nextFontSize !== undefined) {
        nextData = updateCanvasBlockStyle(nextData, interaction.blockId, { fontSize: nextFontSize })
      }
      onChange(nextData)
    }
  }

  const onPointerUp = () => {
    const interaction = interactionRef.current

    if (interaction?.kind === 'move' && dragLayouts?.[interaction.blockId]) {
      onChange(
        updateCanvasBlockLayout(ensureCanvasLayouts(data), interaction.blockId, dragLayouts[interaction.blockId]),
      )
    }

    interactionRef.current = null
    setDraggingId(null)
    setDragLayouts(null)
  }

  if (!freeBlocks.length) return null

  if (readOnly) {
    return (
      <div className="article-live-free-blocks-layer article-live-free-blocks-layer--readonly" aria-hidden>
        {freeBlocks.map(({ block, blockId }) => (
          <ArticleCanvasBlock
            key={blockId}
            block={block}
            blockId={blockId}
            selected={false}
            showSelectionChrome={false}
            dragging={false}
            onSelect={() => undefined}
            onUpdate={() => undefined}
            onDelete={() => undefined}
            onMoveStart={() => undefined}
            onResizeStart={() => undefined}
            onRotateStart={() => undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="article-live-free-blocks-layer"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {freeBlocks.map(({ block, blockId }) => {
        const selected = selectedBlockIds.includes(blockId)
        return (
          <ArticleCanvasBlock
            key={blockId}
            block={block}
            blockId={blockId}
            layoutOverride={dragLayouts?.[blockId]}
            selected={selected}
            showSelectionChrome={selected && selectedBlockIds.length === 1}
            dragging={draggingId === blockId}
            onSelect={(additive) => {
              if (additive) {
                onSelectBlocks(
                  selectedBlockIds.includes(blockId)
                    ? selectedBlockIds.filter((id) => id !== blockId)
                    : [...selectedBlockIds, blockId],
                )
                return
              }
              onSelectBlocks([blockId])
            }}
            onUpdate={(patch) => {
              onChange(updateCanvasBlock(ensureCanvasLayouts(data), blockId, patch))
            }}
            onDelete={() => {
              onChange(removeCanvasBlocks(ensureCanvasLayouts(data), [blockId]))
              onSelectBlocks(selectedBlockIds.filter((id) => id !== blockId))
            }}
            onMoveStart={(x, y) => startMove(blockId, x, y)}
            onResizeStart={(handle, x, y) => startResize(blockId, handle, x, y)}
            onRotateStart={(x, y) => startRotate(blockId, x, y)}
          />
        )
      })}
    </div>
  )
}
