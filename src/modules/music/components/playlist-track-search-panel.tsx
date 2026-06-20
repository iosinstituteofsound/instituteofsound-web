import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Plus, Search } from 'lucide-react'
import { searchArtistPlaylistTracks } from '@/modules/music/api/music.api'
import type { PlaylistTrackSearchItemDto } from '@/modules/music/types/music.types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

function formatDuration(durationSec?: number) {
  if (!durationSec) return null
  return `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`
}

type PlaylistTrackSearchPanelProps = {
  playlistTrackIds: Set<string>
  onAddTrack: (trackId: string) => void
  isAdding?: boolean
  variant?: 'default' | 'studio'
  hideHeader?: boolean
}

function TrackResultRow({
  track,
  disabled,
  onAdd,
  variant,
}: {
  track: PlaylistTrackSearchItemDto
  disabled?: boolean
  onAdd: () => void
  variant: 'default' | 'studio'
}) {
  const duration = formatDuration(track.durationSec)

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-3',
        variant === 'studio'
          ? 'playlist-search-panel__result'
          : 'border bg-muted/20',
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate font-medium',
            variant === 'studio' && 'playlist-search-panel__result-title',
          )}
        >
          {track.title}
        </p>
        <p
          className={cn(
            'truncate text-xs',
            variant === 'studio'
              ? 'playlist-search-panel__result-meta'
              : 'text-muted-foreground',
          )}
        >
          {track.artistName}
          {track.releaseTitle ? ` · ${track.releaseTitle}` : ''}
          {duration ? ` · ${duration}` : ''}
        </p>
      </div>
      <Button size="sm" className="shrink-0 gap-1" disabled={disabled} onClick={onAdd}>
        <Plus className="size-4" />
        Add
      </Button>
    </li>
  )
}

function SearchSection({
  title,
  tracks,
  disabled,
  onAddTrack,
  variant,
}: {
  title: string
  tracks: PlaylistTrackSearchItemDto[]
  disabled?: boolean
  onAddTrack: (trackId: string) => void
  variant: 'default' | 'studio'
}) {
  if (!tracks.length) return null

  return (
    <div className="space-y-2">
      <p
        className={cn(
          'font-display text-xs font-bold uppercase tracking-[0.12em]',
          variant === 'studio'
            ? 'playlist-search-panel__section-title'
            : 'text-foreground',
        )}
      >
        {title}
      </p>
      <ul className="space-y-2">
        {tracks.map((track) => (
          <TrackResultRow
            key={track.trackId}
            track={track}
            disabled={disabled}
            onAdd={() => onAddTrack(track.trackId)}
            variant={variant}
          />
        ))}
      </ul>
    </div>
  )
}

export function PlaylistTrackSearchPanel({
  playlistTrackIds,
  onAddTrack,
  isAdding,
  variant = 'default',
  hideHeader = false,
}: PlaylistTrackSearchPanelProps) {
  const [trackQuery, setTrackQuery] = useState('')
  const debouncedQuery = useDebouncedValue(trackQuery, 300)
  const trimmedQuery = debouncedQuery.trim()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['artist-playlist-track-search', trimmedQuery],
    queryFn: () => searchArtistPlaylistTracks(trimmedQuery, 10),
    enabled: trimmedQuery.length >= 2,
    staleTime: 30_000,
  })

  const filterAvailable = (tracks: PlaylistTrackSearchItemDto[]) =>
    tracks.filter((track) => !playlistTrackIds.has(track.trackId))

  const yourReleases = filterAvailable(data?.yourReleases ?? [])
  const otherReleases = filterAvailable(data?.otherReleases ?? [])
  const siteTracks = filterAvailable(data?.siteTracks ?? [])
  const hasResults = yourReleases.length + otherReleases.length + siteTracks.length > 0
  const showEmpty = trimmedQuery.length >= 2 && !isLoading && !isFetching && !hasResults

  return (
    <div className={cn('playlist-search-panel', variant === 'default' && 'rounded-lg border')}>
      {!hideHeader ? (
        <div className={cn('playlist-search-panel__head px-4 py-4 sm:px-5', variant === 'default' && 'border-b')}>
          <p className="playlist-search-panel__title font-display text-xs font-bold uppercase tracking-[0.12em]">
            Add tracks
          </p>
          <p className="playlist-search-panel__hint mt-1 text-sm text-muted-foreground">
            Search across your releases, other releases, and site tracks.
          </p>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              placeholder="Search releases and tracks…"
              className="playlist-search-panel__input pl-9"
            />
          </div>
        </div>
      ) : (
        <div className="playlist-search-panel__head playlist-search-panel__head--compact px-4 pb-3 pt-4 sm:px-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              placeholder="Search releases and tracks…"
              className="playlist-search-panel__input pl-9"
            />
          </div>
        </div>
      )}

      <div className="max-h-[32rem] overflow-y-auto p-3 sm:p-4">
        {trimmedQuery.length < 2 ? (
          <p className="playlist-search-panel__empty px-1 py-8 text-center text-sm text-muted-foreground">
            Type at least 2 characters to search the site catalog.
          </p>
        ) : isLoading || isFetching ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : showEmpty ? (
          <p className="playlist-search-panel__empty px-1 py-8 text-center text-sm text-muted-foreground">
            No matching tracks found.
          </p>
        ) : (
          <div className="space-y-5">
            <SearchSection
              title="Your releases"
              tracks={yourReleases}
              disabled={isAdding}
              onAddTrack={onAddTrack}
              variant={variant}
            />
            <SearchSection
              title="Other releases"
              tracks={otherReleases}
              disabled={isAdding}
              onAddTrack={onAddTrack}
              variant={variant}
            />
            <SearchSection
              title="Site tracks"
              tracks={siteTracks}
              disabled={isAdding}
              onAddTrack={onAddTrack}
              variant={variant}
            />
          </div>
        )}
      </div>
    </div>
  )
}
