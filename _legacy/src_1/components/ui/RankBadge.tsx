import type { CommunityRank } from '@/types'
import clsx from 'clsx'

const rankClass: Record<CommunityRank, string> = {
  Listener: 'metal-badge-dark',
  Scout: 'metal-badge-dark',
  Curator: 'metal-badge',
  Archivist: 'metal-badge',
  'Signal Host': 'metal-badge-crimson',
  Operator: 'metal-badge-live',
}

interface RankBadgeProps {
  rank: CommunityRank
  size?: 'sm' | 'md'
}

export function RankBadge({ rank, size = 'sm' }: RankBadgeProps) {
  return (
    <span className={clsx('metal-badge', rankClass[rank], size === 'md' && '!text-xs !px-3 !py-1')}>
      {rank}
    </span>
  )
}
