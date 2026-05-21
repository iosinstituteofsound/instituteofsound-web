import { IOSImage } from '@/components/ui/IOSImage'
import clsx from 'clsx'

interface CoverArtProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'banner' | 'pick'
  className?: string
}

const sizeClass = {
  sm: 'w-12 h-12',
  md: 'w-32 h-32',
  lg: 'w-full aspect-square',
  banner: 'w-full h-full',
  pick: 'w-full h-full min-h-[280px]',
}

export function CoverArt({ src, alt, size = 'md', className }: CoverArtProps) {
  if (src) {
    return (
      <IOSImage
        src={src}
        alt={alt}
        width={size === 'banner' ? 1600 : 400}
        className={clsx(sizeClass[size], 'object-cover', className)}
      />
    )
  }

  return (
    <div
      className={clsx(
        'ios-artist-cover-placeholder',
        sizeClass[size],
        className
      )}
      aria-hidden
    >
      <span className="ios-artist-cover-placeholder-mark">IOS</span>
    </div>
  )
}

export function formatPlayCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(n)
}
