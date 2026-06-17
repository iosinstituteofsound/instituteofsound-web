import { Loader2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useExplore } from '@/modules/explore/hooks/use-explore'
import {
  collectSiteAudioTracks,
  searchSiteAudioTracks,
  type SiteAudioTrack,
} from '@/modules/editor/lib/site-audio-library'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

interface ArticleAudioSearchPickerProps {
  selectedTrackId?: string | null
  onSelect: (track: SiteAudioTrack) => void
  className?: string
}

export function ArticleAudioSearchPicker({
  selectedTrackId = null,
  onSelect,
  className,
}: ArticleAudioSearchPickerProps) {
  const [query, setQuery] = useState('')
  const { data: explore, isLoading, isError } = useExplore()

  const catalog = useMemo(
    () => (explore ? collectSiteAudioTracks(explore) : []),
    [explore],
  )

  const results = useMemo(
    () => searchSiteAudioTracks(catalog, query),
    [catalog, query],
  )

  return (
    <div className={cn('article-audio-search', className)}>
      <div className="article-audio-search__field">
        <Search className="article-audio-search__icon" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search site audio…"
          className="article-audio-search__input"
          autoComplete="off"
        />
      </div>

      {isLoading ? (
        <p className="article-audio-search__status">
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
          <span>Loading catalog…</span>
        </p>
      ) : isError ? (
        <p className="article-audio-search__status article-audio-search__status--error">
          Could not load site audio. Paste an external link below.
        </p>
      ) : catalog.length === 0 ? (
        <p className="article-audio-search__status">No site audio yet. Paste an external link below.</p>
      ) : (
        <ul className="article-audio-search__results" role="listbox" aria-label="Site audio results">
          {results.length === 0 ? (
            <li className="article-audio-search__empty">No tracks match &ldquo;{query}&rdquo;</li>
          ) : (
            results.map((track) => (
              <li key={track.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedTrackId === track.id}
                  className={cn(
                    'article-audio-search__item',
                    selectedTrackId === track.id && 'article-audio-search__item--active',
                  )}
                  onClick={() => onSelect(track)}
                >
                  <span className="article-audio-search__item-title">{track.title}</span>
                  <span className="article-audio-search__item-meta">
                    {track.artistName}
                    {track.sourceLabel ? ` · ${track.sourceLabel}` : ''}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
