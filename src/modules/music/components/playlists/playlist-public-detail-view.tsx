import { Link } from 'react-router-dom'
import { ArrowLeft, Play, Shuffle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getPlaylistDetail } from '@/modules/music/api/music.api'
import { PlaylistTrackList } from '@/modules/music/components/playlists/playlist-track-list'
import {
  formatPlaylistTotalDuration,
  playlistCuratorLabel,
} from '@/modules/music/lib/playlist-detail-format'
import { playPlaylistFromDetail } from '@/modules/music/lib/player-queue'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { Page, PageSection } from '@/shared/components/layout/page-shell'
import { Loader } from '@/shared/components/feedback/loader'
import { Button } from '@/shared/components/ui/button'
import '@/modules/music/styles/playlist.css'

type PlaylistPublicDetailViewProps = {
  slug: string
  backHref?: string
  backLabel?: string
}

export function PlaylistPublicDetailView({
  slug,
  backHref = '/explore',
  backLabel = 'Back to Explore',
}: PlaylistPublicDetailViewProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const shuffleQueueAnimated = usePlayerStore((s) => s.shuffleQueueAnimated)

  const { data: playlist, isLoading, isError } = useQuery({
    queryKey: ['playlist', slug],
    queryFn: () => getPlaylistDetail(slug),
    enabled: Boolean(slug),
  })

  const playAtIndex = (index: number) => {
    if (!playlist) return
    playPlaylistFromDetail(playlist, playTrack, { startIndex: index })
  }

  const handlePlayAll = () => {
    if (!playlist) return
    playPlaylistFromDetail(playlist, playTrack)
  }

  const handleShufflePlay = async () => {
    if (!playlist) return
    playPlaylistFromDetail(playlist, playTrack, { shuffled: true })
    await shuffleQueueAnimated()
  }

  if (isLoading) return <Loader />

  if (isError || !playlist) {
    return (
      <Page>
        <PageSection className="mx-auto max-w-4xl space-y-4 text-center">
          <p className="text-muted-foreground">Playlist not found or is private.</p>
          <Button variant="outline" asChild>
            <Link to={backHref}>{backLabel}</Link>
          </Button>
        </PageSection>
      </Page>
    )
  }

  const trackCount = playlist.tracks.length
  const durationLabel = formatPlaylistTotalDuration(playlist.tracks)
  const curator = playlistCuratorLabel(playlist)

  return (
    <Page>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <PageSection className="space-y-5">
          <Button variant="ghost" size="sm" className="gap-1.5 px-2" asChild>
            <Link to={backHref}>
              <ArrowLeft className="size-4" aria-hidden />
              {backLabel}
            </Link>
          </Button>

          <div className="playlist-detail-header">
            <div className="playlist-detail-header__main">
              {playlist.coverUrl ? (
                <img src={playlist.coverUrl} alt="" className="playlist-detail-header__cover" />
              ) : (
                <div className="playlist-detail-header__cover-fallback" aria-hidden>
                  {playlist.title.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="playlist-detail-header__title">{playlist.title}</h1>
                <p className="playlist-detail-header__meta">
                  {curator}
                  {' · '}
                  {trackCount} track{trackCount === 1 ? '' : 's'}
                  {durationLabel !== '—' ? ` · ${durationLabel}` : ''}
                </p>
                {playlist.description ? (
                  <p className="playlist-detail-header__desc">{playlist.description}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="playlist-detail-toolbar">
            <Button className="gap-1.5" onClick={handlePlayAll} disabled={!trackCount}>
              <Play className="size-4" fill="currentColor" aria-hidden />
              Play
            </Button>
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => void handleShufflePlay()}
              disabled={!trackCount}
            >
              <Shuffle className="size-4" aria-hidden />
              Shuffle
            </Button>
          </div>
        </PageSection>

        <PageSection>
          <h2 className="playlist-section-label">Tracks</h2>
          <PlaylistTrackList playlist={playlist} onPlayTrack={playAtIndex} />
        </PageSection>
      </div>
    </Page>
  )
}
