import { Link } from 'react-router-dom'
import { networkProfilePath } from '@/lib/community/networkPaths'

interface EditorBylineProps {
  name?: string
  username?: string
  /** Combined fallback when only legacy `author` string exists */
  fallback?: string
  className?: string
  /** Link @handle to network profile when true (default) */
  linkNetworkProfile?: boolean
}

export function EditorByline({
  name,
  username,
  fallback,
  className = '',
  linkNetworkProfile = true,
}: EditorBylineProps) {
  const displayName = name?.trim() || (fallback && !fallback.includes('(@') ? fallback : '')
  const handle = username?.trim().replace(/^@/, '')

  const handleEl =
    handle && linkNetworkProfile ? (
      <Link to={networkProfilePath(handle)} className="text-mh-red hover:underline">
        @{handle}
      </Link>
    ) : handle ? (
      <span className="text-mh-red">@{handle}</span>
    ) : null

  if (displayName && handle) {
    return (
      <span className={className}>
        <span className="text-foreground">{displayName}</span>
        <span className="text-muted"> · </span>
        {handleEl}
      </span>
    )
  }

  if (handle) {
    return <span className={className}>{handleEl}</span>
  }

  if (displayName) {
    return <span className={className}>{displayName}</span>
  }

  return <span className={className}>{fallback ?? 'Institute of Sound'}</span>
}
