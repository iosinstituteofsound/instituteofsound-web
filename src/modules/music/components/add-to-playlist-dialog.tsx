import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { addTrackToMyPlaylist, createMyPlaylist, listMyPlaylists } from '@/modules/music/api/music.api'
import { playlistListQueryKey } from '@/modules/music/lib/playlist-api'
import { usePlaylistPickerStore } from '@/modules/music/stores/playlist-picker-store'
import { useAuthStore } from '@/app/stores/auth-store'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import '@/modules/music/styles/playlist-picker.css'

export function AddToPlaylistDialog() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { isOpen, track, close } = usePlaylistPickerStore()
  const [newTitle, setNewTitle] = useState('')

  const { data: playlists, isLoading } = useQuery({
    queryKey: playlistListQueryKey('listener'),
    queryFn: listMyPlaylists,
    enabled: isOpen && isAuthenticated,
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: playlistListQueryKey('listener') })
  }

  const addMutation = useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: string; trackId: string }) =>
      addTrackToMyPlaylist(playlistId, trackId),
    onSuccess: () => {
      toast.success('Added to playlist')
      invalidate()
      close()
    },
    onError: () => toast.error('Could not add track'),
  })

  const createMutation = useMutation({
    mutationFn: ({ title, trackId }: { title: string; trackId: string }) =>
      createMyPlaylist({ title, visibility: 'private', trackIds: [trackId] }),
    onSuccess: () => {
      toast.success('Playlist created')
      invalidate()
      setNewTitle('')
      close()
    },
    onError: () => toast.error('Could not create playlist'),
  })

  if (!track) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="playlist-picker-dialog max-w-md">
        <div className="playlist-picker-dialog__hero">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="playlist-picker-dialog__title">Add to playlist</DialogTitle>
            <DialogDescription className="playlist-picker-dialog__track">
              {track.title}
              {track.artist ? ` · ${track.artist}` : ''}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="playlist-picker-dialog__body">
          {!isAuthenticated ? (
            <div className="space-y-3 py-2 text-sm">
              <p className="text-muted-foreground">Sign in to save tracks to your playlists.</p>
              <Button asChild>
                <Link to="/auth/login">Sign in</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="playlist-picker-dialog__list">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-5 animate-spin text-primary" />
                  </div>
                ) : null}
                {(playlists ?? []).map((pl) => {
                  const alreadyHas = pl.tracks.some((t) => t.trackId === track.trackId)
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      disabled={alreadyHas || addMutation.isPending}
                      className="playlist-picker-dialog__row"
                      onClick={() => addMutation.mutate({ playlistId: pl.id, trackId: track.trackId })}
                    >
                      <span className="playlist-picker-dialog__cover">
                        {pl.coverUrl ? (
                          <img src={pl.coverUrl} alt="" />
                        ) : (
                          <span className="playlist-picker-dialog__cover-fallback">♪</span>
                        )}
                      </span>
                      <span className="playlist-picker-dialog__meta">
                        <span className="playlist-picker-dialog__meta-title">{pl.title}</span>
                        <span className="playlist-picker-dialog__meta-sub">
                          {pl.tracks.length} tracks
                          {alreadyHas ? ' · Already added' : ''}
                        </span>
                      </span>
                    </button>
                  )
                })}
                {!isLoading && !(playlists ?? []).length ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No playlists yet.</p>
                ) : null}
              </div>

              <div className="playlist-picker-dialog__create">
                <Input
                  placeholder="New playlist name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Button
                  className="shrink-0 gap-1"
                  disabled={!newTitle.trim() || createMutation.isPending}
                  onClick={() =>
                    createMutation.mutate({ title: newTitle.trim(), trackId: track.trackId })
                  }
                >
                  <Plus className="size-4" />
                  Create
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
