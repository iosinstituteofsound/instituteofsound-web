import { useQuery } from '@tanstack/react-query'
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'
import { getReleasesPage } from '@/modules/explore/api/explore.api'
import type { ReleaseDto, WireCandidates, WirePickItem } from '@/modules/explore/types/explore.types'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import type { SiteAudioTrack } from '@/modules/editor/lib/site-audio-library'
import {
  collectWireGenres,
  filterWireReleasesByGenre,
  filterWireReleasesByType,
  sortWireReleases,
  WIRE_SECTION_TO_FILTER,
  type WireReleaseSection,
  type WireSort,
  type WireSourceTab,
  type WireTypeFilter,
} from '@/shared/components/wire-picks/lib/wire-candidate-filters'
import {
  buildWireFeedMap,
  buildWireReleaseMap,
  createFeedWirePick,
  createReleaseWirePick,
  createWirePickDragIds,
  insertWirePickAt,
  isWirePickAlreadySelected,
  resolveWirePick,
  wirePickItemId,
  type ResolvedWirePick,
  type WirePickDragIds,
} from '@/shared/components/wire-picks/lib/wire-pick-utils'

type ActiveDrag =
  | { kind: 'release'; release: ReleaseDto }
  | { kind: 'feed'; feed: FeedItemDto }
  | { kind: 'lineup'; resolved: ResolvedWirePick }

interface UseWirePicksBuilderOptions {
  items: WirePickItem[]
  candidates?: WireCandidates
  onChange: (items: WirePickItem[]) => void
  instanceId: string
  defaultSourceTab?: WireSourceTab
  defaultSection?: WireReleaseSection
  releasePageLimit?: number
}

export function useWirePicksBuilder({
  items,
  candidates,
  onChange,
  instanceId,
  defaultSourceTab = 'releases',
  defaultSection = 'trending',
  releasePageLimit = 48,
}: UseWirePicksBuilderOptions) {
  const dragIds = useMemo(() => createWirePickDragIds(instanceId), [instanceId])

  const [sourceTab, setSourceTab] = useState<WireSourceTab>(defaultSourceTab)
  const [section, setSection] = useState<WireReleaseSection>(defaultSection)
  const [sort, setSort] = useState<WireSort>('featured')
  const [typeFilter, setTypeFilter] = useState<WireTypeFilter>('all')
  const [genreFilter, setGenreFilter] = useState('')
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const releasesQuery = useQuery({
    queryKey: ['wire-release-candidates', instanceId, section],
    queryFn: () =>
      getReleasesPage({
        page: 1,
        limit: releasePageLimit,
        filter: WIRE_SECTION_TO_FILTER[section],
      }),
    enabled: sourceTab === 'releases',
    staleTime: 60_000,
  })

  const releaseMap = useMemo(
    () => buildWireReleaseMap(candidates?.releases ?? [], releasesQuery.data?.items ?? []),
    [candidates?.releases, releasesQuery.data?.items],
  )

  const feedMap = useMemo(
    () => buildWireFeedMap(candidates?.feedItems ?? []),
    [candidates?.feedItems],
  )

  const filteredReleases = useMemo(() => {
    const base = releasesQuery.data?.items ?? []
    const typed = filterWireReleasesByType(base, typeFilter)
    const genred = filterWireReleasesByGenre(typed, genreFilter || undefined)
    return sortWireReleases(genred, sort)
  }, [genreFilter, releasesQuery.data?.items, sort, typeFilter])

  const genreOptions = useMemo(
    () => collectWireGenres(releasesQuery.data?.items ?? []),
    [releasesQuery.data?.items],
  )

  const lineup = useMemo(
    () => items.map((item) => resolveWirePick(item, releaseMap, feedMap)),
    [feedMap, items, releaseMap],
  )

  const resolveInsertIndex = (overId: string) => {
    if (overId === dragIds.lineupDropId) return items.length
    const overItemId = dragIds.parseLineupDragId(overId)
    if (!overItemId) return items.length
    const index = items.findIndex((entry) => wirePickItemId(entry) === overItemId)
    return index >= 0 ? index : items.length
  }

  const isDropTarget = (overId: string) =>
    overId === dragIds.lineupDropId || dragIds.isLineupDragId(overId)

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id)
    const data = event.active.data.current as
      | { type?: string; release?: ReleaseDto; feed?: FeedItemDto }
      | undefined

    if (dragIds.isCandidateReleaseDragId(activeId) && data?.release) {
      setActiveDrag({ kind: 'release', release: data.release })
      return
    }

    if (dragIds.isCandidateFeedDragId(activeId) && data?.feed) {
      setActiveDrag({ kind: 'feed', feed: data.feed })
      return
    }

    if (dragIds.isLineupDragId(activeId)) {
      const pickItemId = dragIds.parseLineupDragId(activeId)
      const index = items.findIndex((entry) => wirePickItemId(entry) === pickItemId)
      if (index >= 0) setActiveDrag({ kind: 'lineup', resolved: lineup[index]! })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDrag(null)
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return

    if (dragIds.isCandidateReleaseDragId(activeId)) {
      const releaseId = dragIds.parseCandidateReleaseDragId(activeId)
      if (!releaseId || isWirePickAlreadySelected(items, { releaseId })) return

      const release =
        releaseMap.get(releaseId) ?? filteredReleases.find((entry) => entry.id === releaseId)
      if (!release || !isDropTarget(overId)) return

      onChange(insertWirePickAt(items, createReleaseWirePick(release), resolveInsertIndex(overId)))
      return
    }

    if (dragIds.isCandidateFeedDragId(activeId)) {
      const feedId = dragIds.parseCandidateFeedDragId(activeId)
      if (!feedId || isWirePickAlreadySelected(items, { feedItemId: feedId })) return

      const feed = feedMap.get(feedId)
      if (!feed || !isDropTarget(overId)) return

      onChange(insertWirePickAt(items, createFeedWirePick(feed), resolveInsertIndex(overId)))
      return
    }

    if (dragIds.isLineupDragId(activeId) && dragIds.isLineupDragId(overId)) {
      const activeItemId = dragIds.parseLineupDragId(activeId)
      const overItemId = dragIds.parseLineupDragId(overId)
      const oldIndex = items.findIndex((entry) => wirePickItemId(entry) === activeItemId)
      const newIndex = items.findIndex((entry) => wirePickItemId(entry) === overItemId)
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return

      onChange(
        arrayMove(items, oldIndex, newIndex).map((entry, sortOrder) => ({
          ...entry,
          sortOrder,
        })),
      )
    }
  }

  const addReleasePick = (release: ReleaseDto, insertIndex = items.length) => {
    if (isWirePickAlreadySelected(items, { releaseId: release.id })) return
    onChange(insertWirePickAt(items, createReleaseWirePick(release), insertIndex))
  }

  const addFeedPick = (feed: FeedItemDto, insertIndex = items.length) => {
    if (isWirePickAlreadySelected(items, { feedItemId: feed.id })) return
    onChange(insertWirePickAt(items, createFeedWirePick(feed), insertIndex))
  }

  const addSearchPick = (track: SiteAudioTrack) => {
    if (track.releaseId) {
      if (isWirePickAlreadySelected(items, { releaseId: track.releaseId })) return
      onChange([
        ...items,
        {
          releaseId: track.releaseId,
          sortOrder: items.length,
          label: `${track.title} · ${track.artistName}`,
        },
      ])
      return
    }

    onChange([
      ...items,
      {
        sortOrder: items.length,
        label: `${track.title} · ${track.artistName}`,
      },
    ])
  }

  const removePick = (item: WirePickItem) => {
    onChange(
      items
        .filter((entry) => entry !== item)
        .map((entry, sortOrder) => ({ ...entry, sortOrder })),
    )
  }

  const isReleasePicked = (releaseId: string) => isWirePickAlreadySelected(items, { releaseId })
  const isFeedPicked = (feedId: string) => isWirePickAlreadySelected(items, { feedItemId: feedId })

  return {
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
    feedItems: candidates?.feedItems ?? [],
    handleDragStart,
    handleDragEnd,
    addReleasePick,
    addFeedPick,
    addSearchPick,
    removePick,
    isReleasePicked,
    isFeedPicked,
  }
}

export type { WirePickDragIds, ActiveDrag }
