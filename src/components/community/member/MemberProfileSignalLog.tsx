import type { MemberActivityItem } from '@/lib/community/memberProfileService'
import { formatRelativeTime } from '@/lib/community/relativeTime'

function activityHeadline(item: MemberActivityItem): string {
  if (item.kind === 'post') {
    return item.label === 'spin' ? 'Posted a spin' : 'Dropped a transmission'
  }
  const src = item.label.replace(/_/g, ' ')
  if (item.amount && item.amount > 0) return `Earned +${item.amount} dB`
  if (item.amount && item.amount < 0) return `Signal ${item.amount} dB`
  return src.charAt(0).toUpperCase() + src.slice(1)
}

function activityIcon(item: MemberActivityItem): string {
  if (item.kind === 'post') return item.label === 'spin' ? '◎' : '◆'
  if (item.amount && item.amount > 0) return '▲'
  if (item.amount && item.amount < 0) return '▼'
  return '·'
}

interface MemberProfileSignalLogProps {
  activity: MemberActivityItem[]
}

export function MemberProfileSignalLog({ activity }: MemberProfileSignalLogProps) {
  if (activity.length === 0) {
    return (
      <div className="network-activity-empty">
        <p className="network-activity-empty-title">Activity is quiet</p>
        <p className="network-activity-empty-text">No spins, drops, or dB events recorded yet.</p>
      </div>
    )
  }

  return (
    <ol className="network-activity-log member-profile-signal-log">
      {activity.map((item, i) => (
        <li
          key={`${item.createdAt}-${i}`}
          className="network-activity-item member-profile-signal-item"
        >
          <span
            className={`network-activity-icon ${
              item.kind === 'post' ? 'network-activity-icon--post' : 'network-activity-icon--db'
            }`}
            aria-hidden
          >
            {activityIcon(item)}
          </span>
          <div className="network-activity-body member-profile-signal-body">
            <p className="network-activity-headline member-profile-signal-label">
              {activityHeadline(item)}
            </p>
            {item.detail && (
              <p className="network-activity-detail member-profile-signal-detail">{item.detail}</p>
            )}
            <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
          </div>
        </li>
      ))}
    </ol>
  )
}
