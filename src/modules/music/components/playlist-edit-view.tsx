import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  Play,
  X,
} from 'lucide-react'
import type { PlaylistDetailDto } from '@/modules/music/types/music.types'
import { PlaylistTrackSearchPanel } from '@/modules/music/components/playlist-track-search-panel'
import { PlaylistCoverUpload } from '@/modules/music/components/playlist-cover-upload'
import { PlaylistTrackTable } from '@/modules/music/components/playlist-track-table'
import { usePlaylistCoverTheme } from '@/modules/music/hooks/use-playlist-cover-theme'
import { playlistCoverThemeStyle } from '@/modules/music/lib/playlist-cover-theme'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import '@/modules/music/styles/playlist-detail.css'

interface PlaylistEditViewProps {
  playlist: PlaylistDetailDto
  editTitle: string
  onEditTitleChange: (value: string) => void
  editDescription: string
  onEditDescriptionChange: (value: string) => void
  editCoverUrl: string
  onEditCoverUrlChange: (value: string | null) => void
  editVisibility: 'public' | 'private'
  onEditVisibilityChange: (value: 'public' | 'private') => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  onPlayAll: () => void
  onPlayTrack: (index: number) => void
  onRemoveTrack: (trackId: string) => void
  isRemovingTrack: boolean
  playlistTrackIds: Set<string>
  onAddTrack: (trackId: string) => void
  isAddingTrack: boolean
}

export function PlaylistEditView({
  playlist,
  editTitle,
  onEditTitleChange,
  editDescription,
  onEditDescriptionChange,
  editCoverUrl,
  onEditCoverUrlChange,
  editVisibility,
  onEditVisibilityChange,
  onSave,
  onCancel,
  isSaving,
  onPlayAll,
  onPlayTrack,
  onRemoveTrack,
  isRemovingTrack,
  playlistTrackIds,
  onAddTrack,
  isAddingTrack,
}: PlaylistEditViewProps) {
  const theme = usePlaylistCoverTheme(editCoverUrl || playlist.coverUrl, playlist.slug)
  const themeStyle = useMemo(() => playlistCoverThemeStyle(theme), [theme])

  return (
    <div className="playlist-detail playlist-edit" style={themeStyle}>
      <header className="playlist-detail__hero playlist-edit__hero">
        <div className="playlist-detail__hero-bg" aria-hidden />
        <div className="playlist-detail__hero-noise" aria-hidden />

        <div className="playlist-detail__hero-nav">
          <Link to="/artist/playlists" className="playlist-detail__back" aria-label="Back to playlists">
            <ArrowLeft size={18} strokeWidth={2} aria-hidden />
          </Link>
          <div className="playlist-detail__hero-actions">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={onCancel}
            >
              <X className="size-4" />
              Close edit
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="gap-2"
              onClick={onPlayAll}
              disabled={!playlist.tracks.length}
            >
              <Play className="size-4" />
              Play all
            </Button>
            {playlist.visibility === 'public' ? (
              <Button size="sm" variant="outline" asChild>
                <Link to={`/playlists/${playlist.slug}`}>Public page</Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="playlist-edit__hero-copy">
          <p className="playlist-edit__kicker">Editing playlist</p>
          <h1 className="playlist-detail__title">{editTitle.trim() || playlist.title}</h1>
          <p className="playlist-edit__meta">
            {playlist.tracks.length} track{playlist.tracks.length === 1 ? '' : 's'} · {editVisibility}
          </p>
        </div>
      </header>

      <div className="playlist-edit__body">
        <div className="playlist-edit__grid">
          <section className="playlist-edit__panel playlist-edit__details" aria-label="Playlist details">
            <div className="playlist-edit__details-grid">
              <PlaylistCoverUpload value={editCoverUrl} onChange={onEditCoverUrlChange} />

              <div className="playlist-edit__fields">
                <div className="playlist-edit__field">
                  <Label htmlFor="edit-playlist-title" className="playlist-edit__label">
                    Title
                  </Label>
                  <Input
                    id="edit-playlist-title"
                    value={editTitle}
                    onChange={(e) => onEditTitleChange(e.target.value)}
                    className="playlist-edit__input"
                  />
                </div>

                <div className="playlist-edit__field">
                  <Label htmlFor="edit-playlist-description" className="playlist-edit__label">
                    Description
                  </Label>
                  <Textarea
                    id="edit-playlist-description"
                    value={editDescription}
                    onChange={(e) => onEditDescriptionChange(e.target.value)}
                    rows={4}
                    className="playlist-edit__textarea"
                  />
                </div>

                <div className="playlist-edit__field">
                  <Label htmlFor="edit-playlist-visibility" className="playlist-edit__label">
                    Visibility
                  </Label>
                  <select
                    id="edit-playlist-visibility"
                    className="playlist-edit__select"
                    value={editVisibility}
                    onChange={(e) =>
                      onEditVisibilityChange(e.target.value as 'public' | 'private')
                    }
                  >
                    <option value="public">Public (discoverable)</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="playlist-edit__actions">
                  <Button
                    onClick={onSave}
                    disabled={!editTitle.trim() || isSaving}
                    className="playlist-edit__save"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      'Save changes'
                    )}
                  </Button>
                  <Button variant="outline" onClick={onCancel} className="playlist-edit__cancel">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <aside className="playlist-edit__panel playlist-edit__search-panel">
            <PlaylistTrackSearchPanel
              variant="studio"
              hideHeader
              playlistTrackIds={playlistTrackIds}
              isAdding={isAddingTrack}
              onAddTrack={onAddTrack}
            />
          </aside>
        </div>

        <section className="playlist-edit__tracks" aria-label="Tracks in playlist">
          <PlaylistTrackTable
            playlist={playlist}
            onPlayTrack={onPlayTrack}
            onRemoveTrack={onRemoveTrack}
            isRemovingTrack={isRemovingTrack}
          />
        </section>
      </div>
    </div>
  )
}
