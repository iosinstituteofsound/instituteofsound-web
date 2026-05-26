import { useAuth } from '@/context/AuthContext'
import { rankInfoList } from '@/lib/community/ranks'
import { useCommunityLeaderboard, useCommunityMemberStats } from '@/hooks/useCommunity'
import { useCommunityBadges } from '@/hooks/useCommunityBadges'
import { CommunityTribePanel } from '@/components/community/CommunityTribePanel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RankBadge } from '@/components/ui/RankBadge'
import { CommunityProgressCard } from '@/components/community/CommunityProgressCard'
import { CommunityLeaderboard } from '@/components/community/CommunityLeaderboard'
import { CommunityGenreLeaderboard } from '@/components/community/CommunityGenreLeaderboard'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import { CommunityCrewPanel } from '@/components/community/CommunityCrewPanel'
import { CommunityCrewLeaderboard } from '@/components/community/CommunityCrewLeaderboard'
import { CommunityWeeklyChallenges } from '@/components/community/CommunityWeeklyChallenges'

export default function CommunityPage() {
  const { user } = useAuth()
  const ranks = rankInfoList()
  const { entries, loading: boardLoading } = useCommunityLeaderboard(20)
  const { stats, loading: statsLoading, isLoggedIn } = useCommunityMemberStats()
  const { badges, loading: badgesLoading } = useCommunityBadges(user?.id)

  return (
    <div className="section-padding pt-32">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="The Network"
          title="Community"
          subtitle="Crews, spins, drops, tribe boards — earn dB and rank up from Listener to Operator."
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

        {isLoggedIn && <CommunityWeeklyChallenges />}

        {isLoggedIn && !statsLoading && stats && (
          <CommunityProgressCard
            stats={stats}
            badges={badges}
            badgesLoading={badgesLoading}
            className="mb-8"
          />
        )}

        {isLoggedIn && <CommunityTribePanel />}

        <div className="mb-12 space-y-12">
          <CommunityCrewPanel />
          <CommunityCrewLeaderboard />
        </div>

        <CommunityFeed highlightUserId={user?.id} />

        <CommunityGenreLeaderboard highlightUserId={user?.id} />

        <section className="mt-16" aria-labelledby="weekly-leaderboard-heading">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h2 id="weekly-leaderboard-heading" className="font-display text-2xl font-bold">
                Global weekly leaderboard
              </h2>
              <p className="text-sm text-muted mt-1">All tribes combined · resets every 7 days</p>
            </div>
          </div>
          {boardLoading && entries.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">Loading leaderboard…</p>
          ) : (
            <CommunityLeaderboard entries={entries} highlightUserId={user?.id} />
          )}
        </section>
      </div>
    </div>
  )
}
