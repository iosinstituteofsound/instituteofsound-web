import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { userInitials } from '@/shared/lib/user-initials'

export interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  className?: string
  style?: React.CSSProperties
}

export function UserAvatar({ name, avatarUrl, className, style }: UserAvatarProps) {
  return (
    <Avatar className={className} style={style}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
      <AvatarFallback className="bg-muted text-sm font-medium">{userInitials(name)}</AvatarFallback>
    </Avatar>
  )
}
