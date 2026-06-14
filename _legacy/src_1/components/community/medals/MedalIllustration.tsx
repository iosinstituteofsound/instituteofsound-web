import type { CommunityBadgeSlug } from '@/lib/community/badges'
import clsx from 'clsx'

interface MedalIllustrationProps {
  slug: CommunityBadgeSlug | string
  className?: string
  size?: number
}

const uid = (slug: string, part: string) => `medal-${slug}-${part}`

export function MedalIllustration({ slug, className, size = 120 }: MedalIllustrationProps) {
  const s = slug as CommunityBadgeSlug

  return (
    <svg
      className={clsx('medal-illustration', className)}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={uid(s, 'rim')} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5e6c8" />
          <stop offset="35%" stopColor="#8a6a3a" />
          <stop offset="70%" stopColor="#2a2218" />
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>
        <linearGradient id={uid(s, 'face')} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <radialGradient id={uid(s, 'glow')} cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor={medalAccent(s)} stopOpacity="0.45" />
          <stop offset="100%" stopColor={medalAccent(s)} stopOpacity="0" />
        </radialGradient>
        <filter id={uid(s, 'shadow')}>
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Ribbon */}
      <path
        d="M38 98 L48 108 L60 100 L72 108 L82 98 L72 92 L48 92 Z"
        fill={medalAccent(s)}
        opacity="0.85"
      />
      <path d="M52 92 L60 88 L68 92 L60 108 Z" fill="#1a0a0a" opacity="0.5" />

      {/* Outer coin */}
      <circle cx="60" cy="54" r="44" fill={`url(#${uid(s, 'rim')})`} filter={`url(#${uid(s, 'shadow')})`} />
      <circle cx="60" cy="54" r="40" fill={`url(#${uid(s, 'face')})`} stroke={medalAccent(s)} strokeWidth="1.5" />
      <circle cx="60" cy="54" r="38" fill={`url(#${uid(s, 'glow')})`} />

      {renderMedalArt(s)}
    </svg>
  )
}

function medalAccent(slug: CommunityBadgeSlug | string): string {
  switch (slug) {
    case 'golden_ear':
      return '#e8c547'
    case 'quiz_locked':
      return '#c9a0ff'
    case 'crew_joined':
      return '#ff4d6d'
    case 'weekly_warrior':
      return '#ff6b35'
    case 'triple_signal':
      return '#00e5ff'
    case 'scout_promoted':
      return '#7cfc9a'
    default:
      return '#e31b23'
  }
}

function renderMedalArt(slug: CommunityBadgeSlug | string) {
  const c = medalAccent(slug)
  switch (slug) {
    case 'first_signal':
      return (
        <g stroke={c} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M60 28 L60 44" />
          <circle cx="60" cy="24" r="4" fill={c} stroke="none" />
          <path d="M44 52 Q60 38 76 52" />
          <path d="M38 58 Q60 44 82 58" opacity="0.7" />
          <path d="M32 64 Q60 50 88 64" opacity="0.45" />
          <rect x="54" y="44" width="12" height="18" rx="2" fill="#141414" stroke={c} />
        </g>
      )
    case 'quiz_locked':
      return (
        <g>
          <rect x="42" y="40" width="36" height="28" rx="4" fill="#141414" stroke={c} strokeWidth="2" />
          <path d="M48 40 V34 Q60 26 72 34 V40" stroke={c} strokeWidth="2" fill="none" />
          <path d="M52 54 L58 60 L70 46" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="60" y="52" textAnchor="middle" fill={c} fontSize="8" fontWeight="bold" fontFamily="system-ui">
            A+
          </text>
        </g>
      )
    case 'golden_ear':
      return (
        <g>
          <path
            d="M72 38 Q78 54 72 70 Q66 78 58 76 Q48 72 46 58 Q44 44 52 36 Q60 30 68 34 Z"
            fill="#1a1408"
            stroke={c}
            strokeWidth="2"
          />
          <path d="M58 42 Q54 54 56 66" stroke={c} strokeWidth="1.5" opacity="0.6" fill="none" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="60"
              y1="54"
              x2={60 + 22 * Math.cos((deg * Math.PI) / 180)}
              y2={54 + 22 * Math.sin((deg * Math.PI) / 180)}
              stroke={c}
              strokeWidth="1"
              opacity="0.35"
            />
          ))}
        </g>
      )
    case 'scout_promoted':
      return (
        <g stroke={c} fill="none" strokeWidth="2">
          <circle cx="60" cy="54" r="14" />
          <path d="M60 40 L60 68 M46 54 L74 54" />
          <path d="M60 40 L64 48 L60 46 L56 48 Z" fill={c} stroke="none" />
          <path d="M74 54 L66 58 L68 54 L66 50 Z" fill={c} stroke="none" opacity="0.8" />
        </g>
      )
    case 'first_spin':
      return (
        <g>
          <circle cx="60" cy="54" r="20" fill="#0d0d0d" stroke={c} strokeWidth="2" />
          <circle cx="60" cy="54" r="6" fill={c} />
          <circle cx="60" cy="54" r="14" stroke={c} strokeWidth="0.75" opacity="0.4" fill="none" />
          <circle cx="60" cy="54" r="10" stroke={c} strokeWidth="0.5" opacity="0.25" fill="none" />
          <path d="M78 42 Q84 54 78 66" stroke={c} strokeWidth="1.5" fill="none" opacity="0.7" />
        </g>
      )
    case 'first_drop':
      return (
        <g>
          <path
            d="M60 32 Q76 50 68 68 Q60 78 52 68 Q44 50 60 32 Z"
            fill="#140808"
            stroke={c}
            strokeWidth="2"
          />
          <path d="M60 40 L60 62" stroke={c} strokeWidth="1.5" opacity="0.5" />
          <circle cx="60" cy="48" r="3" fill={c} opacity="0.8" />
        </g>
      )
    case 'crew_joined':
      return (
        <g stroke={c} strokeWidth="2" fill="#140a0c">
          <path d="M42 68 L60 38 L78 68 Z" />
          <circle cx="48" cy="62" r="5" fill={c} stroke="none" />
          <circle cx="60" cy="58" r="5" fill={c} stroke="none" />
          <circle cx="72" cy="62" r="5" fill={c} stroke="none" />
        </g>
      )
    case 'weekly_warrior':
      return (
        <g>
          <path d="M44 70 L52 38 L60 52 L68 38 L76 70 Z" fill="#1a0808" stroke={c} strokeWidth="2" strokeLinejoin="round" />
          <path d="M56 52 L60 46 L64 52" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.5" />
          <rect x="48" y="68" width="24" height="4" rx="1" fill={c} opacity="0.6" />
        </g>
      )
    case 'triple_signal':
      return (
        <g fill={c}>
          <path d="M48 68 L54 36 L60 56 L66 36 L72 68 Z" opacity="0.9" />
          <path d="M54 36 L60 28 L66 36" fill="none" stroke={c} strokeWidth="1.5" />
          <circle cx="60" cy="54" r="3" fill="#0a0a0a" stroke={c} strokeWidth="1" />
        </g>
      )
    default:
      return (
        <text x="60" y="58" textAnchor="middle" fill={c} fontSize="14" fontWeight="bold">
          ★
        </text>
      )
  }
}
