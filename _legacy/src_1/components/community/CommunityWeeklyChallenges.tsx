import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useWeeklyChallenges } from '@/hooks/useWeeklyChallenges'
import { evaluateWeeklyChallenges } from '@/lib/community/challengeService'

export function CommunityWeeklyChallenges() {
  const { challenges, loading, isLoggedIn } = useWeeklyChallenges()

  if (!isLoggedIn) {
    return (
      <section className="community-challenges ios-card">
        <h2 className="font-display text-xl font-bold">Weekly challenges</h2>
        <p className="text-sm text-muted mt-2">
          Complete missions for bonus dB and badges. Resets every ISO week.
        </p>
        <Link to="/login" className="ios-btn ios-btn-metal inline-block mt-4">
          Sign in →
        </Link>
      </section>
    )
  }

  return (
    <section className="community-challenges ios-card" aria-labelledby="weekly-challenges-heading">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="ios-kicker">Phase 5</p>
          <h2 id="weekly-challenges-heading" className="font-display text-xl font-bold">
            Weekly challenges
          </h2>
          <p className="text-sm text-muted mt-1">
            Includes Academy missions · bonus when you complete 3+ this week.
          </p>
        </div>
        <button
          type="button"
          className="ios-btn ios-btn-secondary text-xs"
          onClick={() => void evaluateWeeklyChallenges()}
        >
          Sync progress
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading challenges…</p>
      ) : (
        <ul className="community-challenges-list">
          {challenges.map((ch) => {
            const pct = ch.target > 0 ? Math.min(100, Math.round((ch.progress / ch.target) * 100)) : 0
            return (
              <li
                key={ch.slug}
                className={clsx('community-challenge-item', ch.completed && 'community-challenge-item-done')}
              >
                <div className="community-challenge-head">
                  <p className="community-challenge-title">{ch.title}</p>
                  <span className="community-challenge-reward">+{ch.rewardDb} dB</span>
                </div>
                <p className="community-challenge-desc">{ch.description}</p>
                <div className="community-challenge-bar" role="progressbar" aria-valuenow={pct}>
                  <div className="community-challenge-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="community-challenge-meta">
                  {ch.completed ? (
                    <span className="text-rs-red">Complete</span>
                  ) : (
                    <>
                      {ch.progress}/{ch.target}
                    </>
                  )}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
