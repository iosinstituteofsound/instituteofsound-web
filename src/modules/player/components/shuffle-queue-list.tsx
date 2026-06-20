import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useActiveQueue, usePlayerStore } from '@/modules/player/stores/player-store'
import { formatPlayerTime } from '@/modules/player/lib/format-time'
import { cn } from '@/shared/lib/cn'
import '@/modules/player/styles/player-queue-shuffle.css'

type ShuffleQueueListProps = {
  queueIndex: number
  onPlayIndex: (index: number) => void
  onRemoveIndex: (index: number) => void
  shuffleAnimationKey: number
}

export function ShuffleQueueList({
  queueIndex,
  onPlayIndex,
  onRemoveIndex,
  shuffleAnimationKey,
}: ShuffleQueueListProps) {
  const queue = useActiveQueue()
  const isShuffling = usePlayerStore((s) => s.isShuffling)
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const prevPositions = useRef<Map<string, DOMRect>>(new Map())

  useEffect(() => {
    if (isShuffling) return
    const nextPositions = new Map<string, DOMRect>()
    rowRefs.current.forEach((el, id) => {
      nextPositions.set(id, el.getBoundingClientRect())
    })

    rowRefs.current.forEach((el, id) => {
      const prev = prevPositions.current.get(id)
      const next = nextPositions.get(id)
      if (!prev || !next) return
      const deltaY = prev.top - next.top
      if (Math.abs(deltaY) < 1) return
      el.style.transition = 'none'
      el.style.transform = `translateY(${deltaY}px)`
      requestAnimationFrame(() => {
        el.style.transition = 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)'
        el.style.transform = 'translateY(0)'
      })
    })

    prevPositions.current = nextPositions
  }, [queue, isShuffling, shuffleAnimationKey])

  useEffect(() => {
    rowRefs.current.forEach((el, id) => {
      prevPositions.current.set(id, el.getBoundingClientRect())
    })
  })

  if (!queue.length) {
    return <p className="player-queue-panel__empty">Queue is empty.</p>
  }

  return (
    <ul className="player-queue-panel__list" aria-label="Playback queue">
      {queue.map((track, index) => {
        const isCurrent = index === queueIndex
        return (
          <li
            key={track.id}
            ref={(el) => {
              if (el) rowRefs.current.set(track.id, el)
              else rowRefs.current.delete(track.id)
            }}
            className={cn(
              'player-queue-panel__row',
              isCurrent && 'player-queue-panel__row--current',
              isShuffling && 'player-queue-panel__row--shuffling',
            )}
          >
            <button
              type="button"
              className="player-queue-panel__row-main"
              onClick={() => onPlayIndex(index)}
              disabled={isShuffling}
            >
              {track.artworkUrl ? (
                <img src={track.artworkUrl} alt="" className="player-queue-panel__thumb" />
              ) : (
                <span className="player-queue-panel__thumb-fallback" aria-hidden>
                  ♪
                </span>
              )}
              <span className="player-queue-panel__meta">
                <span className={cn('player-queue-panel__title', isCurrent && 'is-current')}>
                  {track.title}
                </span>
                <span className="player-queue-panel__artist">{track.artist ?? 'Unknown'}</span>
              </span>
              <span className="player-queue-panel__duration">
                {track.durationSec ? formatPlayerTime(track.durationSec) : '—'}
              </span>
            </button>
            {!isCurrent ? (
              <button
                type="button"
                className="player-queue-panel__remove"
                aria-label={`Remove ${track.title} from queue`}
                onClick={() => onRemoveIndex(index)}
                disabled={isShuffling}
              >
                <X className="size-4" />
              </button>
            ) : (
              <span className="player-queue-panel__now-badge">Now</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
