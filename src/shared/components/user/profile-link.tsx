import { Link } from 'react-router-dom'
import { getProfilePath } from '@/shared/lib/profile-path'
import { cn } from '@/shared/lib/cn'
import './profile-link.css'

interface ProfileLinkProps {
  userId: string
  name: string
  className?: string
  variant?: 'default' | 'avatar' | 'name'
  children: React.ReactNode
  'aria-label'?: string
}

export function ProfileLink({
  userId,
  name,
  className,
  variant = 'default',
  children,
  'aria-label': ariaLabel,
}: ProfileLinkProps) {
  return (
    <Link
      to={getProfilePath(userId)}
      className={cn(
        'feed-author-profile-link',
        variant === 'avatar' && 'feed-author-profile-link--avatar',
        variant === 'name' && 'feed-author-profile-link--name',
        className,
      )}
      aria-label={ariaLabel ?? `${name} profile`}
    >
      {children}
    </Link>
  )
}
