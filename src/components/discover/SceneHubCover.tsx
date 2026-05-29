import { useState } from 'react'
import clsx from 'clsx'
import { isCloudinaryUrl } from '@/lib/cloudinary/url'
import { IOSImage } from '@/components/ui/IOSImage'

type SceneHubCoverProps = {
  src: string
  alt: string
  className?: string
  width?: number
  sizes?: string
}

/** Scene hub photos — load Unsplash directly; Cloudinary fetch often 404s on external IDs. */
export function SceneHubCover({ src, alt, className, width = 900, sizes }: SceneHubCoverProps) {
  const [broken, setBroken] = useState(false)
  const url = src?.trim() ?? ''

  if (!url || broken) {
    return <div className={clsx('scn-card__img-fallback', className)} aria-hidden />
  }

  if (isCloudinaryUrl(url)) {
    return (
      <IOSImage
        src={url}
        alt={alt}
        width={width}
        sizes={sizes}
        className={className}
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
      height={Math.round(width * 0.58)}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      sizes={sizes}
      onError={() => setBroken(true)}
    />
  )
}
