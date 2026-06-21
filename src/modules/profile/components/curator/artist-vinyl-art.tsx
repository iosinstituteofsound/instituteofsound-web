import { artistInitials } from '@/modules/explore/lib/artist-meta'
import { cn } from '@/shared/lib/cn'

type SimilarArtistTileProps = {
  displayName: string
  imageUrl?: string
  className?: string
}

export function SimilarArtistTile({ displayName, imageUrl, className }: SimilarArtistTileProps) {
  return (
    <div className={cn('cur-sim-artists__tile', className)}>
      <span className="cur-sim-artists__tile-rule" aria-hidden />
      <span className="cur-sim-artists__tile-bracket cur-sim-artists__tile-bracket--tl" aria-hidden />
      <span className="cur-sim-artists__tile-bracket cur-sim-artists__tile-bracket--tr" aria-hidden />
      <span className="cur-sim-artists__tile-bracket cur-sim-artists__tile-bracket--bl" aria-hidden />
      <span className="cur-sim-artists__tile-bracket cur-sim-artists__tile-bracket--br" aria-hidden />
      <span className="cur-sim-artists__tile-frame" aria-hidden />

      <div className="cur-sim-artists__tile-stack">
        <span className="cur-sim-artists__tile-vinyl" aria-hidden />
        <div className="cur-sim-artists__tile-face">
          {imageUrl ? (
            <img src={imageUrl} alt="" loading="lazy" className="cur-sim-artists__tile-img" />
          ) : (
            <span className="cur-sim-artists__tile-fallback" aria-hidden>
              {artistInitials(displayName)}
            </span>
          )}
          <span className="cur-sim-artists__tile-vignette" aria-hidden />
          <span className="cur-sim-artists__tile-scan" aria-hidden />
        </div>
      </div>
      <span className="cur-sim-artists__tile-glow" aria-hidden />
    </div>
  )
}
