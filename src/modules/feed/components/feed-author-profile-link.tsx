import { Link } from 'react-router-dom'
import type { FeedAuthorDto } from '@/modules/feed/types/feed.types'
import { getFeedAuthorProfilePath } from '@/modules/feed/lib/feed-author-profile'
import { cn } from '@/shared/lib/cn'
import './feed-author-profile-link.css'

interface FeedAuthorProfileLinkProps {
  author: FeedAuthorDto
  className?: string
  variant?: 'default' | 'avatar' | 'name'
  children: React.ReactNode
  'aria-label'?: string
}

export function FeedAuthorProfileLink({
  author,
  className,
  variant = 'default',
  children,
  'aria-label': ariaLabel,
}: FeedAuthorProfileLinkProps) {
  return (
    <Link
      to={getFeedAuthorProfilePath(author)}
      className={cn(
        'feed-author-profile-link',
        variant === 'avatar' && 'feed-author-profile-link--avatar',
        variant === 'name' && 'feed-author-profile-link--name',
        className,
      )}
      aria-label={ariaLabel ?? `${author.name} profile`}
    >
      {children}
    </Link>
  )
}
