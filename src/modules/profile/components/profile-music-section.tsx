import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { getArtistPublicByUserId } from '@/modules/music/api/music.api'
import { releaseToPlayerQueue, playlistToPlayerQueue } from '@/modules/music/lib/player-queue'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { Button } from '@/shared/components/ui/button'
import { Loader } from '@/shared/components/feedback/loader'

interface ProfileMusicSectionProps {
  userId: string
}

export function ProfileMusicSection({ userId }: ProfileMusicSectionProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['artist-public-user', userId],
    queryFn: () => getArtistPublicByUserId(userId),
    enabled: Boolean(userId),
    retry: false,
  })

  if (isLoading) return <Loader />
  if (isError || !data) return null

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-xl font-bold">Releases</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.releases.map((release) => (
            <div key={release.id} className="rounded-lg border p-4">
              {release.coverUrl ? (
                <img src={release.coverUrl} alt="" className="mb-3 aspect-square w-full rounded object-cover" />
              ) : null}
              <p className="font-semibold">{release.title}</p>
              <p className="text-sm capitalize text-muted-foreground">
                {release.type} · {release.tracks.length || 1} tracks
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => {
                    const queue = releaseToPlayerQueue(release)
                    if (queue.length) playTrack(queue[0], { queue })
                  }}
                >
                  <Play className="size-3" />
                  Play
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link to={`/releases/${release.slug ?? release.id}`}>View</Link>
                </Button>
              </div>
            </div>
          ))}
          {!data.releases.length ? (
            <p className="text-sm text-muted-foreground">No releases published yet.</p>
          ) : null}
        </div>
      </section>

      {data.playlists.length ? (
        <section>
          <h2 className="mb-4 text-xl font-bold">Public Playlists</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.playlists.map((pl) => (
              <div key={pl.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-semibold">{pl.title}</p>
                  <p className="text-sm text-muted-foreground">{pl.tracks.length} tracks</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const queue = playlistToPlayerQueue(pl)
                      if (queue.length) playTrack(queue[0], { queue })
                    }}
                  >
                    Play
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/playlists/${pl.slug}`}>Open</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

interface ListenerPlaylistsSectionProps {
  isOwnProfile: boolean
}

export function ListenerPlaylistsSection({ isOwnProfile }: ListenerPlaylistsSectionProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const playTrack = usePlayerStore((s) => s.playTrack)

  const { data: playlists, isLoading } = useQuery({
    queryKey: ['my-playlists'],
    queryFn: async () => {
      const { listMyPlaylists } = await import('@/modules/music/api/music.api')
      return listMyPlaylists()
    },
    enabled: isOwnProfile,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const { createMyPlaylist } = await import('@/modules/music/api/music.api')
      return createMyPlaylist({ title, visibility: 'private' })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-playlists'] })
      setTitle('')
    },
  })

  if (!isOwnProfile) return null
  if (isLoading) return <Loader />

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">My Playlists</h2>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2 text-sm"
          placeholder="New playlist name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button onClick={() => createMutation.mutate()} disabled={!title}>
          Create
        </Button>
      </div>
      <div className="space-y-2">
        {(playlists ?? []).map((pl) => (
          <div key={pl.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">{pl.title}</p>
              <p className="text-xs text-muted-foreground">
                {pl.visibility} · {pl.tracks.length} tracks
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const queue = playlistToPlayerQueue(pl)
                if (queue.length) playTrack(queue[0], { queue })
              }}
            >
              Play
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
