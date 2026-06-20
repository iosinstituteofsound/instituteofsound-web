import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Radio } from 'lucide-react'
import type { WirePickItem } from '@/modules/explore/types/explore.types'
import {
  WireLineupDropZone,
  WireLineupRow,
} from '@/shared/components/wire-picks/components/wire-pick-rows'
import type { ResolvedWirePick, WirePickDragIds } from '@/shared/components/wire-picks/lib/wire-pick-utils'
import type { WirePicksLabels } from '@/shared/components/wire-picks/types'
import { DEFAULT_WIRE_PICKS_LABELS } from '@/shared/components/wire-picks/types'

interface WireLineupPanelProps {
  items: WirePickItem[]
  lineup: ResolvedWirePick[]
  dragIds: WirePickDragIds
  labels?: WirePicksLabels
  onRemove: (item: WirePickItem) => void
}

export function WireLineupPanel({
  items,
  lineup,
  dragIds,
  labels,
  onRemove,
}: WireLineupPanelProps) {
  const copy = { ...DEFAULT_WIRE_PICKS_LABELS, ...labels }
  const emptyLines = copy.lineupEmpty.split('\n')

  return (
    <section className="wire-desk__panel" aria-labelledby="wire-lineup-heading">
      <header className="wire-desk__header">
        <div>
          <p className="wire-desk__kicker">{copy.lineupKicker}</p>
          <h3 id="wire-lineup-heading" className="wire-desk__title">
            {copy.lineupTitle}
          </h3>
        </div>
        <span className="wire-desk__meta">
          <Radio size={12} aria-hidden />
          {copy.liveMeta(items.length)}
        </span>
      </header>
      <div className="wire-desk__body">
        <WireLineupDropZone dropId={dragIds.lineupDropId} isEmpty={items.length === 0}>
          {items.length === 0 ? (
            <div className="wire-desk__empty">
              {emptyLines.map((line, index) => (
                <span key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </div>
          ) : (
            <SortableContext
              items={items.map((item) => dragIds.lineupDragId(item))}
              strategy={verticalListSortingStrategy}
            >
              <div className="wire-desk__list">
                {items.map((item, index) => (
                  <WireLineupRow
                    key={`${item.sortOrder}-${item.feedItemId ?? item.releaseId ?? item.articleId}`}
                    item={item}
                    index={index}
                    resolved={lineup[index]!}
                    dragIds={dragIds}
                    onRemove={() => onRemove(item)}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </WireLineupDropZone>
      </div>
    </section>
  )
}
