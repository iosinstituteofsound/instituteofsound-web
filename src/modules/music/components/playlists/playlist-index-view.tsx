import { useState } from 'react'
import { CreatePlaylistDialog } from '@/modules/music/components/playlists/create-playlist-dialog'
import { PlaylistGrid } from '@/modules/music/components/playlists/playlist-grid'
import { usePlaylistsIndex } from '@/modules/music/hooks/use-playlists-index'
import type { PlaylistOwnerMode } from '@/modules/music/lib/playlist-api'
import { Loader } from '@/shared/components/feedback/loader'
import { Page, PageDescription, PageHeader, PageSection, PageTitle } from '@/shared/components/layout/page-shell'

type PlaylistIndexViewProps = {
  mode: PlaylistOwnerMode
  title?: string
  description?: string
}

export function PlaylistIndexView({
  mode,
  title = mode === 'artist' ? 'Artist Playlists' : 'My Playlists',
  description = mode === 'artist'
    ? 'Create and manage playlists for your artist profile.'
    : 'Your personal collections — add tracks from anywhere and play them in the player.',
}: PlaylistIndexViewProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const { playlists, isLoading, basePath, createMutation, deleteMutation } = usePlaylistsIndex({ mode })

  return (
    <Page>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <PageHeader className="justify-center sm:justify-between">
          <div>
            <PageTitle className="text-center sm:text-left">{title}</PageTitle>
            <PageDescription className="text-center sm:text-left">{description}</PageDescription>
          </div>
        </PageHeader>

        <PageSection>
          {isLoading ? <Loader /> : null}
          {!isLoading ? (
            <PlaylistGrid
              playlists={playlists}
              basePath={basePath}
              showCreateCard
              onCreateClick={() => setCreateOpen(true)}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending}
              emptyMessage={
                <>
                  No playlists yet.{' '}
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-2 hover:underline"
                    onClick={() => setCreateOpen(true)}
                  >
                    Create your first playlist
                  </button>
                </>
              }
            />
          ) : null}
        </PageSection>
      </div>

      <CreatePlaylistDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode={mode}
        isSubmitting={createMutation.isPending}
        onSubmit={(input) => createMutation.mutate(input)}
      />
    </Page>
  )
}
