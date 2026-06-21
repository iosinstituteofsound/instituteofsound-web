import {
  MessageSquare,
  Music2,
  Radio,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { CuratorReputationStatDto } from '@/modules/explore/types/explore.types'
import { CuratorGlassSection } from '@/modules/profile/components/curator/curator-glass-section'

type CuratorCommunityReputationProps = {
  stats: CuratorReputationStatDto[]
}

const ICONS: Record<string, typeof Radio> = {
  signals: Radio,
  playlists: Music2,
  reviews: Star,
  comments: MessageSquare,
  artists: Users,
  followers: TrendingUp,
}

function formatValue(value: number | string): string {
  return typeof value === 'number' ? value.toLocaleString() : value
}

export function CuratorCommunityReputation({ stats }: CuratorCommunityReputationProps) {
  if (stats.length === 0) return null

  return (
    <CuratorGlassSection
      title="Community Reputation"
      id="curator-reputation-heading"
      className="curator-reputation"
    >
      <div className="curator-reputation__grid">
        {stats.map((stat) => {
          const Icon = ICONS[stat.key] ?? Radio

          return (
            <div key={stat.key} className="curator-reputation__cell">
              <span className="curator-reputation__icon" aria-hidden>
                <Icon size={14} strokeWidth={2} />
              </span>
              <p className="curator-reputation__value">{formatValue(stat.value)}</p>
              <p className="curator-reputation__label">{stat.label}</p>
            </div>
          )
        })}
      </div>
    </CuratorGlassSection>
  )
}
