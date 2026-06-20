import { Link } from 'react-router-dom'
import { BadgeCheck } from 'lucide-react'
import type { ListenerProfileDto } from '@/modules/music/types/analytics.types'
import { formatListenTime, formatPlays } from '@/modules/music/lib/analytics-format'

type Props = {
  listener: ListenerProfileDto
}

export function ReleaseListenerCard({ listener }: Props) {
  return (
    <Link
      to={listener.profileHref}
      className="ios-release-listener-card"
    >
      <div className="ios-release-listener-card__avatar">
        {listener.avatarUrl ? (
          <img src={listener.avatarUrl} alt="" />
        ) : (
          <span>{listener.name.slice(0, 1).toUpperCase()}</span>
        )}
      </div>
      <div className="ios-release-listener-card__body">
        <p className="ios-release-listener-card__name">
          {listener.name}
          {listener.isVerified ? <BadgeCheck size={14} aria-label="Verified" /> : null}
        </p>
        {listener.username ? (
          <p className="ios-release-listener-card__username">@{listener.username}</p>
        ) : null}
        <p className="ios-release-listener-card__stats">
          {formatPlays(listener.qualifiedPlays)} plays · {formatListenTime(listener.totalListenSec)}
        </p>
      </div>
      <span className="ios-release-listener-card__rank">#{listener.rank}</span>
    </Link>
  )
}
