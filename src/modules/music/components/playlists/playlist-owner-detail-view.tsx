import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Copy, Play, Settings, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AddTracksPanel } from '@/modules/music/components/playlists/add-tracks-panel'
import { PlaylistSettingsDialog } from '@/modules/music/components/playlists/playlist-settings-dialog'
import { SortablePlaylistTrackList } from '@/modules/music/components/playlists/sortable-playlist-track-list'
import { usePlaylistDetailPage } from '@/modules/music/hooks/use-playlist-detail-page'
import {
  formatPlaylistTotalDuration,
} from '@/modules/music/lib/playlist-detail-format'
import { PLAYLIST_BASE_PATH } from '@/modules/music/lib/playlist-api'
import { playlistCapabilities } from '@/modules/music/lib/playlist-capabilities'
import { Page, PageSection } from '@/shared/components/layout/page-shell'
import { Loader } from '@/shared/components/feedback/loader'
import { Button } from '@/shared/components/ui/button'
import '@/modules/music/styles/playlist.css'

type PlaylistOwnerDetailViewProps = {
  slug: string
  basePath?: string
}

export function PlaylistOwnerDetailView({
  slug,
  basePath = PLAYLIST_BASE_PATH,
}: PlaylistOwnerDetailViewProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { hasRichMetadata } = playlistCapabilities()

  const {
    playlist,
    isLoading,
    isError,
    capabilities,
    playlistTrackIds,
    searchTracks,
    updateMutation,
    addTrackMutation,
    removeTrackMutation,
    reorderMutation,
    deleteMutation,
    playAtIndex,
    handlePlayAll,
  } = usePlaylistDetailPage({ slug, basePath })

  if (isLoading) return <Loader />

  if (isError || !playlist) {
    return (
      <Page>
        <PageSection className="mx-auto max-w-4xl space-y-4 text-center">
          <p className="text-muted-foreground">Playlist not found.</p>
          <Button variant="outline" asChild>
            <Link to={basePath}>Back to playlists</Link>
          </Button>
        </PageSection>
      </Page>
    )
  }

  const trackCount = playlist.tracks.length
  const durationLabel = formatPlaylistTotalDuration(playlist.tracks)
  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/playlists/${playlist.slug}`
      : `/playlists/${playlist.slug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast.success('Public link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Delete "${playlist.title}"? This cannot be undone.`)) {
      deleteMutation.mutate()
    }
  }

  return (
    <Page>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <PageSection className="space-y-5">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 px-2" asChild>
              <Link to={basePath}>
                <ArrowLeft className="size-4" aria-hidden />
                Back
              </Link>
            </Button>
          </div>

          <div className="playlist-detail-header">
            <div className="playlist-detail-header__main">
              {hasRichMetadata && playlist.coverUrl ? (
                <img src={playlist.coverUrl} alt="" className="playlist-detail-header__cover" />
              ) : hasRichMetadata ? (
                <div className="playlist-detail-header__cover-fallback" aria-hidden>
                  {playlist.title.slice(0, 1).toUpperCase()}
                </div>
              ) : null}
              <div className="min-w-0">
                <h1 className="playlist-detail-header__title">{playlist.title}</h1>
                <p className="playlist-detail-header__meta">
                  {trackCount} track{trackCount === 1 ? '' : 's'}
                  {durationLabel !== '—' ? ` · ${durationLabel}` : ''}
                  {' · '}
                  {playlist.visibility === 'public' ? 'Public' : 'Private'}
                </p>
                {hasRichMetadata && playlist.description ? (
                  <p className="playlist-detail-header__desc">{playlist.description}</p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {capabilities.canEditSettings ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="size-4" aria-hidden />
                  Settings
                </Button>
              ) : null}
              {capabilities.canDelete ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Delete
                </Button>
              ) : null}
              {playlist.visibility === 'public' ? (
                <Button size="sm" variant="secondary" asChild>
                  <Link to={`/playlists/${playlist.slug}`}>Public page</Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="playlist-detail-toolbar">
            <Button className="gap-1.5" onClick={handlePlayAll} disabled={!trackCount}>
              <Play className="size-4" fill="currentColor" aria-hidden />
              Play
            </Button>
            {playlist.visibility === 'public' ? (
              <Button variant="outline" className="gap-1.5" onClick={() => void handleCopyLink()}>
                <Copy className="size-4" aria-hidden />
                Copy link
              </Button>
            ) : null}
          </div>
        </PageSection>

        <PageSection className="space-y-4">
          <h2 className="playlist-section-label">Tracks</h2>
          <SortablePlaylistTrackList
            playlist={playlist}
            onPlayTrack={playAtIndex}
            onRemoveTrack={(trackId) => removeTrackMutation.mutate(trackId)}
            onReorder={(trackIds) => reorderMutation.mutate(trackIds)}
            isRemoving={removeTrackMutation.isPending}
            isReordering={reorderMutation.isPending}
          />
        </PageSection>

        {capabilities.canAddTracks ? (
          <PageSection>
            <AddTracksPanel
              playlistTrackIds={playlistTrackIds}
              onAddTrack={(trackId) => addTrackMutation.mutate(trackId)}
              isAdding={addTrackMutation.isPending}
              searchTracks={searchTracks}
              searchHint="Search the site catalog to add tracks."
            />
          </PageSection>
        ) : null}
      </div>

      <PlaylistSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        playlist={playlist}
        isSaving={updateMutation.isPending}
        onSave={(input) => {
          updateMutation.mutate(input, {
            onSuccess: () => setSettingsOpen(false),
          })
        }}
      />
    </Page>
  )
}
