import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Music2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import './feed-audio-tag.css'

interface FeedAudioTagProps {
  label: string
  className?: string
}

export function FeedAudioTag({ label, className }: FeedAudioTagProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [scrollDistance, setScrollDistance] = useState(0)
  const overflows = scrollDistance > 0

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const text = textRef.current
    if (!viewport || !text) return

    const measure = () => {
      setScrollDistance(Math.max(0, text.scrollWidth - viewport.clientWidth))
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(text)

    return () => observer.disconnect()
  }, [label])

  const marqueeStyle: CSSProperties | undefined = overflows
    ? ({
        '--feed-audio-tag-scroll': `${scrollDistance}px`,
        '--feed-audio-tag-duration': `${Math.max(4, Math.min(12, scrollDistance / 16))}s`,
      } as CSSProperties)
    : undefined

  return (
    <div className={cn('feed-audio-tag', className)} title={label}>
      <Music2 className="feed-audio-tag__icon" aria-hidden />
      <div className="feed-audio-tag__viewport" ref={viewportRef}>
        <span
          ref={textRef}
          className={cn('feed-audio-tag__text', overflows && 'feed-audio-tag__text--marquee')}
          style={marqueeStyle}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
