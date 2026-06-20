import { Plus } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import '@/modules/music/styles/playlist.css'

type PlaylistCreateCardProps = {
  onClick: () => void
  className?: string
}

export function PlaylistCreateCard({ onClick, className }: PlaylistCreateCardProps) {
  return (
    <button
      type="button"
      className={cn('playlist-create-card', className)}
      onClick={onClick}
      aria-label="Create new playlist"
    >
      <Plus size={24} strokeWidth={1.75} aria-hidden />
      <span className="playlist-create-card__label">New playlist</span>
    </button>
  )
}
