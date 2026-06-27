import type { FeedAuthorDto } from '@/modules/feed/types/feed.types'
import { ProfileLink } from '@/shared/components/user/profile-link'

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
    <ProfileLink
      userId={author.id}
      name={author.name}
      className={className}
      variant={variant}
      aria-label={ariaLabel}
    >
      {children}
    </ProfileLink>
  )
}
