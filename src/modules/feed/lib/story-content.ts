import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import { storyGradientClass, storyTextStyleClass } from '@/modules/feed/lib/story-theme'
import { isStoryItem } from '@/modules/feed/lib/story-utils'

const FALLBACK_STORY_GRADIENTS = [
  'from-violet-600 to-fuchsia-500',
  'from-sky-600 to-cyan-400',
  'from-orange-500 to-amber-400',
  'from-emerald-600 to-lime-400',
  'from-rose-600 to-pink-500',
]

export type StoryBackground =
  | { kind: 'image'; value: string }
  | { kind: 'gradient'; value: string }
  | { kind: 'fallback'; value: string }

export type StoryGroup = {
  author: FeedItemDto['author']
  stories: FeedItemDto[]
}

export function getStoryItems(items: FeedItemDto[]) {
  return items.filter(isStoryItem)
}

export function groupStoriesByAuthor(items: FeedItemDto[]): StoryGroup[] {
  const groups = new Map<string, StoryGroup>()

  for (const item of getStoryItems(items)) {
    const existing = groups.get(item.author.id)
    if (existing) {
      existing.stories.push(item)
      continue
    }
    groups.set(item.author.id, { author: item.author, stories: [item] })
  }

  return Array.from(groups.values())
}

export function findStoryLocation(stories: FeedItemDto[], storyId: string | null) {
  const groups = groupStoriesByAuthor(stories)
  if (!storyId) return { groups, groupIndex: 0, storyIndex: 0 }

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const storyIndex = groups[groupIndex]!.stories.findIndex((story) => story.id === storyId)
    if (storyIndex >= 0) return { groups, groupIndex, storyIndex }
  }

  return { groups, groupIndex: 0, storyIndex: 0 }
}

export function storyBackground(item: FeedItemDto, index = 0): StoryBackground {
  const image =
    payloadString(item.payload, 'imageUrl') ??
    payloadString(item.payload, 'coverUrl') ??
    payloadString(item.payload, 'posterUrl')

  if (image) return { kind: 'image', value: image }

  const gradientId = payloadString(item.payload, 'storyGradient')
  if (gradientId) return { kind: 'gradient', value: storyGradientClass(gradientId) }

  return { kind: 'fallback', value: FALLBACK_STORY_GRADIENTS[index % FALLBACK_STORY_GRADIENTS.length]! }
}

export function storyPreviewText(item: FeedItemDto) {
  if (item.type !== 'text') return undefined
  return payloadString(item.payload, 'text') ?? item.body ?? undefined
}

export function storyTextStyle(item: FeedItemDto) {
  return storyTextStyleClass(payloadString(item.payload, 'storyTextStyle'))
}

export function storyVideoUrl(item: FeedItemDto) {
  return payloadString(item.payload, 'videoUrl')
}

export function storyMentions(item: FeedItemDto): string[] {
  const raw = item.payload?.mentions
  if (Array.isArray(raw)) {
    return raw
      .map((entry) => {
        if (typeof entry === 'string') return entry.replace(/^@/, '')
        if (entry && typeof entry === 'object' && 'username' in entry) {
          const username = (entry as { username?: unknown }).username
          return typeof username === 'string' ? username.replace(/^@/, '') : null
        }
        return null
      })
      .filter((entry): entry is string => Boolean(entry))
  }

  const text = [storyPreviewText(item), item.body, item.title].filter(Boolean).join(' ')
  const matches = text.match(/@([a-zA-Z0-9_.]+)/g) ?? []
  return [...new Set(matches.map((mention) => mention.slice(1)))]
}
