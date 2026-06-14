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
}

export function FeedUserAvatar({ name, avatarUrl, className }: FeedUserAvatarProps) {
  return (
    <Avatar className={className}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
      <AvatarFallback className="bg-muted text-sm font-medium">{authorInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
