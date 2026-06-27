import type { ReactNode } from 'react'
import type { PlaylistDetailDto } from '@/modules/music/types/music.types'
import { PlaylistCreateCard } from '@/modules/music/components/playlists/playlist-create-card'
import { PlaylistGridCard } from '@/modules/music/components/playlists/playlist-grid-card'
import { EmptyState } from '@/shared/components/feedback/states'
import { cn } from '@/shared/lib/cn'
import '@/modules/music/styles/playlist.css'

type PlaylistGridProps = {
  playlists: PlaylistDetailDto[]
  basePath: string
  onCreateClick?: () => void
  onDelete?: (id: string) => void
  isDeleting?: boolean
  showCreateCard?: boolean
  className?: string
  emptyMessage?: ReactNode
}

export function PlaylistGrid({
  playlists,
  basePath,
  onCreateClick,
  onDelete,
  isDeleting,
  showCreateCard = true,
  className,
  emptyMessage,
}: PlaylistGridProps) {
  const isEmpty = playlists.length === 0 && !showCreateCard

  if (isEmpty) {
    return (
      <EmptyState
        variant="dashed"
        title=""
        description={typeof emptyMessage === 'string' ? emptyMessage : emptyMessage ? undefined : 'No playlists yet.'}
        action={
          typeof emptyMessage !== 'string' && emptyMessage ? (
            <span className="text-sm text-muted-foreground">{emptyMessage}</span>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className={cn('playlist-grid', className)}>
      {playlists.map((playlist) => (
        <PlaylistGridCard
          key={playlist.id}
          playlist={playlist}
          href={`${basePath}/${playlist.slug}`}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
      {showCreateCard && onCreateClick ? <PlaylistCreateCard onClick={onCreateClick} /> : null}
    </div>
  )
}
