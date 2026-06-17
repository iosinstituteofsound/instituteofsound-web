import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { releaseInitials } from '@/modules/explore/lib/release-meta'
import { cn } from '@/shared/lib/cn'

interface ReleaseVinylArtProps {
  release: ReleaseDto
  variant?: 'hero' | 'card'
  spinning?: boolean
  metalHammer?: boolean
  className?: string
}

const MH_CORNERS = ['tl', 'tr', 'bl', 'br'] as const

export function ReleaseVinylArt({
  release,
  variant = 'hero',
  spinning,
  metalHammer,
  className,
}: ReleaseVinylArtProps) {
  const shouldSpin = spinning ?? variant === 'hero'

  return (
    <div
      className={cn(
        'explore-rel-vinyl-stack',
        variant === 'hero' && 'explore-rel-vinyl-stack--hero',
        variant === 'card' && 'explore-rel-vinyl-stack--card',
        metalHammer && 'explore-rel-vinyl-stack--mh',
        className,
      )}
    >
      {metalHammer ? (
        <>
          <span className="explore-rel-vinyl-stack__mh-frame" aria-hidden />
          <span className="explore-rel-vinyl-stack__mh-glow" aria-hidden />
          <span className="explore-rel-vinyl-stack__mh-rule" aria-hidden />
          {MH_CORNERS.map((corner) => (
            <span
              key={corner}
              className={`explore-rel-vinyl-stack__corner explore-rel-vinyl-stack__corner--${corner}`}
              aria-hidden
            />
          ))}
        </>
      ) : null}

      <div
        className={cn(
          'explore-rel-vinyl',
          metalHammer && 'ios-vinyl-disc',
          shouldSpin && 'explore-rel-vinyl--spin',
        )}
        aria-hidden
      />
      <div className={cn('explore-rel-vinyl__sleeve', metalHammer && 'ios-vinyl-sleeve')}>
        {release.coverUrl ? (
          <img src={release.coverUrl} alt="" className="explore-rel-vinyl__cover" loading="lazy" />
        ) : (
          <div className="explore-rel-vinyl__fallback" aria-hidden>
            {releaseInitials(release.title)}
          </div>
        )}
        {metalHammer ? <span className="explore-rel-vinyl__scan" aria-hidden /> : null}
      </div>
    </div>
  )
}
