import { Link } from 'react-router-dom'
import type { ReleaseGenreDto } from '@/modules/explore/types/explore.types'
import { cn } from '@/shared/lib/cn'

interface ReleasesGenreGridProps {
  genres: ReleaseGenreDto[]
  activeSlug?: string | null
}

export function ReleasesGenreGrid({ genres, activeSlug }: ReleasesGenreGridProps) {
  return (
    <div className="rel-genres-grid">
      {genres.map((genre, index) => (
        <Link
          key={genre.slug}
          to={`/releases?genre=${genre.slug}`}
          className={cn('rel-genre-card', activeSlug === genre.slug && 'is-active')}
          data-tone={String(index % 6)}
          style={
            genre.coverUrl
              ? ({ '--rel-genre-cover': `url("${genre.coverUrl}")` } as React.CSSProperties)
              : undefined
          }
        >
          <span className="rel-genre-card__media" aria-hidden />
          <span className="rel-genre-card__shade" aria-hidden />
          {genre.count > 0 ? (
            <span className="rel-genre-card__count">{genre.count.toLocaleString()}</span>
          ) : null}
          <span className="rel-genre-card__foot">
            <span className="rel-genre-card__name">{genre.label}</span>
            <span className="rel-genre-card__arrow" aria-hidden>
              →
            </span>
          </span>
        </Link>
      ))}
    </div>
  )
}
