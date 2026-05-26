import { Link } from 'react-router-dom'
import type { CommunityMemberStats, EarnedBadge } from '@/lib/community/service'
import { RankBadge } from '@/components/ui/RankBadge'
import { IOSImage } from '@/components/ui/IOSImage'
import { CommunityBadgeStrip } from '@/components/community/CommunityBadgeStrip'
import clsx from 'clsx'

interface CommunityProgressCardProps {
  stats: CommunityMemberStats
  badges?: EarnedBadge[]
  badgesLoading?: boolean
  className?: string
}

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function CommunityProgressCard({
  stats,
  badges = [],
  badgesLoading,
  className,
}: CommunityProgressCardProps) {
  const atMax = !stats.nextRank

  return (
    <div className={clsx('community-progress-card ios-card', className)}>
      <div className="community-progress-head">
        <div className="community-progress-avatar">
          {stats.avatarUrl ? (
            <IOSImage src={stats.avatarUrl} alt="" width={80} className="w-full h-full object-cover" />
          ) : (
            <span className="community-progress-avatar-fallback" aria-hidden>
              {stats.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="community-progress-copy">
          <p className="community-progress-kicker">Your transmission</p>
          <p className="community-progress-name">{stats.name}</p>
          <p className="community-progress-handle">{stats.handle}</p>
          <div className="community-progress-badges">
            <RankBadge rank={stats.rank} size="md" />
            {stats.primaryGenreSlug && (
              <span className="community-progress-tribe">
                {formatGenre(stats.primaryGenreSlug)}
              </span>
            )}
            <span className="community-progress-db">{stats.totalDb.toLocaleString()} dB total</span>
          </div>
        </div>
        <div className="community-progress-weekly">
          <span className="community-progress-weekly-label">This week</span>
          <span className="community-progress-weekly-value">+{stats.weeklyDb.toLocaleString()} dB</span>
        </div>
      </div>

      {!atMax && (
        <div className="community-progress-bar-wrap">
          <div className="community-progress-bar-labels">
            <span>{stats.rank}</span>
            <span>{stats.nextRank}</span>
          </div>
          <div className="community-progress-bar" role="progressbar" aria-valuenow={stats.rankProgressPct}>
            <div
              className="community-progress-bar-fill"
              style={{ width: `${stats.rankProgressPct}%` }}
            />
          </div>
          <p className="community-progress-next">
            {stats.dbToNextRank.toLocaleString()} dB to {stats.nextRank}
          </p>
        </div>
      )}

      {atMax && (
        <p className="community-progress-max">Maximum rank — Operator status unlocked.</p>
      )}

      <div className="community-progress-achievements">
        <p className="community-progress-achievements-label">Achievements</p>
        <CommunityBadgeStrip earned={badges} loading={badgesLoading} />
      </div>

      <p className="community-progress-hint">
        Earn dB from Academy lessons, quizzes, and Ear Lab.{' '}
        <Link to="/academy" className="text-rs-red hover:underline">
          Go learn →
        </Link>
      </p>
    </div>
  )
}
