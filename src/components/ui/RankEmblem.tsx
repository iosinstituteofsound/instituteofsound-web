import clsx from 'clsx'

export const RANK_TIERS = [
  'iron',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'signal',
] as const

export type RankTier = (typeof RANK_TIERS)[number]
export type RankLevel = 'I' | 'II' | 'III' | 'IV' | 'V'

const TIER_LABEL: Record<RankTier, string> = {
  iron: 'Iron',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
  signal: 'Signal',
}

interface RankEmblemProps {
  tier: RankTier
  level: RankLevel
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function TierSigil({ tier }: { tier: RankTier }) {
  const common = { className: 'rank-emblem__sigil-svg', viewBox: '0 0 24 24', 'aria-hidden': true as const }
  switch (tier) {
    case 'iron':
      return (
        <svg {...common}>
          <path d="M6 18h12M8 14h8M10 10h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      )
    case 'bronze':
      return (
        <svg {...common}>
          <path d="M12 5l2.5 5 5.5.8-4 3.9.9 5.5L12 17l-4.9 2.7.9-5.5-4-3.9 5.5-.8L12 5z" fill="currentColor" opacity={0.9} />
        </svg>
      )
    case 'silver':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        </svg>
      )
    case 'gold':
      return (
        <svg {...common}>
          <path d="M12 4l2.2 6.5H21l-5.5 4 2.1 6.5L12 17l-5.6 4 2.1-6.5L3 10.5h6.8L12 4z" fill="currentColor" />
        </svg>
      )
    case 'platinum':
      return (
        <svg {...common}>
          <path d="M12 3l3 9h9l-7.5 5.5 2.8 9L12 21l-7.3 5.5 2.8-9L4 12h9l3-9z" fill="currentColor" opacity={0.95} />
        </svg>
      )
    case 'diamond':
      return (
        <svg {...common}>
          <path d="M12 4l8 8-8 8-8-8 8-8z" fill="currentColor" />
        </svg>
      )
    case 'signal':
      return (
        <svg {...common}>
          <path d="M5 18V9M9 18V6M13 18v-4M17 18V3M21 18v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
  }
}

export function RankEmblem({ tier, level, size = 'md', className }: RankEmblemProps) {
  return (
    <span
      className={clsx('rank-emblem', `rank-emblem--${tier}`, `rank-emblem--${size}`, className)}
      role="img"
      aria-label={`${TIER_LABEL[tier]} Tier ${level}`}
    >
      <span className="rank-emblem__aura" aria-hidden />
      <span className="rank-emblem__body" aria-hidden>
        <span className="rank-emblem__rim" />
        <span className="rank-emblem__shine" />
        <span className="rank-emblem__glyph">{level}</span>
        <span className="rank-emblem__sigil">
          <TierSigil tier={tier} />
        </span>
      </span>
    </span>
  )
}
