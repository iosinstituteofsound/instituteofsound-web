import { useEffect, useRef } from 'react'
import { cn } from '@/shared/lib/cn'

interface ReelVideoProps {
  src: string
  poster?: string
  active: boolean
  muted: boolean
  paused: boolean
  className?: string
}

/** Autoplaying vertical video — only plays when `active` and not `paused`. */
export function ReelVideo({ src, poster, active, muted, paused, className }: ReelVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!active || paused) {
      video.pause()
      if (!active) video.currentTime = 0
      return
    }

    void video.play().catch(() => undefined)
  }, [active, paused, src])

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      className={cn('reel-video', className)}
      playsInline
      loop
      muted={muted}
    />
  )
}
