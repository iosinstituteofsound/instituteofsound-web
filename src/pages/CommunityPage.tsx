import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { rankInfoList } from '@/lib/community/ranks'
import { useCommunityLeaderboard, useCommunityMemberStats } from '@/hooks/useCommunity'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RankBadge } from '@/components/ui/RankBadge'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { CommunityProgressCard } from '@/components/community/CommunityProgressCard'
import { CommunityLeaderboard } from '@/components/community/CommunityLeaderboard'

export default function CommunityPage() {
  const { user } = useAuth()
  const ranks = rankInfoList()
  const { entries, loading: boardLoading } = useCommunityLeaderboard(20)
  const { stats, loading: statsLoading, isLoggedIn } = useCommunityMemberStats()

  if (boardLoading && entries.length === 0) {
    return <LoadingTransmission variant="hell" />
  }

  return (
    <div className="section-padding pt-32">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="The Network"
          title="Community"
          subtitle="Earn dB from learning and ear training. Rank up from Listener to Operator."
          titleAs="h1"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {ranks.map((r) => (
            <div
              key={r.rank}
              className="border border-border p-4 text-center hover:border-neon/40 transition-colors"
              title={`${r.thresholdDb.toLocaleString()}+ dB`}
            >
              <RankBadge rank={r.rank} size="md" />
              <p className="text-[10px] text-muted mt-2">Lv.{r.level}</p>
              <p className="text-xs text-muted mt-1">{r.description}</p>
            </div>
          ))}
        </div>

        {isLoggedIn && !statsLoading && stats && (
          <CommunityProgressCard stats={stats} className="mb-12" />
        )}

        {!isLoggedIn && (
          <div className="community-guest-cta ios-card mb-12 p-6 md:p-8">
            <p className="font-display text-xl font-bold">Join the network</p>
            <p className="text-muted text-sm mt-2 max-w-xl leading-relaxed">
              Sign in to earn dB, track your rank, and compete on the weekly leaderboard. Academy
              progress counts toward your score.
            </p>
            <Link to="/login" className="ios-btn ios-btn-metal inline-block mt-5">
              Sign in →
            </Link>
          </div>
        )}

        <section aria-labelledby="weekly-leaderboard-heading">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h2 id="weekly-leaderboard-heading" className="font-display text-2xl font-bold">
                Weekly leaderboard
              </h2>
              <p className="text-sm text-muted mt-1">Top dB earners · resets every 7 days</p>
            </div>
          </div>
          <CommunityLeaderboard entries={entries} highlightUserId={user?.id} />
        </section>
      </div>
    </div>
  )
}
