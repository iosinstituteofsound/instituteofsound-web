import clsx from 'clsx'
import type { CommunityBadgeDef } from '@/lib/community/badges'
import { MedalIllustration } from '@/components/community/medals/MedalIllustration'

interface CommunityMedalCardProps {
  def: CommunityBadgeDef
  earnedAt?: string
  unlocked: boolean
}

export function CommunityMedalCard({ def, earnedAt, unlocked }: CommunityMedalCardProps) {
  return (
    <article
      className={clsx(
        'community-medal-card',
        unlocked ? 'community-medal-card--unlocked' : 'community-medal-card--locked',
        `community-medal-card--${def.slug}`
      )}
    >
      <div className="community-medal-card-shine" aria-hidden />
      <div className="community-medal-art-wrap">
        <MedalIllustration slug={def.slug} size={112} className="community-medal-art" />
        {!unlocked && <span className="community-medal-lock" aria-hidden />}
      </div>
      <div className="community-medal-copy">
        <p className="community-medal-tier">{tierLabel(def.slug)}</p>
        <h3 className="community-medal-name">{def.name}</h3>
        <p className="community-medal-desc">{def.description}</p>
        {unlocked && earnedAt ? (
          <time className="community-medal-date" dateTime={earnedAt}>
            Earned {new Date(earnedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </time>
        ) : (
          <p className="community-medal-locked-label">Locked</p>
        )}
      </div>
    </article>
  )
}

function tierLabel(slug: string): string {
  if (['first_signal', 'quiz_locked', 'golden_ear'].includes(slug)) return 'Academy'
  if (['first_spin', 'first_drop', 'crew_joined'].includes(slug)) return 'Network'
  if (['scout_promoted'].includes(slug)) return 'Rank'
  return 'Weekly ops'
}
