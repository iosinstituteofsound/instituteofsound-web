import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useTribeSpotlight } from '@/hooks/useTribeSpotlight'
import { networkProfilePathFromEntry } from '@/lib/community/networkPaths'
import { CommunityFeedCard } from '@/components/community/CommunityFeedCard'
import { IOSImage } from '@/components/ui/IOSImage'
import { RankBadge } from '@/components/ui/RankBadge'

interface TribeSpotlightProps {
  genreSlug: string | null
  genreName?: string
  className?: string
}

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function TribeSpotlight({ genreSlug, genreName, className }: TribeSpotlightProps) {
  const { winner, spins, loading } = useTribeSpotlight(genreSlug)
  const label = genreName ?? (genreSlug ? formatGenre(genreSlug) : 'Tribe')

  if (!genreSlug) {
    return (
      <div className={clsx('tribe-spotlight ios-card tribe-spotlight-empty', className)}>
        <p className="ios-kicker">Tribe spotlight</p>
        <p className="text-sm text-muted mt-2">
          Pick your taste tribe above to see this week&apos;s genre champion and fresh spins.
        </p>
      </div>
    )
  }

  if (loading && !winner && spins.length === 0) {
    return (
      <div className={clsx('tribe-spotlight ios-card', className)}>
        <p className="text-sm text-muted">Loading {label} spotlight…</p>
      </div>
    )
  }

  return (
    <section
      className={clsx('tribe-spotlight', className)}
      aria-labelledby="tribe-spotlight-heading"
    >
      <div className="tribe-spotlight-head">
        <div>
          <p className="ios-kicker" id="tribe-spotlight-heading">
            Tribe spotlight
          </p>
          <p className="font-display text-xl font-bold mt-1">{label} this week</p>
        </div>
        <Link to="/community#genre-board" className="tribe-spotlight-board-link">
          Full tribe board →
        </Link>
      </div>

      {winner ? (
        <Link
          to={networkProfilePathFromEntry(winner.handle)}
          className="tribe-spotlight-winner ios-card"
        >
          <div className="tribe-spotlight-winner-avatar">
            {winner.avatarUrl ? (
              <IOSImage
                src={winner.avatarUrl}
                alt=""
                width={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <span aria-hidden>{winner.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="tribe-spotlight-winner-meta">
            <p className="tribe-spotlight-winner-kicker">Genre champion</p>
            <p className="font-display font-bold text-lg">{winner.name}</p>
            <p className="text-sm text-muted">{winner.handle}</p>
          </div>
          <div className="tribe-spotlight-winner-stats">
            <RankBadge rank={winner.rank} />
            <span className="tribe-spotlight-winner-db">{winner.weeklyDb.toLocaleString()} dB</span>
          </div>
        </Link>
      ) : (
        <div className="tribe-spotlight-winner ios-card tribe-spotlight-winner-empty">
          <p className="text-sm text-muted">
            No {label} dB on the board yet this week — earn tribe-attributed dB to claim the crown.
          </p>
        </div>
      )}

      {spins.length > 0 && (
        <div className="tribe-spotlight-spins">
          <p className="tribe-spotlight-spins-label">Fresh spins on the wire</p>
          <div className="tribe-spotlight-spins-list">
            {spins.map((post) => (
              <CommunityFeedCard
                key={post.id}
                post={post}
                variant="profile"
                className="tribe-spotlight-spin-card"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
