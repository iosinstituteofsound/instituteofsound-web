import { useCallback } from 'react'
import { useContent } from '@/hooks/useContent'
import { getCommunity, getRanks } from '@/api/endpoints'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AnimatedGrid } from '@/components/ui/AnimatedGrid'
import { CommunityCard } from '@/components/cards/CommunityCard'
import { RankBadge } from '@/components/ui/RankBadge'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

export default function CommunityPage() {
  const members = useContent(useCallback(() => getCommunity(), []))
  const ranks = useContent(useCallback(() => getRanks(), []))

  if (members.loading || ranks.loading) return <LoadingTransmission variant="hell" />

  return (
    <div className="section-padding pt-32">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="The Network"
          title="Community"
          subtitle="Member ranks. Curators. Top contributors. A global cultural movement."
        />

        {ranks.data && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {ranks.data.map((r) => (
              <div
                key={r.rank}
                className="border border-border p-4 text-center hover:border-neon/40 transition-colors"
              >
                <RankBadge rank={r.rank} size="md" />
                <p className="text-[10px] text-muted mt-2">Lv.{r.level}</p>
                <p className="text-xs text-muted mt-1">{r.description}</p>
              </div>
            ))}
          </div>
        )}

        {members.data && (
          <AnimatedGrid columns={2}>
            {members.data.map((member) => (
              <CommunityCard key={member.id} member={member} />
            ))}
          </AnimatedGrid>
        )}
      </div>
    </div>
  )
}
