import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { COMMUNITY_RANKS } from '@/lib/community/ranks'
import { formatNetworkCount, noiseScoreFromDb, noiseScoreLabel } from '@/lib/network/noiseScore'

function totalReactions(posts: CommunityFeedPost[]): number {
  return posts.reduce(
    (sum, p) => sum + p.reactions.fire + p.reactions.headphones + p.reactions.bolt,
    0,
  )
}

function rankLevel(rank: PublicMemberProfile['rank']): number {
  const idx = COMMUNITY_RANKS.indexOf(rank)
  return idx >= 0 ? idx + 1 : 1
}

interface NetworkProfileReputationCardProps {
  profile: PublicMemberProfile
  posts: CommunityFeedPost[]
}

export function NetworkProfileReputationCard({ profile, posts }: NetworkProfileReputationCardProps) {
  const score = noiseScoreFromDb(profile.totalDb)
  const pct = Math.min(100, (score / 10) * 100)
  const circumference = 2 * Math.PI * 52
  const dash = (pct / 100) * circumference
  const level = rankLevel(profile.rank)
  const spinCount = posts.filter((p) => p.kind === 'spin').length
  const dropCount = posts.filter((p) => p.kind === 'drop').length

  const reactionTotal = totalReactions(posts)

  return (
    <section className="np-rail-card np-rail-reputation">
      <div className="np-rail-card__head">
        <h2 className="np-rail-card__title">Reputation</h2>
        <span className="np-rail-card__accent">Level {level}</span>
      </div>

      <div className="np-rail-reputation__body">
        <div className="np-rail-reputation__gauge" aria-label={`Noise score ${score} out of 10`}>
          <svg viewBox="0 0 120 120" className="np-rail-reputation__svg" aria-hidden>
            <defs>
              <linearGradient id="np-rep-gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e31b23" />
                <stop offset="100%" stopColor="#8b1538" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="52" className="np-rail-reputation__track" />
            <circle
              cx="60"
              cy="60"
              r="52"
              className="np-rail-reputation__arc"
              stroke="url(#np-rep-gauge-grad)"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={circumference * 0.25}
            />
          </svg>
          <div className="np-rail-reputation__gauge-text">
            <span className="np-rail-reputation__score">{score.toFixed(1)}</span>
            <span className="np-rail-reputation__noise-label">Noise Score</span>
            <span className="np-rail-reputation__tier">{noiseScoreLabel(score)}</span>
          </div>
        </div>

        <ul className="np-rail-reputation__stats">
          <li>
            <span>Contributions</span>
            <strong>{profile.postCount.toLocaleString()}</strong>
          </li>
          <li>
            <span>Reviews</span>
            <strong>{spinCount.toLocaleString()}</strong>
          </li>
          <li>
            <span>Articles</span>
            <strong>{dropCount.toLocaleString()}</strong>
          </li>
          <li>
            <span>Reactions</span>
            <strong>{formatNetworkCount(reactionTotal)}</strong>
          </li>
        </ul>
      </div>
    </section>
  )
}
