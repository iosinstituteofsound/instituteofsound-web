import { Link } from 'react-router-dom'
import type { CommunityMember, RankInfo } from '@/types'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'
import { AnimatedGrid } from '@/components/ui/AnimatedGrid'
import { CommunityCard } from '@/components/cards/CommunityCard'
import { RankBadge } from '@/components/ui/RankBadge'

interface CommunitySectionProps {
  members: CommunityMember[]
  ranks: RankInfo[]
}

export function CommunitySection({ members, ranks }: CommunitySectionProps) {
  return (
    <section className="section-padding border-t border-border bg-surface/30 metal-section section-perf">
      <div className="max-w-7xl mx-auto">
        <MagazineSectionHeading
          kicker="Readers & Curators"
          title="The Movement"
          subtitle="Rank up from Listener to Operator. The culture runs on the community."
        />

        <div className="flex flex-wrap gap-3 mb-12">
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

        <AnimatedGrid columns={2}>
          {members.slice(0, 6).map((member) => (
            <CommunityCard key={member.id} member={member} />
          ))}
        </AnimatedGrid>

        <div className="mt-12 text-center">
          <Link
            to="/community"
            className="text-xs tracking-[0.2em] uppercase text-muted hover:text-rs-red transition-colors"
          >
            Join The Movement →
          </Link>
        </div>
      </div>
    </section>
  )
}
