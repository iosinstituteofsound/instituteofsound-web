import type { ToolId } from '@/lib/tools/registry'

interface ToolIconProps {
  className?: string
}

export function ToolIcon({ id, className }: ToolIconProps & { id: ToolId }) {
  const props = { className, viewBox: '0 0 48 48', fill: 'none', 'aria-hidden': true as const }

  switch (id) {
    case 'music-prompt':
      return (
        <svg {...props}>
          <rect x="4" y="8" width="40" height="32" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 16h24M12 24h18M12 32h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="36" cy="32" r="4" fill="currentColor" opacity="0.35" />
        </svg>
      )
    case 'chords':
      return (
        <svg {...props}>
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5" />
          <path d="M24 10v28M10 24h28" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <circle cx="24" cy="16" r="3" fill="currentColor" />
          <circle cx="16" cy="28" r="3" fill="currentColor" opacity="0.7" />
          <circle cx="32" cy="28" r="3" fill="currentColor" opacity="0.7" />
        </svg>
      )
    case 'artist-name':
      return (
        <svg {...props}>
          <path d="M8 38V14l16-6 16 6v24" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M16 38V22h16v16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 28h8M20 32h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'vocal-chain':
      return (
        <svg {...props}>
          <rect x="6" y="10" width="10" height="28" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="19" y="16" width="10" height="22" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="32" y="12" width="10" height="26" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 24h3M29 24h3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="6" r="2" fill="currentColor" />
        </svg>
      )
    case 'tuning':
      return (
        <svg {...props}>
          <path d="M8 36h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {[10, 16, 22, 28, 34, 40].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1={12 + i * 2}
              x2={x}
              y2={36}
              stroke="currentColor"
              strokeWidth={1 + (i % 2)}
              opacity={0.5 + i * 0.08}
            />
          ))}
          <path d="M6 12 Q24 8 42 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      )
    case 'bpm':
      return (
        <svg {...props}>
          <circle cx="24" cy="26" r="14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M24 26V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 26l8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <text x="24" y="42" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="monospace">
            BPM
          </text>
        </svg>
      )
    case 'tap-tempo':
      return (
        <svg {...props}>
          <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <path d="M24 14v20M14 24h20" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
          <circle cx="24" cy="24" r="3" fill="currentColor" />
        </svg>
      )
    case 'spectrum':
      return (
        <svg {...props}>
          {[8, 14, 20, 26, 32, 38].map((x, i) => (
            <rect
              key={x}
              x={x}
              y={36 - (8 + i * 4)}
              width="4"
              height={8 + i * 4}
              fill="currentColor"
              opacity={0.45 + i * 0.1}
            />
          ))}
          <path d="M6 40h36" stroke="currentColor" strokeWidth="1" />
        </svg>
      )
    case 'clipping':
      return (
        <svg {...props}>
          <path d="M8 32 L24 12 L40 32" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M24 20v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="32" r="1.5" fill="currentColor" />
          <path d="M10 38h28" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'loudness':
      return (
        <svg {...props}>
          <rect x="10" y="28" width="6" height="10" fill="currentColor" opacity="0.5" />
          <rect x="20" y="20" width="6" height="18" fill="currentColor" opacity="0.7" />
          <rect x="30" y="12" width="6" height="26" fill="currentColor" />
          <path d="M8 38h32" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'key-scale':
      return (
        <svg {...props}>
          <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M24 8v32M8 24h32" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          <text x="24" y="28" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold">
            K
          </text>
        </svg>
      )
    case 'lyrics':
      return (
        <svg {...props}>
          <path d="M10 12h28M10 20h22M10 28h26M10 36h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M34 32l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'setlist':
      return (
        <svg {...props}>
          <rect x="10" y="8" width="28" height="32" rx="1" stroke="currentColor" strokeWidth="1.5" />
          {[14, 20, 26, 32].map((y) => (
            <path key={y} d={`M14 ${y}h20`} stroke="currentColor" strokeWidth="1" opacity="0.5" />
          ))}
        </svg>
      )
    case 'audio-format':
      return (
        <svg {...props}>
          <rect x="8" y="14" width="32" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 24h8M14 28h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="34" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'subgenre-tags':
      return (
        <svg {...props}>
          <path d="M12 20h12l6 6V14l-6 6z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M8 32h20M8 26h14" stroke="currentColor" strokeWidth="1" opacity="0.45" strokeLinecap="round" />
        </svg>
      )
    case 'export-checklist':
      return (
        <svg {...props}>
          <rect x="10" y="8" width="28" height="32" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 18l4 4 8-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 30h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      )
  }
}
