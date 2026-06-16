import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { releaseInitials } from '@/modules/explore/lib/release-meta'
import { cn } from '@/shared/lib/cn'

interface ReleaseVinylArtProps {
  release: ReleaseDto
  variant?: 'hero' | 'card'
  className?: string
}

export function ReleaseVinylArt({ release, variant = 'hero', className }: ReleaseVinylArtProps) {
  return (
    <div
      className={cn(
        'explore-rel-vinyl-stack',
        variant === 'hero' && 'explore-rel-vinyl-stack--hero',
        variant === 'card' && 'explore-rel-vinyl-stack--card',
        className,
      )}
    >
      <div
        className={cn('explore-rel-vinyl', variant === 'hero' && 'explore-rel-vinyl--spin')}
        aria-hidden
      />
      <div className="explore-rel-vinyl__sleeve">
        {release.coverUrl ? (
          <img src={release.coverUrl} alt="" className="explore-rel-vinyl__cover" loading="lazy" />
        ) : (
          <div className="explore-rel-vinyl__fallback" aria-hidden>
            {releaseInitials(release.title)}
          </div>
        )}
      </div>
    </div>
  )
}
