import type { CSSProperties } from 'react'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import { RankBadge } from '@/components/ui/RankBadge'

function weeklyFill(weeklyDb: number): number {
  return Math.min(100, Math.round((weeklyDb / 500) * 100))
}

/** Decorative bar heights from weekly dB — stable per profile. */
function barHeights(weeklyDb: number): number[] {
  const base = weeklyFill(weeklyDb)
  return [0.35, 0.55, 0.72, 1, 0.68, 0.48, 0.82].map((m) => Math.max(12, Math.round(base * m)))
}

interface NetworkSignalTowerProps {
  profile: PublicMemberProfile
  variant?: 'hero' | 'rail'
}

export function NetworkSignalTower({ profile, variant = 'hero' }: NetworkSignalTowerProps) {
  const fill = weeklyFill(profile.weeklyDb)
  const bars = barHeights(profile.weeklyDb)

  return (
    <div
      className={`net-signal-tower net-signal-tower--${variant}`}
      aria-label={`${profile.totalDb.toLocaleString()} dB lifetime, ${profile.weeklyDb.toLocaleString()} this week`}
    >
      <div className="net-signal-tower__head">
        <RankBadge rank={profile.rank} size={variant === 'hero' ? 'md' : 'sm'} />
        <span className="net-signal-tower__label">Signal</span>
      </div>

      <p className="net-signal-tower__lifetime">
        <span className="net-signal-tower__db">{profile.totalDb.toLocaleString()}</span>
        <span className="net-signal-tower__unit">dB</span>
      </p>
      <span className="net-signal-tower__lifetime-caption">Lifetime output</span>

      <div className="net-signal-tower__viz" aria-hidden>
        <ul className="net-signal-tower__bars">
          {bars.map((h, i) => (
            <li key={i} style={{ '--h': `${h}%` } as CSSProperties} />
          ))}
        </ul>
        <div className="net-signal-tower__meter">
          <div className="net-signal-tower__meter-fill" style={{ height: `${fill}%` }} />
        </div>
      </div>

      <p className="net-signal-tower__week">
        <span>This week</span>
        <strong>{profile.weeklyDb.toLocaleString()} dB</strong>
      </p>
    </div>
  )
}
