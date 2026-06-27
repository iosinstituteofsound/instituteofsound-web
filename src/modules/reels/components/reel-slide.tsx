import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import { reelPosterUrl, reelVideoUrl } from '@/modules/reels/lib/reel-item'
import { ReelActions } from '@/modules/reels/components/reel-actions'
import { ReelOverlay } from '@/modules/reels/components/reel-overlay'
import { ReelVideo } from '@/modules/reels/components/reel-video'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'

interface ReelSlideProps {
  item: FeedItemDto
  active: boolean
  setRef: (node: HTMLDivElement | null) => void
}

export function ReelSlide({ item, active, setRef }: ReelSlideProps) {
  const [muted, setMuted] = useState(true)
  const [paused, setPaused] = useState(false)
  const videoUrl = reelVideoUrl(item)
  const posterUrl = reelPosterUrl(item)

  useEffect(() => {
    if (!active) setPaused(false)
  }, [active])

  if (!videoUrl) return null

  return (
    <section ref={setRef} className="reel-slide" data-active={active || undefined}>
      <div className="reel-slide__frame">
        <ReelVideo
          src={videoUrl}
          poster={posterUrl}
          active={active}
          muted={muted}
          paused={paused}
        />

        <button
          type="button"
          className="reel-slide__tap"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? 'Play reel' : 'Pause reel'}
        />

        {paused ? (
          <div className="reel-slide__play-badge" aria-hidden>
            <Play className="reel-slide__play-icon" fill="currentColor" />
          </div>
        ) : null}

        <ReelOverlay item={item} muted={muted} onMutedChange={setMuted} />
        <ReelActions item={item} />
      </div>
    </section>
  )
}
