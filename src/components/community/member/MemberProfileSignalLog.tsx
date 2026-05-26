import type { MemberActivityItem } from '@/lib/community/memberProfileService'
import { formatRelativeTime } from '@/lib/community/relativeTime'

function activityLabel(item: MemberActivityItem): string {
  if (item.kind === 'post') {
    const kind = item.label === 'spin' ? 'Spin' : 'Drop'
    return `Transmission · ${kind}`
  }
  const src = item.label.replace(/_/g, ' ')
  if (item.amount && item.amount > 0) return `+${item.amount} dB · ${src}`
  if (item.amount && item.amount < 0) return `${item.amount} dB · ${src}`
  return src
}

interface MemberProfileSignalLogProps {
  activity: MemberActivityItem[]
}

export function MemberProfileSignalLog({ activity }: MemberProfileSignalLogProps) {
  if (activity.length === 0) {
    return (
      <p className="member-profile-panel-empty">Signal log is quiet — no activity recorded.</p>
    )
  }

  return (
    <ol className="member-profile-signal-log">
      {activity.map((item, i) => (
        <li key={`${item.createdAt}-${i}`} className="member-profile-signal-item">
          <div className="member-profile-signal-rail" aria-hidden>
            <span
              className={
                item.kind === 'post'
                  ? 'member-profile-signal-node member-profile-signal-node-post'
                  : 'member-profile-signal-node'
              }
            />
            {i < activity.length - 1 && <span className="member-profile-signal-line" />}
          </div>
          <div className="member-profile-signal-body">
            <p className="member-profile-signal-label">{activityLabel(item)}</p>
            {item.detail && <p className="member-profile-signal-detail">{item.detail}</p>}
            <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
          </div>
        </li>
      ))}
    </ol>
  )
}
