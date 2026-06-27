import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CreatePlaylistDialog } from '@/modules/music/components/playlists/create-playlist-dialog'
import { PlaylistGridCard } from '@/modules/music/components/playlists/playlist-grid-card'
import { PlaylistCreateCard } from '@/modules/music/components/playlists/playlist-create-card'
import { usePlaylistsIndex } from '@/modules/music/hooks/use-playlists-index'
import { Loader } from '@/shared/components/feedback/loader'
import { SectionHeader, SurfaceSection } from '@/shared/components/layout'
import { Button } from '@/shared/components/ui/button'
import '@/modules/music/styles/playlist.css'

type ListenerPlaylistsSectionProps = {
  isOwnProfile: boolean
}

export function ListenerPlaylistsSection({ isOwnProfile }: ListenerPlaylistsSectionProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const { playlists, isLoading, basePath, createMutation } = usePlaylistsIndex({
    navigateOnCreate: false,
  })

  if (!isOwnProfile) return null
  if (isLoading) return <Loader />

  const preview = playlists.slice(0, 4)

  return (
    <SurfaceSection>
      <SectionHeader
        title="My Playlists"
        action={
          <Button size="sm" variant="outline" asChild>
            <Link to="/library/playlists">
              Manage all
              <ArrowRight className="ml-1 size-4" aria-hidden />
            </Link>
          </Button>
        }
      />

      <div className="flex gap-3 overflow-x-auto pb-1">
        {preview.map((pl) => (
          <div key={pl.id} className="w-[9.5rem] shrink-0">
            <PlaylistGridCard playlist={pl} href={`${basePath}/${pl.slug}`} />
          </div>
        ))}
        <div className="w-[9.5rem] shrink-0">
          <PlaylistCreateCard onClick={() => setCreateOpen(true)} />
        </div>
      </div>

      {!playlists.length ? (
        <p className="text-sm text-muted-foreground">
          No playlists yet.{' '}
          <button
            type="button"
            className="font-medium text-primary underline-offset-2 hover:underline"
            onClick={() => setCreateOpen(true)}
          >
            Create one
          </button>
        </p>
      ) : null}

      <CreatePlaylistDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isSubmitting={createMutation.isPending}
        onSubmit={(input) =>
          createMutation.mutate(input, {
            onSuccess: () => setCreateOpen(false),
          })
        }
      />
    </SurfaceSection>
  )
}
