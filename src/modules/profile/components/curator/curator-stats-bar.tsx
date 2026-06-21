import type { CuratorStatsDto } from '@/modules/explore/types/explore.types'
import { curatorCompactCount } from '@/modules/profile/lib/curator-format'

type CuratorStatsBarProps = {
  stats: CuratorStatsDto
}

const STAT_ITEMS: Array<{ key: keyof CuratorStatsDto; label: string }> = [
  { key: 'followers', label: 'Followers' },
  { key: 'playlists', label: 'Playlists' },
  { key: 'artistsDiscovered', label: 'Artists Discovered' },
  { key: 'playlistSpins', label: 'Playlist Spins' },
  { key: 'featuredPicks', label: 'Featured Picks' },
]

export function CuratorStatsBar({ stats }: CuratorStatsBarProps) {
  return (
    <section className="curator-stats-bar profile-ed-glass" aria-label="Curator statistics">
      {STAT_ITEMS.map(({ key, label }, index) => (
        <div key={key} className="curator-stats-bar__item">
          <p className="curator-stats-bar__value">{curatorCompactCount(stats[key])}</p>
          <p className="curator-stats-bar__label">{label}</p>
          {index < STAT_ITEMS.length - 1 ? (
            <span className="curator-stats-bar__divider" aria-hidden />
          ) : null}
        </div>
      ))}
    </section>
  )
}
