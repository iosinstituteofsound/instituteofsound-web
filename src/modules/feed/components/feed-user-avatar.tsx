import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'

export function authorInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

interface FeedUserAvatarProps {
  name: string
  avatarUrl?: string | null
  className?: string
  style?: React.CSSProperties
}

export function FeedUserAvatar({ name, avatarUrl, className, style }: FeedUserAvatarProps) {
  return (
    <Avatar className={className} style={style}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
      <AvatarFallback className="bg-muted text-sm font-medium">{authorInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
