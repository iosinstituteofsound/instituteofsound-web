import type { CommunityRank } from '@/types'
import clsx from 'clsx'

const rankColors: Record<CommunityRank, string> = {
  Listener: 'border-muted/40 text-muted',
  Scout: 'border-neon/30 text-neon/80',
  Curator: 'border-neon/50 text-neon',
  Archivist: 'border-neon/70 text-neon',
  'Signal Host': 'border-crimson/50 text-crimson',
  Operator: 'border-crimson text-crimson bg-crimson/10',
}

interface RankBadgeProps {
  rank: CommunityRank
  size?: 'sm' | 'md'
}

export function RankBadge({ rank, size = 'sm' }: RankBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block border font-medium tracking-wider uppercase',
        rankColors[rank],
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'
      )}
    >
      {rank}
    </span>
  )
}
