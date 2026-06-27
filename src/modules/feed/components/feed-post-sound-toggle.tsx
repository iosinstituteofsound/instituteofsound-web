import { Volume2, VolumeX } from 'lucide-react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { feedItemToPlayerTrack } from '@/modules/player/lib/feed-track'
import { usePlayer } from '@/modules/player/hooks/use-player'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { cn } from '@/shared/lib/cn'
import './feed-post-sound-toggle.css'

export function feedItemHasAttachedAudio(item: FeedItemDto): boolean {
  return Boolean(payloadString(item.payload, 'audioUrl'))
}

interface FeedPostSoundToggleProps {
  item: FeedItemDto
  className?: string
}

export function FeedPostSoundToggle({ item, className }: FeedPostSoundToggleProps) {
  const playerTrack = feedItemToPlayerTrack(item)
  const { isCurrentTrack, isPlaying, play, togglePlay } = usePlayer()
  const openBar = usePlayerStore((state) => state.openBar)

  if (!playerTrack) return null

  const isActive = isCurrentTrack(playerTrack.id)
  const soundOn = isActive && isPlaying

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (soundOn) {
      togglePlay()
      return
    }

    if (isActive) {
      togglePlay()
      if (!isPlaying) openBar()
      return
    }

    play(playerTrack)
    openBar()
  }

  return (
    <button
      type="button"
      className={cn('feed-post-sound-toggle', className)}
      aria-label={soundOn ? 'Mute sound' : 'Play sound'}
      aria-pressed={soundOn}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={handleToggle}
    >
      {soundOn ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
    </button>
  )
}
