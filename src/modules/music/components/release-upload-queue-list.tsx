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
import { FileAudio, GripVertical, RotateCcw, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getArtistProfile } from '@/modules/music/api/music.api'
import type { useAudioUploadQueue } from '@/modules/music/hooks/use-audio-upload-queue'
import { ProcessingStatus } from '@/modules/music/components/processing-status'
import { DuplicateTrackAlert } from '@/modules/music/components/duplicate-track-alert'
import { formatArtistTrackTitle } from '@/modules/music/lib/track-title-format'
import type { QueuedUpload } from '@/modules/music/types/release-builder.types'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

type UploadQueue = ReturnType<typeof useAudioUploadQueue>

interface ReleaseUploadQueueListProps {
  queue: UploadQueue
}

function statusClass(status: string) {
  if (status === 'ready') return 'rbl-queue__status--ready'
  if (status === 'failed') return 'rbl-queue__status--failed'
  return ''
}

function canReorderItem(item: QueuedUpload) {
  return item.status !== 'uploading' && item.status !== 'processing'
}

function SortableQueueItem({
  item,
  index,
  queue,
  reorderEnabled,
  artistName,
}: {
  item: QueuedUpload
  index: number
  queue: UploadQueue
  reorderEnabled: boolean
  artistName: string
}) {
  const draggable = reorderEnabled && canReorderItem(item)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !draggable,
  })

  const isActive = item.status === 'uploading' || item.status === 'processing'

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rbl-queue__item',
        isActive && 'rbl-queue__item--active',
        item.status === 'ready' && 'rbl-queue__item--ready',
        item.status === 'failed' && 'rbl-queue__item--failed',
        isDragging && 'rbl-queue__item--dragging',
      )}
    >
      <div className="flex items-start gap-3">
        {draggable ? (
          <button
            type="button"
            className="rbl-queue__handle"
            aria-label={`Reorder track ${index + 1}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        ) : (
          <span className="rbl-queue__handle rbl-queue__handle--disabled" aria-hidden>
            <GripVertical className="size-4" />
          </span>
        )}
        <span className="rbl-queue__index">{String(index + 1).padStart(2, '0')}</span>
        <FileAudio className="rbl-text-accent mt-0.5 size-5 shrink-0" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="rbl-queue__name">{item.file.name}</p>
              <p className="rbl-queue__meta">
                {(item.file.size / (1024 * 1024)).toFixed(1)} MB · track {index + 1}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('rbl-queue__status', statusClass(item.status))}>
                {item.status === 'pending' && queue.isProcessing ? 'queued' : item.status}
              </span>
              {item.status === 'pending' || item.status === 'failed' ? (
                <button
                  type="button"
                  className="rbl-btn rbl-btn--icon"
                  onClick={() => queue.removeItem(item.id)}
                  aria-label="Remove track"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          </div>

          {item.status === 'pending' ? (
            <div className="rbl-field">
              <label htmlFor={`song-name-${item.id}`}>Song name</label>
              <Input
                id={`song-name-${item.id}`}
                placeholder="e.g. Chal"
                value={item.title}
                onChange={(e) => queue.updateTitle(item.id, e.target.value)}
              />
              {item.title.trim() ? (
                <p className="rbl-field__hint">
                  Publishes as {formatArtistTrackTitle(artistName, item.title)}
                </p>
              ) : (
                <p className="rbl-field__hint">Artist name is added automatically on publish.</p>
              )}
            </div>
          ) : null}

          {item.status === 'uploading' && item.uploadProgress > 0 ? (
            <ProcessingStatus variant="scifi" status="uploaded" progress={item.uploadProgress} />
          ) : null}

          {(item.status === 'processing' || item.status === 'ready' || item.status === 'failed') &&
          item.processingStatus !== 'created' ? (
            <ProcessingStatus
              variant="scifi"
              status={item.processingStatus}
              progress={item.processingProgress}
              errorMessage={item.errorMessage}
            />
          ) : null}

          {item.duplicateCheck?.status === 'flagged' ? (
            <DuplicateTrackAlert duplicateCheck={item.duplicateCheck} variant="banner" />
          ) : null}

          {item.status === 'failed' ? (
            <button type="button" className="rbl-btn" onClick={() => queue.retryItem(item.id)}>
              <RotateCcw className="size-3.5" />
              Retry upload
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function ReleaseUploadQueueList({ queue }: ReleaseUploadQueueListProps) {
  const reorderEnabled = queue.queue.length > 1
  const itemIds = queue.queue.map((item) => item.id)
  const { data: profile } = useQuery({
    queryKey: ['artist-profile'],
    queryFn: getArtistProfile,
  })
  const artistName = profile?.displayName ?? 'Artist'

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    queue.reorderQueue(String(active.id), String(over.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="rbl-queue">
          {queue.queue.map((item, index) => (
            <SortableQueueItem
              key={item.id}
              item={item}
              index={index}
              queue={queue}
              reorderEnabled={reorderEnabled}
              artistName={artistName}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
