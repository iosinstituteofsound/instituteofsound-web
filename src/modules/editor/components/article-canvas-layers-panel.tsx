import { useEffect, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowDown,
  ArrowUp,
  AudioLines,
  Check,
  Film,
  Layers2,
  Type,
  Wallpaper,
  X,
} from 'lucide-react'
import type { Data } from '@measured/puck'
import {
  ARTIFACT_LAYER_ID,
  buildCanvasBackgroundLayer,
  buildCanvasStackLayers,
  moveCanvasStackLayer,
  reorderCanvasStackLayers,
  toggleCanvasArtifactVisibility,
  toggleCanvasBackgroundVisibility,
  toggleCanvasBlockVisibility,
  type CanvasLayerEntry,
} from '@/modules/editor/lib/canvas-layers-utils'
import { cn } from '@/shared/lib/cn'

interface ArticleCanvasLayersPanelProps {
  open: boolean
  data: Data
  selectedBlockIds: string[]
  onChange: (data: Data) => void
  onSelectBlock: (blockId: string) => void
  onClose: () => void
}

function LayerThumbnail({ layer }: { layer: CanvasLayerEntry }) {
  if (layer.thumbnail === 'image' && layer.imageUrl) {
    return (
      <span
        className="article-canvas-layers__thumb article-canvas-layers__thumb--image"
        style={{ backgroundImage: `url("${layer.imageUrl}")` }}
      />
    )
  }

  if (layer.thumbnail === 'text') {
    return (
      <span className="article-canvas-layers__thumb article-canvas-layers__thumb--text">
        {layer.previewText ?? 'T'}
      </span>
    )
  }

  const Icon =
    layer.thumbnail === 'audio'
      ? AudioLines
      : layer.thumbnail === 'video'
        ? Film
        : layer.thumbnail === 'artifact'
          ? Layers2
          : layer.thumbnail === 'background'
            ? Wallpaper
            : Type

  return (
    <span className="article-canvas-layers__thumb article-canvas-layers__thumb--icon">
      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
    </span>
  )
}

function SortableLayerRow({
  layer,
  selected,
  onSelect,
  onToggleVisibility,
}: {
  layer: CanvasLayerEntry
  selected: boolean
  onSelect: () => void
  onToggleVisibility: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: layer.id,
    disabled: layer.locked,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'article-canvas-layers__row',
        selected && 'article-canvas-layers__row--selected',
        isDragging && 'article-canvas-layers__row--dragging',
        !layer.visible && 'article-canvas-layers__row--hidden',
      )}
    >
      <button
        type="button"
        className="article-canvas-layers__row-main"
        onClick={onSelect}
        aria-label={`Select ${layer.label}`}
        {...attributes}
        {...listeners}
      >
        <LayerThumbnail layer={layer} />
      </button>

      <button
        type="button"
        className={cn(
          'article-canvas-layers__visibility',
          layer.visible && 'article-canvas-layers__visibility--on',
        )}
        aria-label={layer.visible ? `Hide ${layer.label}` : `Show ${layer.label}`}
        onClick={(event) => {
          event.stopPropagation()
          onToggleVisibility()
        }}
      >
        {layer.visible ? <Check className="h-3 w-3" /> : null}
      </button>
    </div>
  )
}

function FixedLayerRow({
  layer,
  onToggleVisibility,
}: {
  layer: CanvasLayerEntry
  onToggleVisibility: () => void
}) {
  return (
    <div
      className={cn(
        'article-canvas-layers__row article-canvas-layers__row--locked',
        !layer.visible && 'article-canvas-layers__row--hidden',
      )}
    >
      <button type="button" className="article-canvas-layers__row-main" aria-label={layer.label} disabled>
        <LayerThumbnail layer={layer} />
      </button>
      <button
        type="button"
        className={cn(
          'article-canvas-layers__visibility',
          layer.visible && 'article-canvas-layers__visibility--on',
        )}
        aria-label={layer.visible ? `Hide ${layer.label}` : `Show ${layer.label}`}
        onClick={(event) => {
          event.stopPropagation()
          onToggleVisibility()
        }}
      >
        {layer.visible ? <Check className="h-3 w-3" /> : null}
      </button>
    </div>
  )
}

export function ArticleCanvasLayersPanel({
  open,
  data,
  selectedBlockIds,
  onChange,
  onSelectBlock,
  onClose,
}: ArticleCanvasLayersPanelProps) {
  const stackLayers = buildCanvasStackLayers(data)
  const backgroundLayer = buildCanvasBackgroundLayer(data)
  const selectedBlockId = selectedBlockIds.length === 1 ? selectedBlockIds[0] : null
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedBlockIds.length === 1) {
      setSelectedLayerId(null)
    }
  }, [selectedBlockIds])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const ids = stackLayers.map((layer) => layer.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return

    onChange(reorderCanvasStackLayers(data, arrayMove(ids, oldIndex, newIndex)))
  }

  const activeLayerId = selectedLayerId ?? selectedBlockId

  const handleMove = (layerId: string, direction: 'up' | 'down') => {
    onChange(moveCanvasStackLayer(data, layerId, direction))
  }

  const handleSelectLayer = (layer: CanvasLayerEntry) => {
    if (layer.kind === 'block' && layer.blockId) {
      setSelectedLayerId(null)
      onSelectBlock(layer.blockId)
      return
    }
    if (layer.kind === 'artifact') {
      setSelectedLayerId(ARTIFACT_LAYER_ID)
      onSelectBlock('')
    }
  }

  const handleToggleVisibility = (layer: CanvasLayerEntry) => {
    if (layer.kind === 'block' && layer.blockId) {
      onChange(toggleCanvasBlockVisibility(data, layer.blockId))
      return
    }
    if (layer.kind === 'artifact') {
      onChange(toggleCanvasArtifactVisibility(data))
    }
  }

  return (
    <aside
      className={cn('article-canvas-layers', open && 'article-canvas-layers--open')}
      aria-hidden={!open}
    >
      <div className="article-canvas-layers__header">
        <Layers2 className="h-4 w-4 text-[#3b82f6]" strokeWidth={1.75} />
        <span className="article-canvas-layers__title">Layers</span>
        <button type="button" className="article-canvas-layers__close" onClick={onClose} aria-label="Close layers">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="article-canvas-layers__list">
        {stackLayers.length ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={stackLayers.map((layer) => layer.id)} strategy={verticalListSortingStrategy}>
              {stackLayers.map((layer) => (
                <SortableLayerRow
                  key={layer.id}
                  layer={layer}
                  selected={
                    layer.kind === 'artifact'
                      ? activeLayerId === ARTIFACT_LAYER_ID
                      : activeLayerId === layer.blockId
                  }
                  onSelect={() => handleSelectLayer(layer)}
                  onToggleVisibility={() => handleToggleVisibility(layer)}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <p className="article-canvas-layers__empty">No layers yet</p>
        )}

        <div className="article-canvas-layers__fixed">
          <FixedLayerRow
            layer={backgroundLayer}
            onToggleVisibility={() => onChange(toggleCanvasBackgroundVisibility(data))}
          />
        </div>
      </div>

      {activeLayerId ? (
        <div className="article-canvas-layers__actions">
          <button
            type="button"
            className="article-canvas-layers__action"
            aria-label="Move layer up"
            onClick={() => handleMove(activeLayerId, 'up')}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="article-canvas-layers__action"
            aria-label="Move layer down"
            onClick={() => handleMove(activeLayerId, 'down')}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </aside>
  )
}

export function ArticleCanvasLayersRail({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className={cn('article-canvas-layers-rail', open && 'article-canvas-layers-rail--active')}
      onClick={onToggle}
      aria-label="Layers"
      aria-expanded={open}
    >
      <Layers2 className="h-4 w-4" strokeWidth={1.5} />
      <span>Layers</span>
    </button>
  )
}
