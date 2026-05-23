interface EditorBylineProps {
  name?: string
  username?: string
  /** Combined fallback when only legacy `author` string exists */
  fallback?: string
  className?: string
}

export function EditorByline({ name, username, fallback, className = '' }: EditorBylineProps) {
  const displayName = name?.trim() || (fallback && !fallback.includes('(@') ? fallback : '')
  const handle = username?.trim().replace(/^@/, '')

  if (displayName && handle) {
    return (
      <span className={className}>
        <span className="text-foreground">{displayName}</span>
        <span className="text-muted"> · </span>
        <span className="text-mh-red">@{handle}</span>
      </span>
    )
  }

  if (handle) {
    return <span className={`text-mh-red ${className}`.trim()}>@{handle}</span>
  }

  if (displayName) {
    return <span className={className}>{displayName}</span>
  }

  return <span className={className}>{fallback ?? 'Institute of Sound'}</span>
}
