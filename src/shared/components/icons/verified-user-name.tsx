import { VerifiedBadge } from '@/shared/components/icons/verified-badge'
import { cn } from '@/shared/lib/cn'

interface VerifiedUserNameProps {
  name: string
  isVerified?: boolean
  className?: string
  nameClassName?: string
  badgeClassName?: string
}

/** Inline display name with a verified badge scaled to the surrounding font size. */
export function VerifiedUserName({
  name,
  isVerified,
  className,
  nameClassName,
  badgeClassName,
}: VerifiedUserNameProps) {
  return (
    <span className={cn('inline-flex max-w-full items-center gap-[0.22em]', className)}>
      <span className={cn('truncate', nameClassName)}>{name}</span>
      {isVerified ? <VerifiedBadge size="inherit" className={badgeClassName} /> : null}
    </span>
  )
}
