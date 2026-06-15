import { catalogSlugForEmoji } from '@/modules/feed/lib/emoji-catalog'

const NOTO_ANIMATED_BASE = 'https://fonts.gstatic.com/s/e/notoemoji/latest'
const NOTO_ANIMATED_SIZE = 512
const RECENT_STORAGE_KEY = 'ios-feed-recent-emojis'
const MAX_RECENT = 24

const EMOJI_PATTERN = /\p{Extended_Pictographic}(\uFE0F|\u200D\p{Extended_Pictographic})*/gu

export function animatedEmojiUrl(slug: string, size = NOTO_ANIMATED_SIZE): string {
  return `${NOTO_ANIMATED_BASE}/${slug}/${size}.webp`
}

export function staticEmojiUrl(slug: string, size = NOTO_ANIMATED_SIZE): string {
  return `${NOTO_ANIMATED_BASE}/${slug}/${size}.png`
}

export function graphemeSegments(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    return [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(text)].map(
      (part) => part.segment,
    )
  }
  return [...text]
}

export function isEmojiGrapheme(value: string): boolean {
  EMOJI_PATTERN.lastIndex = 0
  return EMOJI_PATTERN.test(value)
}

export function emojiToNotoSlug(grapheme: string): string | undefined {
  const fromCatalog = catalogSlugForEmoji(grapheme)
  if (fromCatalog) return fromCatalog

  const parts: string[] = []
  for (let i = 0; i < grapheme.length; ) {
    const codePoint = grapheme.codePointAt(i)
    if (codePoint === undefined) break
    parts.push(codePoint.toString(16))
    i += codePoint > 0xffff ? 2 : 1
  }

  if (parts.length === 0) return undefined
  return parts.join('_')
}

export function splitTextWithEmojis(text: string): Array<{ type: 'text'; value: string } | { type: 'emoji'; value: string; slug: string }> {
  const segments = graphemeSegments(text)
  const result: Array<{ type: 'text'; value: string } | { type: 'emoji'; value: string; slug: string }> = []

  for (const segment of segments) {
    if (isEmojiGrapheme(segment)) {
      const slug = emojiToNotoSlug(segment)
      if (slug) {
        result.push({ type: 'emoji', value: segment, slug })
        continue
      }
    }

    const last = result[result.length - 1]
    if (last?.type === 'text') {
      last.value += segment
    } else {
      result.push({ type: 'text', value: segment })
    }
  }

  return result
}

export function loadRecentEmojis(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function saveRecentEmoji(emoji: string) {
  if (typeof window === 'undefined') return
  const current = loadRecentEmojis().filter((item) => item !== emoji)
  const next = [emoji, ...current].slice(0, MAX_RECENT)
  window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next))
}

export function insertAtCursor(
  value: string,
  insert: string,
  selectionStart: number,
  selectionEnd: number,
): { nextValue: string; cursor: number } {
  const nextValue = value.slice(0, selectionStart) + insert + value.slice(selectionEnd)
  const cursor = selectionStart + insert.length
  return { nextValue, cursor }
}
