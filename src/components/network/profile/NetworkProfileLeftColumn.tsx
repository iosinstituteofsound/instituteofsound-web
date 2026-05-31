import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { EarnedBadge } from '@/lib/community/service'
import { MedalIllustration } from '@/components/community/medals/MedalIllustration'
import { badgeDefBySlug } from '@/lib/community/badges'

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

interface NetworkProfileLeftColumnProps {
  profile: PublicMemberProfile
  badges: EarnedBadge[]
  onViewAllBadges?: () => void
}

export function NetworkProfileLeftColumn({
  profile,
  badges,
  onViewAllBadges,
}: NetworkProfileLeftColumnProps) {
  const tags: string[] = []
  if (profile.primaryGenreSlug) tags.push(formatGenre(profile.primaryGenreSlug))
  tags.push('Institute of Sound')
  tags.push('Digital Publishing')

  return (
    <div className="np-pane__stack">
      <section className="np-card">
        <h2 className="np-card__title">About</h2>
        {profile.bio ? (
          <p className="np-about__text">{profile.bio}</p>
        ) : (
          <p className="np-about__text np-about__text--muted">
            Operator on the Institute of Sound network — spins, drops, and scene signal.
          </p>
        )}
        <ul className="np-about__tags">
          {tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <a
          href="https://instituteofsound.in"
          target="_blank"
          rel="noopener noreferrer"
          className="np-about__link"
        >
          instituteofsound.in →
        </a>
      </section>

      {badges.length > 0 && (
        <section className="np-card">
          <div className="np-card__head">
            <h2 className="np-card__title">Badges</h2>
            {onViewAllBadges ? (
              <button type="button" className="np-card__link" onClick={onViewAllBadges}>
                View all
              </button>
            ) : null}
          </div>
          <ul className="np-badges-grid">
            {badges.slice(0, 8).map((b) => (
              <li key={b.slug} title={b.description ?? b.name}>
                <MedalIllustration slug={b.slug} size={48} />
                <span>{badgeDefBySlug(b.slug)?.name ?? b.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
