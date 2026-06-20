import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Music2 } from 'lucide-react'
import type { QueuedUpload } from '@/modules/music/types/release-builder.types'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

interface ReleaseTrackManifestListProps {
  tracks: QueuedUpload[]
  onTrackTitleChange: (id: string, title: string) => void
  onReorder: (activeId: string, overId: string) => void
}

function SortableTrackRow({
  track,
  index,
  onTrackTitleChange,
  reorderEnabled,
}: {
  track: QueuedUpload
  index: number
  onTrackTitleChange: (id: string, title: string) => void
  reorderEnabled: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
    disabled: !reorderEnabled,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('rbl-track-row', isDragging && 'rbl-track-row--dragging')}
    >
      {reorderEnabled ? (
        <button
          type="button"
          className="rbl-queue__handle"
          aria-label={`Reorder track ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      ) : null}
      <span className="rbl-track-row__num">{String(index + 1).padStart(2, '0')}</span>
      <Music2 className="rbl-text-accent size-4 shrink-0" />
      <Input value={track.title} onChange={(e) => onTrackTitleChange(track.id, e.target.value)} className="flex-1" />
    </div>
  )
}

export function ReleaseTrackManifestList({ tracks, onTrackTitleChange, onReorder }: ReleaseTrackManifestListProps) {
  const reorderEnabled = tracks.length > 1
  const trackIds = tracks.map((track) => track.id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onReorder(String(active.id), String(over.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={trackIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <SortableTrackRow
              key={track.id}
              track={track}
              index={index}
              onTrackTitleChange={onTrackTitleChange}
              reorderEnabled={reorderEnabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
