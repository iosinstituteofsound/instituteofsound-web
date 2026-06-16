import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
import { GripVertical, Plus, X } from 'lucide-react'
import type { WirePickItem, WireCandidates } from '@/modules/explore/types/explore.types'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

function SortablePick({
  item,
  label,
  onRemove,
}: {
  item: WirePickItem
  label: string
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${item.sortOrder}-${item.feedItemId ?? item.releaseId ?? item.articleId}`,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-card p-3',
        isDragging && 'opacity-80 shadow-lg',
      )}
    >
      <button type="button" className="cursor-grab text-muted-foreground" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <Button type="button" size="icon" variant="ghost" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface WirePicksBuilderProps {
  items: WirePickItem[]
  candidates: WireCandidates | undefined
  onChange: (items: WirePickItem[]) => void
}

export function WirePicksBuilder({ items, candidates, onChange }: WirePicksBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const resolveLabel = (item: WirePickItem) => {
    if (item.label) return item.label
    if (item.feedItemId) {
      const feed = candidates?.feedItems.find((f) => f.id === item.feedItemId)
      return feed?.title ?? `Feed ${item.feedItemId.slice(-6)}`
    }
    if (item.releaseId) {
      const release = candidates?.releases.find((r) => r.id === item.releaseId)
      return release?.title ?? `Release ${item.releaseId.slice(-6)}`
    }
    return 'Wire pick'
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = items.map((i) => `${i.sortOrder}-${i.feedItemId ?? i.releaseId ?? i.articleId}`)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(items, oldIndex, newIndex).map((item, sortOrder) => ({
      ...item,
      sortOrder,
    }))
    onChange(reordered)
  }

  const addFeedPick = (feedItemId: string, label: string) => {
    onChange([
      ...items,
      { feedItemId, sortOrder: items.length, label },
    ])
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider">Wire lineup</h3>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={items.map((i) => `${i.sortOrder}-${i.feedItemId ?? i.releaseId ?? i.articleId}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((item) => (
                <SortablePick
                  key={`${item.sortOrder}-${item.feedItemId ?? item.releaseId}`}
                  item={item}
                  label={resolveLabel(item)}
                  onRemove={() =>
                    onChange(
                      items
                        .filter((i) => i !== item)
                        .map((i, sortOrder) => ({ ...i, sortOrder })),
                    )
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {!items.length ? (
          <p className="text-sm text-muted-foreground">Drag candidates from the right to build your wire.</p>
        ) : null}
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider">Candidates</h3>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {candidates?.feedItems.map((feed) => (
            <button
              key={feed.id}
              type="button"
              className="flex w-full items-center gap-2 rounded-md border p-2 text-left text-sm hover:bg-muted"
              onClick={() => addFeedPick(feed.id, feed.title ?? 'Feed item')}
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="truncate">{feed.title ?? feed.body?.slice(0, 60) ?? feed.id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
