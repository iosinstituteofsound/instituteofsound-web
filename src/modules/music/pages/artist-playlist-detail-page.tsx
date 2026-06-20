import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import {
  addTrackToArtistPlaylist,
  getArtistPlaylist,
  updateArtistPlaylist,
} from '@/modules/music/api/music.api'
import { PlaylistDetailView } from '@/modules/music/components/playlist-detail-view'
import { PlaylistEditView } from '@/modules/music/components/playlist-edit-view'
import { playlistToPlayerQueue } from '@/modules/music/lib/player-queue'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { Page, PageSection } from '@/shared/components/layout/page-shell'
import { Loader } from '@/shared/components/feedback/loader'
import { Button } from '@/shared/components/ui/button'

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

  const playAtIndex = (index: number) => {
    if (!playlist) return
    const track = playlist.tracks[index]
    if (!track) return
    const url = track.audioUrl ?? track.streamUrl
    if (!url) return
    const queue = playlistToPlayerQueue(playlist)
    if (!queue.length) return
    const queueIndex = queue.findIndex(
      (item) => item.trackId === track.trackId || item.audioUrl === url,
    )
    playTrack(queue[queueIndex >= 0 ? queueIndex : 0], {
      queue,
      queueIndex: queueIndex >= 0 ? queueIndex : 0,
    })
  }

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

  if (isEditing) {
    return (
      <PlaylistEditView
        playlist={playlist}
        editTitle={editTitle}
        onEditTitleChange={setEditTitle}
        editDescription={editDescription}
        onEditDescriptionChange={setEditDescription}
        editCoverUrl={editCoverUrl}
        onEditCoverUrlChange={(url) => setEditCoverUrl(url ?? '')}
        editVisibility={editVisibility}
        onEditVisibilityChange={setEditVisibility}
        onSave={() => saveMutation.mutate()}
        onCancel={cancelEdit}
        isSaving={saveMutation.isPending}
        onPlayAll={handlePlayAll}
        onPlayTrack={playAtIndex}
        onRemoveTrack={(trackId) => removeTrackMutation.mutate(trackId)}
        isRemovingTrack={removeTrackMutation.isPending}
        playlistTrackIds={playlistTrackIds}
        onAddTrack={(trackId) => addTrackMutation.mutate(trackId)}
        isAddingTrack={addTrackMutation.isPending}
      />
    )
  }

  return (
    <PlaylistDetailView
      playlist={playlist}
      onRemoveTrack={(trackId) => removeTrackMutation.mutate(trackId)}
      isRemovingTrack={removeTrackMutation.isPending}
      backHref="/artist/playlists"
      backLabel="Back to playlists"
      headerActions={
        <>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          {playlist.visibility === 'public' ? (
            <Button size="sm" variant="secondary" className="gap-2" asChild>
              <Link to={`/playlists/${playlist.slug}`}>Public page</Link>
            </Button>
          ) : null}
        </>
      }
    />
  )
}
