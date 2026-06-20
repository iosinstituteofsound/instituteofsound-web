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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'
import { useActiveQueue, usePlayerStore } from '@/modules/player/stores/player-store'
import { formatPlayerTime } from '@/modules/player/lib/format-time'
import { cn } from '@/shared/lib/cn'
import '@/modules/player/styles/player-queue-shuffle.css'

type PlayerQueueListProps = {
  queueIndex: number
  onPlayIndex: (index: number) => void
  onRemoveIndex: (index: number) => void
  onReorder: (oldIndex: number, newIndex: number) => void
}

function QueueTrackRow({
  track,
  index,
  isCurrent,
  isShuffling,
  onPlayIndex,
  onRemoveIndex,
}: {
  track: ReturnType<typeof useActiveQueue>[number]
  index: number
  isCurrent: boolean
  isShuffling: boolean
  onPlayIndex: (index: number) => void
  onRemoveIndex: (index: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
    disabled: isShuffling,
  })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'player-queue-panel__row',
        isCurrent && 'player-queue-panel__row--current',
        isShuffling && 'player-queue-panel__row--shuffling',
        isDragging && 'player-queue-panel__row--dragging',
      )}
    >
      {!isShuffling ? (
        <button
          type="button"
          className="player-queue-panel__handle"
          aria-label={`Drag ${track.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      ) : (
        <span className="player-queue-panel__handle-spacer" aria-hidden />
      )}
      <button
        type="button"
        className="player-queue-panel__row-main"
        onClick={() => onPlayIndex(index)}
        disabled={isShuffling}
      >
        {track.artworkUrl ? (
          <img src={track.artworkUrl} alt="" className="player-queue-panel__thumb" />
        ) : (
          <span className="player-queue-panel__thumb-fallback" aria-hidden>
            ♪
          </span>
        )}
        <span className="player-queue-panel__meta">
          <span className={cn('player-queue-panel__title', isCurrent && 'is-current')}>
            {track.title}
          </span>
          <span className="player-queue-panel__artist">{track.artist ?? 'Unknown'}</span>
        </span>
        <span className="player-queue-panel__duration">
          {track.durationSec ? formatPlayerTime(track.durationSec) : '—'}
        </span>
      </button>
      {!isCurrent ? (
        <button
          type="button"
          className="player-queue-panel__remove"
          aria-label={`Remove ${track.title} from queue`}
          onClick={() => onRemoveIndex(index)}
          disabled={isShuffling}
        >
          <X className="size-4" />
        </button>
      ) : (
        <span className="player-queue-panel__now-badge">Now</span>
      )}
    </li>
  )
}

export function PlayerQueueList({
  queueIndex,
  onPlayIndex,
  onRemoveIndex,
  onReorder,
}: PlayerQueueListProps) {
  const queue = useActiveQueue()
  const isShuffling = usePlayerStore((s) => s.isShuffling)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || isShuffling) return
    const oldIndex = queue.findIndex((track) => track.id === active.id)
    const newIndex = queue.findIndex((track) => track.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onReorder(oldIndex, newIndex)
  }

  if (!queue.length) {
    return <p className="player-queue-panel__empty">Queue is empty.</p>
  }

  const list = (
    <ul className="player-queue-panel__list" aria-label="Playback queue">
      {queue.map((track, index) => (
        <QueueTrackRow
          key={track.id}
          track={track}
          index={index}
          isCurrent={index === queueIndex}
          isShuffling={isShuffling}
          onPlayIndex={onPlayIndex}
          onRemoveIndex={onRemoveIndex}
        />
      ))}
    </ul>
  )

  if (isShuffling) {
    return list
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={queue.map((track) => track.id)} strategy={verticalListSortingStrategy}>
        {list}
      </SortableContext>
    </DndContext>
  )
}
