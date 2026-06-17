import { Link } from 'react-router-dom'
import { ArrowUpRight, AudioLines, Users } from 'lucide-react'
import type { ExplorePayload } from '@/modules/explore/types/explore.types'

interface LandingSocialProofProps {
  listeners: ExplorePayload['listeners']
  community: ExplorePayload['community']
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

export function LandingSocialProof({ listeners, community }: LandingSocialProofProps) {
  const activity = community.latestActivity.slice(0, 3)
  const topListener = listeners.topListener

  if (listeners.totalListeners === 0 && activity.length === 0) return null

  return (
    <section className="landing-section" aria-labelledby="landing-proof-title">
      <header className="landing-section-head">
        <div>
          <p className="landing-section-head__num">04</p>
          <p className="landing-section-head__kicker">Community</p>
          <h2 id="landing-proof-title" className="landing-section-head__title">
            Live community pulse
          </h2>
          <p className="landing-section-head__sub">
            Real listeners, plays, and transmissions moving through the network.
          </p>
        </div>
        <Link to="/explore" className="landing-section-head__link">
          See full network
          <ArrowUpRight size={16} aria-hidden />
        </Link>
      </header>

      <div className="landing-proof__grid">
        <div className="landing-proof__pulse">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Network activity
          </p>
          <div className="landing-proof__pulse-stats">
            {listeners.totalListeners > 0 ? (
              <div>
                <p className="text-2xl font-extrabold">{formatCount(listeners.totalListeners)}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users size={14} aria-hidden />
                  Active listeners
                </p>
              </div>
            ) : null}
            {listeners.totalPlays > 0 ? (
              <div>
                <p className="text-2xl font-extrabold">{formatCount(listeners.totalPlays)}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <AudioLines size={14} aria-hidden />
                  Total plays
                </p>
              </div>
            ) : null}
          </div>
          {topListener ? (
            <div className="mt-5 rounded-lg border border-border/70 bg-card/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Top listener this week
              </p>
              <p className="mt-2 text-lg font-bold">{topListener.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Join to climb the ranks and shape the scene.
              </p>
              <Link
                to="/auth/register"
                className="mt-3 inline-flex text-sm font-semibold text-primary"
              >
                Create your profile
                <ArrowUpRight size={14} className="ml-1" aria-hidden />
              </Link>
            </div>
          ) : null}
        </div>

        {activity.length > 0 ? (
          <div className="landing-proof__activity">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Latest transmissions
            </p>
            {activity.map((item) => (
              <div key={item.id} className="landing-proof__activity-row">
                <div>
                  <p className="landing-proof__activity-title">{item.title}</p>
                  <p className="landing-proof__activity-meta">
                    {item.authorName} · {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            <Link to="/auth/register" className="text-sm font-semibold text-primary">
              Join to participate
              <ArrowUpRight size={14} className="ml-1 inline" aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
