import { Link } from 'react-router-dom'
import type { LeaderboardEntry } from '@/lib/community/service'
import { networkProfilePathFromEntry } from '@/lib/community/networkPaths'
import { RankBadge } from '@/components/ui/RankBadge'
import { IOSImage } from '@/components/ui/IOSImage'
import clsx from 'clsx'

interface CommunityLeaderboardProps {
  entries: LeaderboardEntry[]
  highlightUserId?: string
  compact?: boolean
}

export function CommunityLeaderboard({
  entries,
  highlightUserId,
  compact = false,
}: CommunityLeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="community-leaderboard-empty">
        <p>No dB earned this week yet.</p>
        <p className="text-sm text-muted mt-2">
          Complete an Academy lesson or pass an Ear Lab drill to appear here.
        </p>
      </div>
    )
  }

  return (
    <ol className={clsx('community-leaderboard', compact && 'community-leaderboard-compact')}>
      {entries.map((entry, index) => {
        const isYou = highlightUserId === entry.userId
        const profilePath = networkProfilePathFromEntry(entry.handle)
        return (
          <li
            key={entry.userId}
            className={clsx(
              'community-leaderboard-row',
              index < 3 && 'community-leaderboard-row-top',
              isYou && 'community-leaderboard-row-you'
            )}
          >
            <Link
              to={profilePath}
              className="community-leaderboard-link"
              aria-label={`${entry.name} network profile`}
            >
              <span className="community-leaderboard-rank-num" aria-label={`Rank ${index + 1}`}>
                {index + 1}
              </span>
              <div className="community-leaderboard-avatar">
                {entry.avatarUrl ? (
                  <IOSImage
                    src={entry.avatarUrl}
                    alt=""
                    width={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span aria-hidden>{entry.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="community-leaderboard-meta">
                <p className="community-leaderboard-name">
                  {entry.name}
                  {isYou && <span className="community-leaderboard-you">You</span>}
                </p>
                <p className="community-leaderboard-handle">{entry.handle}</p>
              </div>
              <div className="community-leaderboard-stats">
                <RankBadge rank={entry.rank} />
                <span className="community-leaderboard-db">{entry.weeklyDb.toLocaleString()} dB</span>
              </div>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
