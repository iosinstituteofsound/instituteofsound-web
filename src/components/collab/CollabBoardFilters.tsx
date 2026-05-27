import { INDIA_SCENE_CITIES, SCENE_GENRE_SLUGS } from '@/lib/releases/constants'
import { COLLAB_SKILL_SLUGS } from '@/lib/collab/constants'
import type { CollabBoardFilters as Filters } from '@/lib/collab/types'

interface CollabBoardFiltersProps {
  value: Filters
  onChange: (next: Filters) => void
}

export function CollabBoardFilters({ value, onChange }: CollabBoardFiltersProps) {
  return (
    <div className="collab-board-filters">
      <label className="collab-filter-field">
        <span>Type</span>
        <select
          value={value.kind ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              kind: (e.target.value || '') as Filters['kind'],
            })
          }
        >
          <option value="">All</option>
          <option value="need">Need</option>
          <option value="offer">Offer</option>
        </select>
      </label>

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

      <label className="collab-filter-field">
        <span>Skill</span>
        <select
          value={value.skill ?? ''}
          onChange={(e) => onChange({ ...value, skill: e.target.value || undefined })}
        >
          <option value="">Any skill</option>
          {COLLAB_SKILL_SLUGS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
