import {
  parsePostAudienceFromPayload,
  postAudienceIcon,
  postAudienceLabel,
} from '@/modules/feed/lib/post-audience'
import { cn } from '@/shared/lib/cn'

interface FeedPostAudienceIconProps {
  payload?: Record<string, unknown>
  className?: string
}

export function FeedPostAudienceIcon({ payload, className }: FeedPostAudienceIconProps) {
  const audience = parsePostAudienceFromPayload(payload)
  const Icon = postAudienceIcon(audience.type)
  const label = postAudienceLabel(audience)

  return <Icon className={cn(className)} aria-label={label} />
}
