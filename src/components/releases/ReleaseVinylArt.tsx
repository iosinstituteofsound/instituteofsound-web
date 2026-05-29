import { useEffect, useState, type CSSProperties } from 'react'
import { IOSImage } from '@/components/ui/IOSImage'
import { extractAccentFromImageUrl } from '@/lib/artist-profile/extractAccentFromImage'
import { VINYL_FALLBACK, vinylPaletteFromHex } from '@/lib/media/vinylPalette'

interface ReleaseVinylArtProps {
  coverUrl?: string
  alt?: string
  fallbackLetter?: string
  /** `hero` = featured row; `card` = grid cards */
  variant?: 'hero' | 'card'
  width?: number
  className?: string
}

export function ReleaseVinylArt({
  coverUrl,
  alt = '',
  fallbackLetter,
  variant = 'card',
  width = 400,
  className = '',
}: ReleaseVinylArtProps) {
  const [broken, setBroken] = useState(false)
  const [palette, setPalette] = useState(VINYL_FALLBACK)

  useEffect(() => {
    if (!coverUrl?.trim() || broken) {
      setPalette(VINYL_FALLBACK)
      return
    }
    let cancelled = false
    void extractAccentFromImageUrl(coverUrl).then((hex) => {
      if (cancelled) return
      setPalette(hex ? vinylPaletteFromHex(hex) : VINYL_FALLBACK)
    })
    return () => {
      cancelled = true
    }
  }, [coverUrl, broken])

  const stackClass =
    variant === 'hero' ? 'prem-vinyl-stack prem-vinyl-stack--hero' : 'prem-vinyl-stack prem-vinyl-stack--card'

  const vinylStyle = {
    '--prem-vinyl-accent': palette.accent,
    '--prem-vinyl-light': palette.light,
    '--prem-vinyl-dark': palette.dark,
  } as CSSProperties

  return (
    <div className={`${stackClass} ${className}`.trim()} style={vinylStyle}>
      <div className="prem-vinyl" aria-hidden />
      <div className="prem-vinyl__sleeve">
        {coverUrl && !broken ? (
          <IOSImage
            src={coverUrl}
            alt={alt}
            width={width}
            className={variant === 'hero' ? 'prem-page__hero-cover' : 'prem-card__img'}
            onBroken={() => setBroken(true)}
          />
        ) : (
          <div
            className={
              variant === 'hero'
                ? 'prem-page__hero-cover prem-page__hero-cover--fallback'
                : 'prem-card__art-fallback'
            }
            aria-hidden
          >
            {fallbackLetter?.slice(0, 1) ?? '?'}
          </div>
        )}
      </div>
    </div>
  )
}
