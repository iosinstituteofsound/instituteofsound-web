import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import type { EditorialPickDto } from '@/modules/explore/types/explore.types'
import {
  editorialPickTargetHref,
  resolveEditorialPickAction,
} from '@/modules/profile/lib/editorial-pick-action'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { cn } from '@/shared/lib/cn'

type EditorialPickActionControlProps = {
  pick: EditorialPickDto
  className?: string
}

export function EditorialPickActionControl({ pick, className }: EditorialPickActionControlProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const action = resolveEditorialPickAction(pick)

  if (!action) return null

  if (action === 'play' && pick.streamUrl) {
    return (
      <button
        type="button"
        className={cn('ed-picks-dev__action', 'ed-picks-dev__action--play', className)}
        aria-label={`Play ${pick.title}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          playTrack({
            id: pick.id,
            title: pick.title,
            artist: pick.artistName ?? 'IOS Editorial',
            audioUrl: pick.streamUrl!,
            artworkUrl: pick.coverUrl,
          })
        }}
      >
        <Play size={14} strokeWidth={2} fill="currentColor" aria-hidden />
      </button>
    )
  }

  const href = editorialPickTargetHref(pick)
  if (!href) return null

  const label = action === 'view_profile' ? 'View Profile' : 'View Release'

  return (
    <Link
      to={href}
      className={cn('ed-picks-dev__action', 'ed-picks-dev__action--label', className)}
      onClick={(event) => event.stopPropagation()}
    >
      {label}
    </Link>
  )
}
