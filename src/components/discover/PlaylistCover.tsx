import { useState } from 'react'
import clsx from 'clsx'
import { isCloudinaryUrl } from '@/lib/cloudinary/url'
import { IOSImage } from '@/components/ui/IOSImage'

type PlaylistCoverProps = {
  src: string
  alt: string
  className?: string
  fallback?: string
  width?: number
  sizes?: string
  priority?: boolean
}

/** Playlist art — direct URL for externals so covers always show; Cloudinary only for IOS CDN assets. */
export function PlaylistCover({
  src,
  alt,
  className,
  fallback = '♪',
  width = 400,
  sizes,
  priority,
}: PlaylistCoverProps) {
  const [broken, setBroken] = useState(false)
  const url = src?.trim() ?? ''

  if (!url || broken) {
    return (
      <div className={clsx('pl-cover-fallback', className)} aria-hidden>
        <span>{fallback.slice(0, 2).toUpperCase()}</span>
      </div>
    )
  }

  if (isCloudinaryUrl(url)) {
    return (
      <IOSImage
        src={url}
        alt={alt}
        width={width}
        sizes={sizes}
        className={className}
        priority={priority}
        crop="fill"
        onBroken={() => setBroken(true)}
      />
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      width={width}
      height={width}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      sizes={sizes}
      onError={() => setBroken(true)}
    />
  )
}
