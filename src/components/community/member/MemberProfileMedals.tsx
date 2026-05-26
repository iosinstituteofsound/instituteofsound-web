import type { EarnedBadge } from '@/lib/community/service'

interface MemberProfileMedalsProps {
  badges: EarnedBadge[]
  loading: boolean
}

export function MemberProfileMedals({ badges, loading }: MemberProfileMedalsProps) {
  if (loading && badges.length === 0) {
    return <p className="member-profile-panel-empty">Loading medals…</p>
  }

  if (badges.length === 0) {
    return (
      <p className="member-profile-panel-empty">
        No medals earned yet — spins, drops, and tribe activity unlock badges.
      </p>
    )
  }

  return (
    <ul className="member-profile-medals-grid">
      {badges.map((b) => (
        <li key={b.slug} className="member-profile-medal">
          <span className="member-profile-medal-mark" aria-hidden>
            ✦
          </span>
          <p className="member-profile-medal-name">{b.name}</p>
          <p className="member-profile-medal-desc">{b.description}</p>
          <time className="member-profile-medal-time" dateTime={b.earnedAt}>
            {new Date(b.earnedAt).toLocaleDateString()}
          </time>
        </li>
      ))}
    </ul>
  )
}
