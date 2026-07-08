import type { ConnectionQuality } from '@/modules/messenger/types/call.types'

const LABELS: Record<ConnectionQuality, string> = {
  good: 'Good connection',
  fair: 'Fair connection',
  poor: 'Poor connection',
}

export function CallNetworkBadge({ quality }: { quality: ConnectionQuality | null }) {
  if (!quality) return null

  const activeBars = quality === 'good' ? 3 : quality === 'fair' ? 2 : 1

  return (
    <div className="messenger-call__network-badge" aria-live="polite">
      <div className="messenger-call__network-bars" aria-hidden>
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className="messenger-call__network-bar"
            style={{
              height: `${4 + bar * 3}px`,
              opacity: bar <= activeBars ? 1 : 0.25,
            }}
          />
        ))}
      </div>
      <span className="messenger-call__network-label">{LABELS[quality]}</span>
    </div>
  )
}
