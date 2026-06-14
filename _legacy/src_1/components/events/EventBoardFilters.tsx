import { INDIA_SCENE_CITIES, SCENE_GENRE_SLUGS } from '@/lib/releases/constants'
import type { EventFilters } from '@/lib/events/types'

interface EventBoardFiltersProps {
  value: EventFilters
  onChange: (next: EventFilters) => void
}

export function EventBoardFilters({ value, onChange }: EventBoardFiltersProps) {
  return (
    <div className="collab-board-filters">
      <label className="collab-filter-field">
        <span>City</span>
        <select
          value={value.city ?? ''}
          onChange={(e) => onChange({ ...value, city: e.target.value || undefined })}
        >
          <option value="">India · any</option>
          {INDIA_SCENE_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>

      <label className="collab-filter-field">
        <span>Genre</span>
        <select
          value={value.genreSlug ?? ''}
          onChange={(e) => onChange({ ...value, genreSlug: e.target.value || undefined })}
        >
          <option value="">Any tribe</option>
          {SCENE_GENRE_SLUGS.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
