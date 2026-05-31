import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { noiseScoreFromDb, noiseScoreLabel } from '@/lib/network/noiseScore'

function totalReactions(posts: CommunityFeedPost[]): number {
  return posts.reduce(
    (sum, p) => sum + p.reactions.fire + p.reactions.headphones + p.reactions.bolt,
    0,
  )
}

interface NetworkProfileReputationCardProps {
  profile: PublicMemberProfile
  posts: CommunityFeedPost[]
}

export function NetworkProfileReputationCard({ profile, posts }: NetworkProfileReputationCardProps) {
  const score = noiseScoreFromDb(profile.totalDb)
  const pct = Math.min(100, (score / 10) * 100)
  const circumference = 2 * Math.PI * 54
  const dash = (pct / 100) * circumference
  const reactions = totalReactions(posts)

  return (
    <section className="np-card np-reputation">
      <h2 className="np-card__title">Reputation</h2>
      <div className="np-reputation__body">
        <div className="np-reputation__gauge-wrap">
          <svg viewBox="0 0 120 120" className="np-reputation__gauge" aria-hidden>
            <circle cx="60" cy="60" r="54" className="np-reputation__track" />
            <circle
              cx="60"
              cy="60"
              r="54"
              className="np-reputation__fill"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={circumference * 0.25}
            />
          </svg>
          <div className="np-reputation__gauge-center">
            <span className="np-reputation__score">{score.toFixed(1)}</span>
            <span className="np-reputation__score-label">{noiseScoreLabel(score)}</span>
          </div>
        </div>
        <ul className="np-reputation__stats">
          <li>
            <span>Transmissions</span>
            <strong>{profile.postCount.toLocaleString()}</strong>
          </li>
          <li>
            <span>Lifetime dB</span>
            <strong>{profile.totalDb.toLocaleString()}</strong>
          </li>
          <li>
            <span>This week</span>
            <strong>{profile.weeklyDb.toLocaleString()}</strong>
          </li>
          <li>
            <span>Reactions</span>
            <strong>{reactions.toLocaleString()}</strong>
          </li>
        </ul>
      </div>
    </section>
  )
}
