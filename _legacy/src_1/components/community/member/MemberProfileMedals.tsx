import { COMMUNITY_BADGE_DEFS } from '@/lib/community/badges'
import type { EarnedBadge } from '@/lib/community/service'
import { CommunityMedalCard } from '@/components/community/medals/CommunityMedalCard'

interface MemberProfileMedalsProps {
  badges: EarnedBadge[]
  loading: boolean
}

export function MemberProfileMedals({ badges, loading }: MemberProfileMedalsProps) {
  if (loading && badges.length === 0) {
    return (
      <div className="member-profile-medals-loading">
        <div className="member-profile-medals-loading-pulse" aria-hidden />
        <p>Decrypting medal vault…</p>
      </div>
    )
  }

  const earnedSlugs = new Set(badges.map((b) => b.slug))
  const earnedBySlug = Object.fromEntries(badges.map((b) => [b.slug, b])) as Record<
    string,
    EarnedBadge
  >

  const sorted = [...COMMUNITY_BADGE_DEFS].sort((a, b) => {
    const aEarned = earnedSlugs.has(a.slug) ? 0 : 1
    const bEarned = earnedSlugs.has(b.slug) ? 0 : 1
    if (aEarned !== bEarned) return aEarned - bEarned
    return a.sortOrder - b.sortOrder
  })

  const earnedCount = badges.length
  const total = COMMUNITY_BADGE_DEFS.length

  return (
    <div className="member-profile-medals-vault">
      <header className="member-profile-medals-head">
        <p className="member-profile-medals-kicker">Achievement vault</p>
        <p className="member-profile-medals-score">
          <strong>{earnedCount}</strong>
          <span> / {total} medals secured</span>
        </p>
      </header>

      <ul className="member-profile-medals-grid">
        {sorted.map((def) => {
          const earned = earnedBySlug[def.slug]
          return (
            <li key={def.slug}>
              <CommunityMedalCard
                def={def}
                unlocked={Boolean(earned)}
                earnedAt={earned?.earnedAt}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
