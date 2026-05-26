import clsx from 'clsx'
import type { CommunityGenre } from '@/lib/community/service'

interface CommunityGenreGridProps {
  genres: CommunityGenre[]
  selectedId?: string | null
  onSelect: (genre: CommunityGenre) => void
  disabled?: boolean
  compact?: boolean
}

export function CommunityGenreGrid({
  genres,
  selectedId,
  onSelect,
  disabled,
  compact,
}: CommunityGenreGridProps) {
  return (
    <div className={clsx('community-genre-grid', compact && 'community-genre-grid-compact')}>
      {genres.map((genre) => {
        const active = selectedId === genre.id
        return (
          <button
            key={genre.id}
            type="button"
            disabled={disabled}
            className={clsx('community-genre-chip', active && 'community-genre-chip-active')}
            onClick={() => onSelect(genre)}
            aria-pressed={active}
          >
            {genre.name}
          </button>
        )
      })}
    </div>
  )
}
