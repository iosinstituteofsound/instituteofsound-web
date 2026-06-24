import type { LucideIcon } from 'lucide-react'
import { Globe, Star, User, UserMinus, Users } from 'lucide-react'

export const POST_AUDIENCE_TYPES = [
  'public',
  'friends',
  'close_friends',
  'exclude',
  'include',
] as const

export type PostAudienceType = (typeof POST_AUDIENCE_TYPES)[number]

export interface PostAudienceSelection {
  type: PostAudienceType
  excludedUserIds: string[]
  includedUserIds: string[]
}

export interface PostAudienceOptionMeta {
  type: PostAudienceType
  label: string
  description: string
  icon: LucideIcon
  actionLabel?: string
}

export const POST_AUDIENCE_OPTIONS: PostAudienceOptionMeta[] = [
  {
    type: 'public',
    label: 'Public',
    description: 'Anyone on or off Institute of Sound.',
    icon: Globe,
  },
  {
    type: 'friends',
    label: 'Friends',
    description: 'Your friends on Institute of Sound.',
    icon: Users,
  },
  {
    type: 'close_friends',
    label: 'Close friends',
    description: 'Share with people you trust most.',
    icon: Star,
    actionLabel: 'Update your list',
  },
  {
    type: 'exclude',
    label: "Don't show to…",
    description: 'Hide this post from specific people.',
    icon: UserMinus,
    actionLabel: 'Select friends',
  },
  {
    type: 'include',
    label: 'Only show to…',
    description: 'Only chosen people can see this post.',
    icon: User,
    actionLabel: 'Select friends',
  },
]

const DEFAULT_AUDIENCE_STORAGE_KEY = 'ios-default-post-audience'

export function defaultPostAudience(): PostAudienceSelection {
  return { type: 'public', excludedUserIds: [], includedUserIds: [] }
}

export function readDefaultPostAudience(): PostAudienceSelection {
  if (typeof window === 'undefined') return defaultPostAudience()

  try {
    const raw = window.localStorage.getItem(DEFAULT_AUDIENCE_STORAGE_KEY)
    if (!raw) return defaultPostAudience()
    const parsed = JSON.parse(raw) as Partial<PostAudienceSelection>
    if (!parsed.type || !POST_AUDIENCE_TYPES.includes(parsed.type)) return defaultPostAudience()
    return {
      type: parsed.type,
      excludedUserIds: Array.isArray(parsed.excludedUserIds) ? parsed.excludedUserIds : [],
      includedUserIds: Array.isArray(parsed.includedUserIds) ? parsed.includedUserIds : [],
    }
  } catch {
    return defaultPostAudience()
  }
}

export function writeDefaultPostAudience(audience: PostAudienceSelection) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEFAULT_AUDIENCE_STORAGE_KEY, JSON.stringify(audience))
}

export function postAudienceLabel(audience: PostAudienceSelection): string {
  const option = POST_AUDIENCE_OPTIONS.find((entry) => entry.type === audience.type)
  if (!option) return 'Public'

  if (audience.type === 'exclude' && audience.excludedUserIds.length > 0) {
    return `Friends except ${audience.excludedUserIds.length}`
  }
  if (audience.type === 'include' && audience.includedUserIds.length > 0) {
    return `Specific · ${audience.includedUserIds.length}`
  }

  return option.label
}

export function postAudienceToPayload(audience: PostAudienceSelection): Record<string, unknown> {
  return {
    audience: {
      type: audience.type,
      ...(audience.excludedUserIds.length ? { excludedUserIds: audience.excludedUserIds } : {}),
      ...(audience.includedUserIds.length ? { includedUserIds: audience.includedUserIds } : {}),
    },
  }
}

export function audienceNeedsFriendSelection(type: PostAudienceType) {
  return type === 'exclude' || type === 'include'
}

export function audienceFriendIds(audience: PostAudienceSelection) {
  return audience.type === 'exclude' ? audience.excludedUserIds : audience.includedUserIds
}

export function parsePostAudienceFromPayload(
  payload: Record<string, unknown> | undefined,
): PostAudienceSelection {
  if (!payload || typeof payload.audience !== 'object' || payload.audience === null) {
    return defaultPostAudience()
  }

  const raw = payload.audience as Record<string, unknown>
  const type = raw.type
  if (typeof type !== 'string' || !POST_AUDIENCE_TYPES.includes(type as PostAudienceType)) {
    return defaultPostAudience()
  }

  return {
    type: type as PostAudienceType,
    excludedUserIds: Array.isArray(raw.excludedUserIds)
      ? raw.excludedUserIds.filter((id): id is string => typeof id === 'string')
      : [],
    includedUserIds: Array.isArray(raw.includedUserIds)
      ? raw.includedUserIds.filter((id): id is string => typeof id === 'string')
      : [],
  }
}

export function postAudienceIcon(type: PostAudienceType): LucideIcon {
  return POST_AUDIENCE_OPTIONS.find((entry) => entry.type === type)?.icon ?? Globe
}
