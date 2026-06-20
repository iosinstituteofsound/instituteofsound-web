import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { useEffect, useId, useMemo } from 'react'
import { releaseTypeLabel } from '@/modules/explore/lib/release-meta'
import { WireCandidatesPanel } from '@/shared/components/wire-picks/components/wire-candidates-panel'
import { WireLineupPanel } from '@/shared/components/wire-picks/components/wire-lineup-panel'
import { WireDragPreviewRow } from '@/shared/components/wire-picks/components/wire-pick-rows'
import { useWirePicksBuilder } from '@/shared/components/wire-picks/hooks/use-wire-picks-builder'
import { feedItemArtist, feedItemTitle } from '@/shared/components/wire-picks/lib/wire-pick-utils'
import type { WireSourceTab } from '@/shared/components/wire-picks/lib/wire-candidate-filters'
import {
  DEFAULT_WIRE_PICKS_LABELS,
  type WirePicksBuilderProps,
} from '@/shared/components/wire-picks/types'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import '@/modules/editor/styles/article-editor.css'
import '@/shared/components/wire-picks/styles/wire-picks-builder.css'

const ALL_SOURCE_TABS: WireSourceTab[] = ['releases', 'community', 'search']

export function WirePicksBuilder({
  items,
  candidates,
  onChange,
  onSave,
  isSaving,
  className,
  labels,
  enabledSourceTabs = ALL_SOURCE_TABS,
  defaultSourceTab,
  defaultSection,
  releasePageLimit,
  instanceId,
}: WirePicksBuilderProps) {
  const reactId = useId().replace(/:/g, '')
  const resolvedInstanceId = instanceId ?? `wire-picks-${reactId}`
  const copy = { ...DEFAULT_WIRE_PICKS_LABELS, ...labels }

  const enabledTabs = useMemo(
    () => enabledSourceTabs.filter((tab) => ALL_SOURCE_TABS.includes(tab)),
    [enabledSourceTabs],
  )

  const builder = useWirePicksBuilder({
    items,
    candidates,
    onChange,
    instanceId: resolvedInstanceId,
    defaultSourceTab: defaultSourceTab ?? enabledTabs[0] ?? 'releases',
    defaultSection,
    releasePageLimit,
  })

  const {
    dragIds,
    sensors,
    sourceTab,
    setSourceTab,
    section,
    setSection,
    sort,
    setSort,
    typeFilter,
    setTypeFilter,
    genreFilter,
    setGenreFilter,
    activeDrag,
    releasesQuery,
    filteredReleases,
    genreOptions,
    lineup,
    feedItems,
    handleDragStart,
    handleDragEnd,
    addReleasePick,
    addFeedPick,
    addSearchPick,
    removePick,
    isReleasePicked,
    isFeedPicked,
  } = builder

  useEffect(() => {
    if (!enabledTabs.includes(sourceTab)) {
      setSourceTab(enabledTabs[0] ?? 'releases')
    }
  }, [enabledTabs, setSourceTab, sourceTab])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('wire-desk', className)}>
        <WireLineupPanel
          items={items}
          lineup={lineup}
          dragIds={dragIds}
          labels={labels}
          onRemove={removePick}
        />

        <WireCandidatesPanel
          dragIds={dragIds}
          labels={labels}
          enabledSourceTabs={enabledTabs}
          sourceTab={sourceTab}
          onSourceTabChange={setSourceTab}
          section={section}
          onSectionChange={setSection}
          sort={sort}
          onSortChange={setSort}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          genreFilter={genreFilter}
          onGenreFilterChange={setGenreFilter}
          genreOptions={genreOptions}
          filteredReleases={filteredReleases}
          releasesQuery={releasesQuery}
          feedItems={feedItems}
          isReleasePicked={isReleasePicked}
          isFeedPicked={isFeedPicked}
          onAddRelease={addReleasePick}
          onAddFeed={addFeedPick}
          onSearchPick={addSearchPick}
        />

        {onSave ? (
          <div className="wire-desk__footer">
            <p className="wire-desk__hint">{copy.footerHint(items.length)}</p>
            <Button className="wire-desk__save" onClick={onSave} disabled={isSaving}>
              {isSaving ? copy.savingLabel : copy.saveLabel}
            </Button>
          </div>
        ) : null}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
        {activeDrag?.kind === 'release' ? (
          <WireDragPreviewRow
            rank={releaseTypeLabel(activeDrag.release.type).slice(0, 3)}
            title={activeDrag.release.title}
            subtitle={activeDrag.release.artistName ?? 'Unknown artist'}
            coverUrl={activeDrag.release.coverUrl}
          />
        ) : null}
        {activeDrag?.kind === 'feed' ? (
          <WireDragPreviewRow
            rank="NET"
            title={feedItemTitle(activeDrag.feed)}
            subtitle={feedItemArtist(activeDrag.feed)}
          />
        ) : null}
        {activeDrag?.kind === 'lineup' ? (
          <WireDragPreviewRow
            rank="MV"
            title={activeDrag.resolved.title}
            subtitle={activeDrag.resolved.subtitle}
            coverUrl={activeDrag.resolved.coverUrl}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
