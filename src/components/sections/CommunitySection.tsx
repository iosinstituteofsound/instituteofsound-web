import { Link } from 'react-router-dom'
import { rankInfoList } from '@/lib/community/ranks'
import { useCommunityLeaderboard } from '@/hooks/useCommunity'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'
import { RankBadge } from '@/components/ui/RankBadge'
import { CommunityLeaderboard } from '@/components/community/CommunityLeaderboard'

export function CommunitySection() {
  const ranks = rankInfoList()
  const { entries } = useCommunityLeaderboard(6)

  return (
    <section className="section-padding border-t border-border bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <MagazineSectionHeading
          kicker="Readers & Curators"
          title="The Movement"
          subtitle="Earn dB · rank up from Listener to Operator · weekly leaderboard."
        />

        <div className="flex flex-wrap gap-3 mb-10">
          {ranks.map((r) => (
            <div
              key={r.rank}
              className="border border-border px-4 py-3 hover:border-neon/50 transition-colors"
              title={r.description}
            >
              <RankBadge rank={r.rank} size="md" />
              <p className="text-[10px] text-muted mt-1 max-w-[140px]">{r.description}</p>
            </div>
          ))}
        </div>

        <CommunityLeaderboard entries={entries} compact />

        <div className="mt-12 text-center">
          <Link
            to="/community"
            className="text-xs tracking-[0.2em] uppercase text-muted hover:text-rs-red transition-colors"
          >
            Full leaderboard & your rank →
          </Link>
        </div>
      </div>
    </section>
  )
}
