import { Loader2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  searchSiteAudioTracks,
  type SiteAudioTrack,
} from '@/modules/editor/lib/site-audio-library'
import { searchAudioLibraryTracks } from '@/modules/editor/api/audio-library.api'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'
import '@/modules/editor/styles/article-audio-search-picker.css'

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
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['audio-library', query],
    queryFn: () => searchAudioLibraryTracks({ q: query, limit: 50 }),
    staleTime: 30_000,
  })

  const catalog = useMemo<SiteAudioTrack[]>(
    () =>
      (data ?? []).map((track) => ({
        id: track.id,
        title: track.title,
        artistName: track.artistName,
        streamUrl: track.streamUrl,
        durationSec: track.durationSec,
        source: 'release',
        sourceLabel: 'Audio Library',
        releaseId: track.releaseId,
      })),
    [data],
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
          placeholder="Search audio library…"
          className="article-audio-search__input"
          autoComplete="off"
        />
      </div>

      {isLoading ? (
        <p className="article-audio-search__status">
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
          <span>Loading library…</span>
        </p>
      ) : isError ? (
        <p className="article-audio-search__status article-audio-search__status--error">
          <span>Could not load audio library.</span>
          <button
            type="button"
            className="article-audio-search__retry"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {isFetching ? 'Retrying…' : 'Try again'}
          </button>
        </p>
      ) : catalog.length === 0 ? (
        <p className="article-audio-search__status">No tracks found.</p>
      ) : (
        <div className="article-audio-search__results">
          {results.length === 0 ? (
            <div className="article-audio-search__empty">No tracks match &ldquo;{query}&rdquo;</div>
          ) : (
            results.map((track) => (
              <button
                key={track.id}
                type="button"
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
            ))
          )}
        </div>
      )}
    </div>
  )
}
