import { Loader2, Search } from 'lucide-react'
import type { UseQueryResult } from '@tanstack/react-query'
import type { ReleaseDto, ReleasesPageDto } from '@/modules/explore/types/explore.types'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { ArticleAudioSearchPicker } from '@/modules/editor/components/article-audio-search-picker'
import type { SiteAudioTrack } from '@/modules/editor/lib/site-audio-library'
import {
  WireCandidateFeedRow,
  WireCandidateReleaseRow,
} from '@/shared/components/wire-picks/components/wire-pick-rows'
import {
  WIRE_SECTION_LABELS,
  WIRE_SORT_OPTIONS,
  WIRE_SOURCE_TAB_LABELS,
  WIRE_TYPE_OPTIONS,
  type WireReleaseSection,
  type WireSort,
  type WireSourceTab,
  type WireTypeFilter,
} from '@/shared/components/wire-picks/lib/wire-candidate-filters'
import type { WirePickDragIds } from '@/shared/components/wire-picks/lib/wire-pick-utils'
import type { WirePicksLabels } from '@/shared/components/wire-picks/types'
import { DEFAULT_WIRE_PICKS_LABELS } from '@/shared/components/wire-picks/types'
import { cn } from '@/shared/lib/cn'

interface WireCandidatesPanelProps {
  dragIds: WirePickDragIds
  labels?: WirePicksLabels
  enabledSourceTabs: WireSourceTab[]
  sourceTab: WireSourceTab
  onSourceTabChange: (tab: WireSourceTab) => void
  section: WireReleaseSection
  onSectionChange: (section: WireReleaseSection) => void
  sort: WireSort
  onSortChange: (sort: WireSort) => void
  typeFilter: WireTypeFilter
  onTypeFilterChange: (type: WireTypeFilter) => void
  genreFilter: string
  onGenreFilterChange: (genre: string) => void
  genreOptions: string[]
  filteredReleases: ReleaseDto[]
  releasesQuery: UseQueryResult<ReleasesPageDto>
  feedItems: FeedItemDto[]
  isReleasePicked: (releaseId: string) => boolean
  isFeedPicked: (feedId: string) => boolean
  onAddRelease: (release: ReleaseDto) => void
  onAddFeed: (feed: FeedItemDto) => void
  onSearchPick: (track: SiteAudioTrack) => void
}

export function WireCandidatesPanel({
  dragIds,
  labels,
  enabledSourceTabs,
  sourceTab,
  onSourceTabChange,
  section,
  onSectionChange,
  sort,
  onSortChange,
  typeFilter,
  onTypeFilterChange,
  genreFilter,
  onGenreFilterChange,
  genreOptions,
  filteredReleases,
  releasesQuery,
  feedItems,
  isReleasePicked,
  isFeedPicked,
  onAddRelease,
  onAddFeed,
  onSearchPick,
}: WireCandidatesPanelProps) {
  const copy = { ...DEFAULT_WIRE_PICKS_LABELS, ...labels }

  return (
    <section className="wire-desk__panel" aria-labelledby="wire-candidates-heading">
      <header className="wire-desk__header">
        <div>
          <p className="wire-desk__kicker">{copy.candidatesKicker}</p>
          <h3 id="wire-candidates-heading" className="wire-desk__title">
            {copy.candidatesTitle}
          </h3>
        </div>
      </header>
      <div className="wire-desk__body">
        <div className="wire-desk__toolbar">
          <div className="wire-desk__source-tabs" role="tablist" aria-label="Candidate sources">
            {enabledSourceTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={sourceTab === tab ? 'true' : 'false'}
                className={cn('wire-desk__tab', sourceTab === tab && 'wire-desk__tab--active')}
                onClick={() => onSourceTabChange(tab)}
              >
                {WIRE_SOURCE_TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          {sourceTab === 'releases' ? (
            <>
              <div className="wire-desk__section-tabs" role="tablist" aria-label="Release sections">
                {(Object.keys(WIRE_SECTION_LABELS) as WireReleaseSection[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={section === key ? 'true' : 'false'}
                    className={cn('wire-desk__tab', section === key && 'wire-desk__tab--active')}
                    onClick={() => onSectionChange(key)}
                  >
                    {WIRE_SECTION_LABELS[key]}
                  </button>
                ))}
              </div>
              <div className="wire-desk__filters">
                <select
                  className="wire-desk__select"
                  value={sort}
                  onChange={(event) => onSortChange(event.target.value as WireSort)}
                  aria-label="Sort releases"
                >
                  {WIRE_SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  className="wire-desk__select"
                  value={typeFilter}
                  onChange={(event) => onTypeFilterChange(event.target.value as WireTypeFilter)}
                  aria-label="Filter by release type"
                >
                  {WIRE_TYPE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  className="wire-desk__select"
                  value={genreFilter}
                  onChange={(event) => onGenreFilterChange(event.target.value)}
                  aria-label="Filter by genre"
                >
                  <option value="">All genres</option>
                  {genreOptions.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}

          {sourceTab === 'search' ? (
            <div className="wire-desk__search-wrap">
              <p className="wire-desk__kicker wire-desk__search-kicker">
                <Search size={11} aria-hidden />
                Search all site audio
              </p>
              <ArticleAudioSearchPicker onSelect={onSearchPick} />
            </div>
          ) : null}
        </div>

        {sourceTab === 'releases' ? (
          releasesQuery.isLoading ? (
            <p className="wire-desk__status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading releases…
            </p>
          ) : (
            <div className="wire-desk__scroll">
              <div className="wire-desk__list">
                {filteredReleases.length === 0 ? (
                  <div className="wire-desk__empty">No releases match these filters.</div>
                ) : (
                  filteredReleases.map((release) => (
                    <WireCandidateReleaseRow
                      key={release.id}
                      release={release}
                      picked={isReleasePicked(release.id)}
                      dragIds={dragIds}
                      onAdd={() => onAddRelease(release)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        ) : null}

        {sourceTab === 'community' ? (
          <div className="wire-desk__scroll">
            <div className="wire-desk__list">
              {feedItems.length === 0 ? (
                <div className="wire-desk__empty">No community spins available yet.</div>
              ) : (
                feedItems.map((feed) => (
                  <WireCandidateFeedRow
                    key={feed.id}
                    feed={feed}
                    picked={isFeedPicked(feed.id)}
                    dragIds={dragIds}
                    onAdd={() => onAddFeed(feed)}
                  />
                ))
              )}
            </div>
          </div>
        ) : null}

        {sourceTab === 'search' ? <p className="wire-desk__hint">{copy.searchHint}</p> : null}
      </div>
    </section>
  )
}
