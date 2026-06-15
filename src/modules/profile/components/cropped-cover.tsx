import { useEffect, useRef, useState } from 'react'
import { getCoverImageStyle } from '@/modules/profile/lib/cover-crop-utils'
import type { CoverCrop } from '@/shared/types/auth.types'
import { cn } from '@/shared/lib/cn'

type CroppedCoverProps = {
  src?: string
  crop?: CoverCrop | null
  className?: string
  heightClass?: string
}

export function CroppedCover({ src, crop, className, heightClass = 'h-44 sm:h-56 md:h-72' }: CroppedCoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    setDims(null)
    if (!src || !crop) return
    const img = new Image()
    const isLocal = src.startsWith('blob:') || src.startsWith('data:')
    if (!isLocal) img.crossOrigin = 'anonymous'
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = src
  }, [src, crop])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const style =
    src && crop && dims && size.w > 0
      ? getCoverImageStyle(src, crop, size.w, size.h, dims)
      : undefined

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden bg-muted', heightClass, className)}>
      {src ? (
        crop && style ? (
          <img src={src} alt="" className="max-w-none" style={style} />
        ) : (
          <img src={src} alt="" className="h-full w-full object-cover" />
        )
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-primary/25 via-muted to-background" />
      )}
    </div>
  )
}
