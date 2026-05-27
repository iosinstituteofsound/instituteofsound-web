import { Link } from 'react-router-dom'
import { rankInfoList } from '@/lib/community/ranks'
import { useCommunityLeaderboard } from '@/hooks/useCommunity'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'
import { RankBadge } from '@/components/ui/RankBadge'
import { CommunityLeaderboard } from '@/components/community/CommunityLeaderboard'
import { SpinOfTheWeekHero } from '@/components/community/SpinOfTheWeekHero'

export function CommunitySection() {
  const ranks = rankInfoList()
  const { entries } = useCommunityLeaderboard(6)

  return (
    <section className="section-padding border-t border-border bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <MagazineSectionHeading
          kicker="Readers & Curators"
          title="The Movement"
          subtitle="Spin tracks on the wire · earn dB in Academy · rank up from Listener to Operator."
        />

        <SpinOfTheWeekHero variant="rail" className="mb-10" />

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

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {(
            [
              ['Network', '/community'],
              ['Scenes', '/scenes'],
              ['Events', '/events'],
              ['Collab', '/collab'],
            ] as const
          ).map(([label, href], i) => (
            <span key={href} className="flex items-center gap-4">
              {i > 0 && (
                <span className="text-muted text-xs hidden sm:inline" aria-hidden>
                  ·
                </span>
              )}
              <Link
                to={href}
                className="text-xs tracking-[0.2em] uppercase text-muted hover:text-rs-red transition-colors"
              >
                {label} →
              </Link>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
