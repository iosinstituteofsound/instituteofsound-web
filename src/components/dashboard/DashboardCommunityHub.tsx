import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { RankBadge } from '@/components/ui/RankBadge'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

export function DashboardCommunityHub() {
  const { user } = useAuth()
  const { stats, loading } = useCommunityMemberStats()

  if (!user) return null

  const handle = memberHandleFromUser(user)
  const profilePath = `/network/${handle}`

  return (
    <div className="dashboard-community-hub space-y-8">
      <div className="ios-card p-6 md:p-8">
        <p className="text-[10px] tracking-[0.25em] uppercase text-mh-red font-bold mb-2">
          The Network
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-bold uppercase">
          Community & feed
        </h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Post Spins and Drops on the live feed, earn dB, rank up, and show activity on your public
          member profile.
        </p>

        {loading && !stats ? (
          <div className="mt-6">
            <LoadingTransmission variant="compact" />
          </div>
        ) : stats ? (
          <div className="dashboard-community-hub-stats mt-6 flex flex-wrap items-center gap-4">
            <RankBadge rank={stats.rank} size="md" />
            <div>
              <p className="font-display text-2xl font-bold">{stats.totalDb.toLocaleString()} dB</p>
              <p className="text-xs text-muted">
                {stats.weeklyDb.toLocaleString()} this week
                {stats.primaryGenreSlug && ` · ${stats.primaryGenreSlug} tribe`}
              </p>
            </div>
            <p className="text-sm text-muted">
              Public handle: <span className="text-mh-red font-mono">@{handle}</span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted mt-4">
            Sign in with cloud auth to sync dB and posts across devices.
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-8">
          <Link to="/community#feed" className="ios-btn ios-btn-primary !text-xs">
            Open network feed →
          </Link>
          <Link to={profilePath} className="ios-btn ios-btn-secondary !text-xs">
            My public profile
          </Link>
          <Link to="/community" className="ios-btn ios-btn-ghost !text-xs">
            Full community hub
          </Link>
        </div>
      </div>

      <div className="ios-card p-6 border-dashed border-border">
        <h3 className="font-display text-lg font-bold uppercase">Quick guide</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted list-disc pl-5">
          <li>
            <strong className="text-signal">Feed</strong> — everyone&apos;s Spins & Drops at{' '}
            <Link to="/community#feed" className="text-mh-red hover:underline">
              /community
            </Link>
          </li>
          <li>
            <strong className="text-signal">Your profile</strong> — posts + activity at{' '}
            <Link to={profilePath} className="text-mh-red hover:underline">
              {profilePath}
            </Link>
          </li>
          <li>Set your @username in profile settings so your link is easy to share.</li>
        </ul>
      </div>
    </div>
  )
}
