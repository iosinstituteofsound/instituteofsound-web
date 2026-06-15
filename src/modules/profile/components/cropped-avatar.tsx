import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import type { AvatarCrop } from '@/shared/types/auth.types'
import { cn } from '@/shared/lib/cn'

function useCroppedImageStyle(
  src: string,
  crop: AvatarCrop | undefined | null,
  size: number,
) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    setDims(null)
    if (!crop || !src) return
    const img = new Image()
    const isLocal = src.startsWith('blob:') || src.startsWith('data:')
    if (!isLocal) img.crossOrigin = 'anonymous'
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => setDims(null)
    img.src = src
  }, [src, crop])

  if (!crop || !dims) {
    return { ready: !crop, style: undefined as React.CSSProperties | undefined }
  }

  const radiusNatural = crop.r * Math.min(dims.w, dims.h)
  const scaleFactor = radiusNatural > 0 ? size / 2 / radiusNatural : 1

  return {
    ready: true,
    style: {
      width: dims.w * scaleFactor,
      height: dims.h * scaleFactor,
      left: size / 2 - crop.x * dims.w * scaleFactor,
      top: size / 2 - crop.y * dims.h * scaleFactor,
    } as React.CSSProperties,
  }
}

type CroppedAvatarProps = {
  src?: string
  alt: string
  crop?: AvatarCrop | null
  fallback: React.ReactNode
  className?: string
  size?: number
}

export function CroppedAvatar({
  src,
  alt,
  crop,
  fallback,
  className,
  size = 32,
}: CroppedAvatarProps) {
  const { ready, style } = useCroppedImageStyle(src ?? '', crop, size)

  return (
    <Avatar className={cn('relative overflow-hidden', className)}>
      {src && (!crop || ready) ? (
        crop && style ? (
          <img src={src} alt={alt} className="absolute max-w-none" style={style} />
        ) : (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        )
      ) : null}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}

export function CroppedAvatarFrame({
  src,
  alt,
  crop,
  size,
  className,
  children,
}: {
  src?: string
  alt: string
  crop?: AvatarCrop | null
  size: number
  className?: string
  children?: React.ReactNode
}) {
  const { ready, style } = useCroppedImageStyle(src ?? '', crop, size)

  return (
    <div
      className={cn('relative overflow-hidden rounded-full bg-muted', className)}
      style={{ width: size, height: size }}
    >
      {src && (!crop || ready) ? (
        crop && style ? (
          <img src={src} alt={alt} className="absolute max-w-none" style={style} />
        ) : (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        )
      ) : null}
      {children}
    </div>
  )
}
