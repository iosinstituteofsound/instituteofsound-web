import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Play } from 'lucide-react'
import { getPlaylistDetail } from '@/modules/music/api/music.api'
import { playlistToPlayerQueue } from '@/modules/music/lib/player-queue'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { Loader } from '@/shared/components/feedback/loader'
import { Button } from '@/shared/components/ui/button'

export function PlaylistDetailPage() {
  const { slug = '' } = useParams()
  const playTrack = usePlayerStore((s) => s.playTrack)

  const { data: playlist, isLoading, isError } = useQuery({
    queryKey: ['playlist', slug],
    queryFn: () => getPlaylistDetail(slug),
    enabled: Boolean(slug),
  })

  const handlePlayAll = () => {
    if (!playlist) return
    const queue = playlistToPlayerQueue(playlist)
    if (!queue.length) return
    playTrack(queue[0], { queue })
  }

  if (isLoading) return <Loader className="min-h-[50vh]" />

  if (isError || !playlist) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Playlist not found or is private.</p>
        <Link to="/explore" className="text-sm underline">
          Back to Explore
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex gap-6">
        {playlist.coverUrl ? (
          <img src={playlist.coverUrl} alt="" className="size-40 rounded-lg object-cover shadow" />
        ) : (
          <div className="flex size-40 items-center justify-center rounded-lg bg-muted text-4xl">♪</div>
        )}
        <div className="space-y-2">
          <p className="text-sm uppercase text-muted-foreground">Playlist</p>
          <h1 className="text-3xl font-bold">{playlist.title}</h1>
          {playlist.description ? (
            <p className="text-muted-foreground">{playlist.description}</p>
          ) : null}
          <Button onClick={handlePlayAll} className="gap-2">
            <Play className="size-4" />
            Play All
          </Button>
        </div>
      </div>

      <ol className="divide-y rounded-lg border">
        {playlist.tracks.map((track, index) => (
          <li key={`${track.trackId}-${index}`} className="flex items-center gap-4 px-4 py-3">
            <span className="w-6 text-sm text-muted-foreground">{index + 1}</span>
            <div className="flex-1">
              <p className="font-medium">{track.title}</p>
              <p className="text-sm text-muted-foreground">{track.artistName}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const url = track.audioUrl ?? track.streamUrl
                if (!url) return
                const queue = playlistToPlayerQueue(playlist)
                const idx = queue.findIndex((q) => q.audioUrl === url)
                playTrack(queue[idx >= 0 ? idx : 0], { queue, queueIndex: idx >= 0 ? idx : 0 })
              }}
            >
              <Play className="size-4" />
            </Button>
          </li>
        ))}
      </ol>
    </div>
  )
}
