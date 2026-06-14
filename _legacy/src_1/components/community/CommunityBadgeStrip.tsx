import clsx from 'clsx'
import { COMMUNITY_BADGE_DEFS } from '@/lib/community/badges'
import type { EarnedBadge } from '@/lib/community/service'
import { MedalIllustration } from '@/components/community/medals/MedalIllustration'

interface CommunityBadgeStripProps {
  earned: EarnedBadge[]
  loading?: boolean
  className?: string
  showLocked?: boolean
}

export function CommunityBadgeStrip({
  earned,
  loading,
  className,
  showLocked = true,
}: CommunityBadgeStripProps) {
  if (loading) {
    return <p className={clsx('community-badge-strip-loading', className)}>Loading badges…</p>
  }

  const items = showLocked
    ? COMMUNITY_BADGE_DEFS.map((def) => ({
        def,
        earned: earned.find((b) => b.slug === def.slug),
      }))
    : earned.map((b) => ({
        def: COMMUNITY_BADGE_DEFS.find((d) => d.slug === b.slug)!,
        earned: b,
      }))

  return (
    <ul className={clsx('community-badge-strip', className)} aria-label="Achievement badges">
      {items.map(({ def, earned: e }) => {
        const unlocked = Boolean(e)
        return (
          <li
            key={def.slug}
            className={clsx('community-badge-item', unlocked && 'community-badge-item-unlocked')}
            title={def.description}
          >
            <span className={clsx('community-badge-icon', !unlocked && 'community-badge-icon-locked')}>
              <MedalIllustration slug={def.slug} size={40} />
            </span>
            <div className="community-badge-copy">
              <span className="community-badge-name">{def.name}</span>
              <span className="community-badge-desc">{def.description}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
