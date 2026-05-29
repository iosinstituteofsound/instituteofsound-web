import { useState } from 'react'
import { cloudinarySrcSet, cloudinaryUrl, isCloudinaryUrl } from '@/lib/cloudinary/url'

interface IOSImageProps {
  src: string
  alt: string
  className?: string
  /** Primary display width — drives CDN transform */
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  crop?: 'fill' | 'fit' | 'limit'
}

const DEFAULT_WIDTHS = [400, 640, 960, 1280, 1600]

export function IOSImage({
  src,
  alt,
  className = '',
  width = 800,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px',
  priority = false,
  crop = 'fill',
}: IOSImageProps) {
  const [useOriginal, setUseOriginal] = useState(false)

  if (!src?.trim()) return null

  const optimized = cloudinaryUrl(src, { width, height, crop })
  const displaySrc = useOriginal ? src : optimized
  const srcSet =
    useOriginal || !isCloudinaryUrl(src)
      ? undefined
      : cloudinarySrcSet(
          src,
          DEFAULT_WIDTHS.filter((w) => w <= Math.max(width * 2, 1600)),
          { height, crop }
        ) || undefined

  return (
    <img
      src={displaySrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
      onError={() => {
        if (!useOriginal) setUseOriginal(true)
      }}
    />
  )
}
