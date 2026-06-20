import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Play,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  addTrackToArtistPlaylist,
  getArtistPlaylist,
  updateArtistPlaylist,
} from '@/modules/music/api/music.api'
import { PlaylistTrackSearchPanel } from '@/modules/music/components/playlist-track-search-panel'
import { PlaylistDetailView } from '@/modules/music/components/playlist-detail-view'
import { playlistToPlayerQueue } from '@/modules/music/lib/player-queue'
import { ProfileImageUpload } from '@/modules/profile/components/profile-image-upload'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { Page, PageHeader, PageSection, PageTitle, SectionLabel } from '@/shared/components/layout/page-shell'
import { Loader } from '@/shared/components/feedback/loader'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'

export function ArtistPlaylistDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const playTrack = usePlayerStore((s) => s.playTrack)

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCoverUrl, setEditCoverUrl] = useState('')
  const [editVisibility, setEditVisibility] = useState<'public' | 'private'>('public')

  const { data: playlist, isLoading, isError } = useQuery({
    queryKey: ['artist-playlist', slug],
    queryFn: () => getArtistPlaylist(slug),
    enabled: Boolean(slug),
  })

  useEffect(() => {
    if (!playlist || isEditing) return
    setEditTitle(playlist.title)
    setEditDescription(playlist.description ?? '')
    setEditCoverUrl(playlist.coverUrl ?? '')
    setEditVisibility(playlist.visibility)
  }, [playlist, isEditing])

  const playlistTrackIds = useMemo(
    () => new Set((playlist?.tracks ?? []).map((track) => track.trackId)),
    [playlist?.tracks],
  )

  const invalidatePlaylist = async (nextSlug?: string) => {
    await queryClient.invalidateQueries({ queryKey: ['artist-playlists'] })
    await queryClient.invalidateQueries({ queryKey: ['artist-playlist', slug] })
    if (nextSlug && nextSlug !== slug) {
      await queryClient.invalidateQueries({ queryKey: ['artist-playlist', nextSlug] })
      navigate(`/artist/playlists/${nextSlug}`, { replace: true })
    }
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!playlist) throw new Error('Playlist not found')
      return updateArtistPlaylist(playlist.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        coverUrl: editCoverUrl || undefined,
        visibility: editVisibility,
      })
    },
    onSuccess: async (updated) => {
      toast.success('Playlist updated')
      setIsEditing(false)
      await invalidatePlaylist(updated.slug)
    },
  })

  const addTrackMutation = useMutation({
    mutationFn: (trackId: string) => {
      if (!playlist) throw new Error('Playlist not found')
      return addTrackToArtistPlaylist(playlist.id, trackId)
    },
    onSuccess: async () => {
      toast.success('Track added')
      await invalidatePlaylist()
    },
  })

  const removeTrackMutation = useMutation({
    mutationFn: (trackId: string) => {
      if (!playlist) throw new Error('Playlist not found')
      const trackIds = playlist.tracks
        .filter((track) => track.trackId !== trackId)
        .map((track) => track.trackId)
      return updateArtistPlaylist(playlist.id, { trackIds })
    },
    onSuccess: async () => {
      toast.success('Track removed')
      await invalidatePlaylist()
    },
  })

  const handlePlayAll = () => {
    if (!playlist) return
    const queue = playlistToPlayerQueue(playlist)
    if (!queue.length) return
    playTrack(queue[0], { queue })
  }

  const cancelEdit = () => {
    if (!playlist) return
    setEditTitle(playlist.title)
    setEditDescription(playlist.description ?? '')
    setEditCoverUrl(playlist.coverUrl ?? '')
    setEditVisibility(playlist.visibility)
    setIsEditing(false)
  }

  if (isLoading) return <Loader />

  if (isError || !playlist) {
    return (
      <Page>
        <PageSection className="mx-auto max-w-4xl space-y-4 text-center">
          <p className="text-muted-foreground">Playlist not found.</p>
          <Button variant="outline" asChild>
            <Link to="/artist/playlists">Back to playlists</Link>
          </Button>
        </PageSection>
      </Page>
    )
  }

  if (!isEditing) {
    return (
      <PlaylistDetailView
        playlist={playlist}
        onRemoveTrack={(trackId) => removeTrackMutation.mutate(trackId)}
        isRemovingTrack={removeTrackMutation.isPending}
        topSlot={
          <div className="border-b border-white/10 bg-[#121212] px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
                <Link to="/artist/playlists">
                  <ArrowLeft className="size-4" />
                  Back
                </Link>
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="size-4" />
                  Edit playlist
                </Button>
                {playlist.visibility === 'public' ? (
                  <Button size="sm" variant="outline" className="border-white/20 text-white" asChild>
                    <Link to={`/playlists/${playlist.slug}`}>Public page</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        }
      />
    )
  }

  return (
    <Page>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <PageHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button variant="ghost" size="sm" className="-ml-2 shrink-0" asChild>
              <Link to="/artist/playlists">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
            <div className="min-w-0">
              <PageTitle className="truncate text-2xl sm:text-3xl">{playlist.title}</PageTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {playlist.tracks.length} track{playlist.tracks.length === 1 ? '' : 's'} · {playlist.visibility}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={isEditing ? 'secondary' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => setIsEditing((value) => !value)}
            >
              {isEditing ? <X className="size-4" /> : <Pencil className="size-4" />}
              {isEditing ? 'Close edit' : 'Edit playlist'}
            </Button>
            <Button size="sm" className="gap-2" onClick={handlePlayAll} disabled={!playlist.tracks.length}>
              <Play className="size-4" />
              Play all
            </Button>
            {playlist.visibility === 'public' ? (
              <Button size="sm" variant="outline" asChild>
                <Link to={`/playlists/${playlist.slug}`}>Public page</Link>
              </Button>
            ) : null}
          </div>
        </PageHeader>

        <PageSection className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-6">
              {isEditing ? (
                <div className="rounded-lg border p-5 sm:p-6">
                  <SectionLabel>Edit details</SectionLabel>
                  <div className="mt-4 grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-start">
                    <ProfileImageUpload
                      label="Cover art"
                      description="Square · PNG or JPG"
                      size="lg"
                      value={editCoverUrl}
                      onChange={(url) => setEditCoverUrl(url ?? '')}
                    />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-playlist-title">Title</Label>
                        <Input
                          id="edit-playlist-title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-playlist-description">Description</Label>
                        <Textarea
                          id="edit-playlist-description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-playlist-visibility">Visibility</Label>
                        <select
                          id="edit-playlist-visibility"
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                          value={editVisibility}
                          onChange={(e) =>
                            setEditVisibility(e.target.value as 'public' | 'private')
                          }
                        >
                          <option value="public">Public (discoverable)</option>
                          <option value="private">Private</option>
                        </select>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          onClick={() => saveMutation.mutate()}
                          disabled={!editTitle.trim() || saveMutation.isPending}
                        >
                          {saveMutation.isPending ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              Saving…
                            </>
                          ) : (
                            'Save changes'
                          )}
                        </Button>
                        <Button variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border p-5 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <div className="mx-auto size-44 shrink-0 overflow-hidden rounded-lg border bg-muted sm:mx-0">
                      {playlist.coverUrl ? (
                        <img src={playlist.coverUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-4xl text-muted-foreground">
                          ♪
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={playlist.visibility === 'public' ? 'default' : 'secondary'}>
                          {playlist.visibility}
                        </Badge>
                        <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                          Playlist
                        </span>
                      </div>

                      <h2 className="font-display text-2xl font-bold tracking-tight">{playlist.title}</h2>

                      {playlist.description ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {playlist.description}
                        </p>
                      ) : (
                        <p className="text-sm italic text-muted-foreground">No description yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border">
                <div className="border-b px-4 py-3 sm:px-5">
                  <SectionLabel>In this playlist</SectionLabel>
                </div>

                {playlist.tracks.length ? (
                  <ol className="divide-y">
                    {playlist.tracks.map((track, index) => (
                      <li
                        key={`${track.trackId}-${index}`}
                        className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5"
                      >
                        <span className="w-6 shrink-0 text-sm font-semibold text-muted-foreground">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{track.title}</p>
                          <p className="text-sm text-muted-foreground">{track.artistName}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const url = track.audioUrl ?? track.streamUrl
                              if (!url) return
                              const queue = playlistToPlayerQueue(playlist)
                              const idx = queue.findIndex((q) => q.audioUrl === url)
                              playTrack(queue[idx >= 0 ? idx : 0], {
                                queue,
                                queueIndex: idx >= 0 ? idx : 0,
                              })
                            }}
                          >
                            <Play className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={removeTrackMutation.isPending}
                            onClick={() => removeTrackMutation.mutate(track.trackId)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5">
                    No tracks yet. Search the site catalog and add tracks from the panel on the right.
                  </p>
                )}
              </div>
            </div>

            <PlaylistTrackSearchPanel
              playlistTrackIds={playlistTrackIds}
              isAdding={addTrackMutation.isPending}
              onAddTrack={(trackId) => addTrackMutation.mutate(trackId)}
            />
          </div>
        </PageSection>
      </div>
    </Page>
  )
}
