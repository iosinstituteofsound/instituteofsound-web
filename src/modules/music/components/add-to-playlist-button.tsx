import { ListMusic } from 'lucide-react'
import { resolvePlaylistTrackId } from '@/modules/music/lib/resolve-track-id'
import { usePlaylistPickerStore } from '@/modules/music/stores/playlist-picker-store'
import { useAuthStore } from '@/app/stores/auth-store'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { toast } from 'sonner'

type AddToPlaylistButtonProps = {
  trackId?: string
  id?: string
  title: string
  artist?: string
  artworkUrl?: string
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
}

import '@/modules/music/styles/playlist-picker.css'

export function AddToPlaylistButton({
  trackId,
  id,
  title,
  artist,
  artworkUrl,
  className,
  showLabel = false,
  size = 'sm',
}: AddToPlaylistButtonProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const openPicker = usePlaylistPickerStore((s) => s.open)
  const resolvedTrackId = resolvePlaylistTrackId(trackId, id)

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if (!resolvedTrackId) {
      toast.error('This track cannot be saved to a playlist yet.')
      return
    }

    if (!isAuthenticated) {
      toast.message('Sign in to save tracks to playlists', {
        action: {
          label: 'Sign in',
          onClick: () => {
            window.location.href = '/auth/login'
          },
        },
      })
      return
    }

    openPicker({
      trackId: resolvedTrackId,
      title,
      artist,
      artworkUrl,
    })
  }

  const iconSize = size === 'md' ? 18 : 16

  return (
    <button
      type="button"
      className={cn('playlist-add-btn', size === 'md' && 'playlist-add-btn--md', className)}
      aria-label={`Add ${title} to playlist`}
      title="Add to playlist"
      onClick={handleClick}
    >
      <ListMusic size={iconSize} strokeWidth={2.25} aria-hidden />
      {showLabel ? <span className="playlist-add-btn__label">Add to playlist</span> : null}
    </button>
  )
}

export function AddToPlaylistLink(props: AddToPlaylistButtonProps) {
  const resolvedTrackId = resolvePlaylistTrackId(props.trackId, props.id)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!resolvedTrackId) return null
  if (!isAuthenticated) {
    return (
      <Link to="/auth/login" className={cn('playlist-add-btn playlist-add-btn--link', props.className)}>
        <ListMusic size={16} strokeWidth={2.25} aria-hidden />
        {props.showLabel ? <span className="playlist-add-btn__label">Add to playlist</span> : null}
      </Link>
    )
  }

  return <AddToPlaylistButton {...props} />
}
