import { useQuery } from '@tanstack/react-query'
import { Play, Shuffle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMyPlaylist, getPlaylistDetail, getReleaseDetail } from '@/modules/music/api/music.api'
import { PlaylistTrackList } from '@/modules/music/components/playlists/playlist-track-list'
import { formatPlaylistTotalDuration } from '@/modules/music/lib/playlist-detail-format'
import { playPlaylistFromDetail, playReleaseFromDetail } from '@/modules/music/lib/player-queue'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Loader } from '@/shared/components/feedback/loader'
import '@/modules/music/styles/playlist-picker.css'

export function PlayerPlaylistModal() {
  const isOpen = usePlayerStore((s) => s.isPlaylistModalOpen)
  const closePlaylistModal = usePlayerStore((s) => s.closePlaylistModal)
  const queueSource = usePlayerStore((s) => s.queueSource)
  const playTrack = usePlayerStore((s) => s.playTrack)
  const shuffleQueueAnimated = usePlayerStore((s) => s.shuffleQueueAnimated)

  const slug =
    queueSource?.kind === 'playlist'
      ? queueSource.slug
      : queueSource?.kind === 'release'
        ? queueSource.slug ?? queueSource.id
        : ''

  const { data: playlist, isLoading: playlistLoading } = useQuery({
    queryKey: ['player-modal-playlist', slug],
    queryFn: () =>
      queueSource?.kind === 'playlist'
        ? queueSource.isOwn
          ? getMyPlaylist(slug)
          : getPlaylistDetail(slug)
        : null,
    enabled: isOpen && queueSource?.kind === 'playlist' && Boolean(slug),
  })

  const { data: release, isLoading: releaseLoading } = useQuery({
    queryKey: ['player-modal-release', slug],
    queryFn: () => getReleaseDetail(slug),
    enabled: isOpen && queueSource?.kind === 'release' && Boolean(slug),
  })

  const isLoading = playlistLoading || releaseLoading
  const title = queueSource?.title ?? 'Now playing'
  const coverUrl =
    queueSource?.kind === 'playlist'
      ? (playlist?.coverUrl ?? queueSource.coverUrl)
      : queueSource?.kind === 'release'
        ? (release?.coverUrl ?? queueSource.coverUrl)
        : undefined

  const fullPageHref =
    queueSource?.kind === 'playlist'
      ? queueSource.isOwn
        ? `/library/playlists/${queueSource.slug}`
        : `/playlists/${queueSource.slug}`
      : queueSource?.kind === 'release'
        ? `/releases/${queueSource.slug ?? queueSource.id}`
        : '#'

  const handlePlayAll = () => {
    if (playlist) playPlaylistFromDetail(playlist, playTrack, { isOwn: queueSource?.kind === 'playlist' && queueSource.isOwn })
    else if (release) playReleaseFromDetail(release, playTrack)
  }

  const handleShufflePlay = async () => {
    if (playlist) {
      playPlaylistFromDetail(playlist, playTrack, {
        shuffled: true,
        isOwn: queueSource?.kind === 'playlist' && queueSource.isOwn,
      })
    } else if (release) {
      playReleaseFromDetail(release, playTrack, { shuffled: true })
    }
    await shuffleQueueAnimated()
  }

  const playAtIndex = (index: number) => {
    if (playlist) playPlaylistFromDetail(playlist, playTrack, { startIndex: index })
    else if (release) playReleaseFromDetail(release!, playTrack, { startIndex: index })
  }

  if (!queueSource || (queueSource.kind !== 'playlist' && queueSource.kind !== 'release')) {
    return null
  }

  const tracks = playlist?.tracks ?? release?.tracks.map((t) => ({
    trackId: t.id,
    sortOrder: t.trackNumber,
    title: t.title,
    artistName: release?.artistName ?? 'Unknown',
    durationSec: t.durationSec,
    audioUrl: t.audioUrl,
  })) ?? []

  const playlistLike = playlist ?? (release
    ? {
        id: release.id,
        title: release.title,
        slug: release.slug ?? release.id,
        coverUrl: release.coverUrl,
        description: undefined,
        visibility: 'public' as const,
        ownerType: 'artist' as const,
        tracks,
      }
    : null)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePlaylistModal()}>
      <DialogContent className="playlist-picker-dialog max-h-[85vh] max-w-2xl overflow-hidden p-0">
        <div className="playlist-picker-dialog__hero">
          <DialogHeader className="space-y-0 text-left">
            <div className="flex items-start gap-4">
              <div className="playlist-picker-dialog__cover size-20 shrink-0 rounded-md">
                {coverUrl ? (
                  <img src={coverUrl} alt="" className="size-full object-cover" />
                ) : (
                  <span className="playlist-picker-dialog__cover-fallback text-lg">♪</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="playlist-picker-dialog__title truncate">{title}</DialogTitle>
                <p className="playlist-picker-dialog__track mt-1">
                  {tracks.length} song{tracks.length === 1 ? '' : 's'}
                  {playlist?.tracks.length
                    ? ` · ${formatPlaylistTotalDuration(playlist.tracks)}`
                    : ''}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" className="gap-1" onClick={handlePlayAll} disabled={!tracks.length}>
                    <Play className="size-4" fill="currentColor" />
                    Play all
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-primary/25"
                    onClick={() => void handleShufflePlay()}
                    disabled={!tracks.length}
                  >
                    <Shuffle className="size-4" />
                    Shuffle
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="playlist-picker-dialog__body max-h-[50vh] overflow-y-auto">
          {isLoading ? <Loader /> : null}
          {!isLoading && playlistLike ? (
            <PlaylistTrackList
              playlist={playlistLike}
              onPlayTrack={playAtIndex}
              variant="compact"
              showDateAdded={false}
            />
          ) : null}
        </div>

        <div className="border-t border-primary/10 px-5 py-4">
          <Button variant="link" className="h-auto p-0" asChild>
            <Link to={fullPageHref} onClick={closePlaylistModal}>
              Open full page
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
