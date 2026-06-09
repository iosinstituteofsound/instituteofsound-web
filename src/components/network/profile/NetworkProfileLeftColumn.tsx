import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { EarnedBadge } from '@/lib/community/service'
import { MedalIllustration } from '@/components/community/medals/MedalIllustration'
import { badgeDefBySlug } from '@/lib/community/badges'
import { NetworkProfileAboutCard } from '@/components/network/profile/NetworkProfileAboutCard'

interface NetworkProfileLeftColumnProps {
  profile: PublicMemberProfile
  badges: EarnedBadge[]
  isYou: boolean
  aboutEditing?: boolean
  onAboutEditingChange?: (editing: boolean) => void
  onProfileSaved?: () => void | Promise<void>
  onViewAllBadges?: () => void
}

export function NetworkProfileLeftColumn({
  profile,
  badges,
  isYou,
  aboutEditing = false,
  onAboutEditingChange,
  onProfileSaved,
  onViewAllBadges,
}: NetworkProfileLeftColumnProps) {
  return (
    <div className="np-overview__stack">
      <NetworkProfileAboutCard
        profile={profile}
        isYou={isYou}
        editing={aboutEditing}
        onEditingChange={onAboutEditingChange}
        onSaved={onProfileSaved}
      />

      <section className="np-card np-badges-card">
        <div className="np-card__head">
          <h2 className="np-card__title">Badges</h2>
          {badges.length > 0 && onViewAllBadges ? (
            <button type="button" className="np-card__link" onClick={onViewAllBadges}>
              View all
            </button>
          ) : null}
        </div>
        {badges.length > 0 ? (
          <ul className="np-badges-grid">
            {badges.slice(0, 8).map((b) => (
              <li key={b.slug} title={b.description ?? b.name}>
                <span className="np-badges-grid__hex">
                  <MedalIllustration slug={b.slug} size={40} />
                </span>
                <span>{badgeDefBySlug(b.slug)?.name ?? b.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="np-badges-empty">
            {isYou
              ? 'Earn badges by posting, reviewing, and connecting on the wire.'
              : 'No badges earned yet.'}
          </p>
        )}
      </section>
    </div>
  )
}
