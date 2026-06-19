import type { ArticleDto, ExplorePayload } from '@/modules/explore/types/explore.types'

export interface ParsedArticleContent {
  leadHtml: string
  bodyHtml: string
  quotes: Array<{ text: string; attribution?: string }>
  sections: Array<{ heading: string; html: string }>
}

const INTRO_PARAGRAPH_COUNT = 2
const INTRO_MIN_CHARS = 220

function introDemoParagraphs(article: ArticleDto): [string, string] {
  const bySlug: Record<string, [string, string]> = {
    'cathedral-of-noise': [
      'The first thing you notice is not the volume — it is the patience. The room waits. The rigs hum. Then the sub arrives like weather rolling in off a highway, slow enough that you feel it in your chest before your ears register the hit.',
      "The rusted beams above the floor don't just hold the roof — they hold the echo. Every take bounces back with a little more grit, a little more smoke, until the warehouse stops being a venue and starts being an instrument.",
    ],
    'void-convo-sessions': [
      'The first thing you notice is not the volume — it is the patience. The room waits. The rigs hum. Then the voice arrives stripped of everything except intent, close enough that you feel each pause before the next line lands.',
      "The rusted beams above the floor don't just hold the roof — they hold the echo. Every take bounces back with a little more grit, a little more smoke, until the basement stops being a stage and starts being a confession.",
    ],
  }

  if (bySlug[article.slug]) return bySlug[article.slug]!

  const city =
    article.slug.includes('bangalore') ? 'Bangalore' : article.slug.includes('delhi') ? 'Delhi' : 'the underground'

  return [
    `The underground does not ask permission. Inside ${city}'s after-hours rooms, ${article.title} builds slowly — brick by brick, take by take — until distortion stops being an effect and starts feeling like architecture.`,
    article.excerpt ??
      'The rusted beams above the floor do not just hold the roof — they hold the echo. Every pass adds grit, smoke, and weight until the room itself becomes part of the recording.',
  ]
}

function paragraphsFromHtml(html: string): string[] {
  const doc = parseHtml(html)
  if (!doc) return []
  return Array.from(doc.body.querySelectorAll('p'))
    .map((paragraph) => paragraph.textContent?.replace(/\s+/g, ' ').trim() ?? '')
    .filter(Boolean)
}

function wrapParagraphs(paragraphs: string[]): string {
  return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')
}

export function buildArticleIntroHtml(article: ArticleDto, leadHtml: string): string {
  const demo = introDemoParagraphs(article)
  const existing = paragraphsFromHtml(leadHtml)

  if (existing.length === 0) {
    return wrapParagraphs(demo)
  }

  if (existing.join('').length < INTRO_MIN_CHARS) {
    return wrapParagraphs(demo)
  }

  if (existing.length === 1) {
    const parts = existing[0]!
      .split(/(?<=[.!?])\s+/)
      .map((part) => part.trim())
      .filter(Boolean)

    if (parts.length >= 2 && existing[0]!.length >= INTRO_MIN_CHARS) {
      return wrapParagraphs([parts[0]!, parts.slice(1).join(' ')])
    }

    return wrapParagraphs([existing[0]!, demo[1]])
  }

  return wrapParagraphs(existing.slice(0, INTRO_PARAGRAPH_COUNT))
}

function parseHtml(html: string): Document | null {
  if (typeof DOMParser === 'undefined') return null
  return new DOMParser().parseFromString(html, 'text/html')
}

export function parseArticleContent(bodyHtml: string): ParsedArticleContent {
  const doc = parseHtml(bodyHtml)
  if (!doc) {
    return { leadHtml: bodyHtml, bodyHtml: '', quotes: [], sections: [] }
  }

  const quotes: ParsedArticleContent['quotes'] = []
  doc.querySelectorAll('blockquote').forEach((el) => {
    const cite = el.querySelector('cite')?.textContent?.trim()
    const text = el.cloneNode(true) as HTMLElement
    text.querySelector('cite')?.remove()
    const quoteText = text.textContent?.trim()
    if (quoteText) quotes.push({ text: quoteText, attribution: cite })
    el.remove()
  })

  const sections: ParsedArticleContent['sections'] = []
  doc.querySelectorAll('section[data-article-section]').forEach((el) => {
    const heading = el.querySelector('h2, h3')?.textContent?.trim() ?? ''
    sections.push({ heading, html: el.innerHTML })
    el.remove()
  })

  const paragraphs = Array.from(doc.body.querySelectorAll('p'))
  const leadParagraphs = paragraphs.slice(0, INTRO_PARAGRAPH_COUNT)
  const leadHtml = leadParagraphs.map((paragraph) => paragraph.outerHTML).join('')
  leadParagraphs.forEach((paragraph) => paragraph.remove())

  return {
    leadHtml,
    bodyHtml: doc.body.innerHTML.trim(),
    quotes,
    sections,
  }
}

export interface SoundDnaRow {
  label: string
  value: string
}

export function articleSoundDna(article: ArticleDto): SoundDnaRow[] {
  const seed = article.slug.length
  const genres = ['Drone / Doom', 'Industrial / Ritual', 'Dark Techno', 'Noise / Ambient', 'EBM / Post-Punk']
  const moods = ['Industrial / Ritual', 'Hypnotic / Heavy', 'Cinematic / Raw', 'Nocturnal / Dense']
  const bpms = [72, 82, 94, 108, 128]
  const keys = ['D minor', 'F# minor', 'A minor', 'C minor', 'E minor']

  return [
    { label: 'Genre', value: genres[seed % genres.length]! },
    { label: 'BPM', value: String(bpms[seed % bpms.length]!) },
    { label: 'Mood', value: moods[seed % moods.length]! },
    { label: 'Key', value: keys[seed % keys.length]! },
    { label: 'Session', value: article.type === 'review' ? 'Live capture' : 'Warehouse mix' },
    { label: 'Format', value: article.type === 'single' ? 'Single focus' : 'Long-form feature' },
  ]
}

export function articleAuthorName(slug: string): string {
  const authors = ['Anant Naik', 'Aria Editor', 'Rhea Das', 'Kiran Mehta']
  return authors[slug.charCodeAt(0)! % authors.length]!
}

export function articleAuthorAvatar(slug: string): string {
  return `https://picsum.photos/seed/${slug}-author/80/80`
}

const MAX_QUOTE_LINE_LENGTH = 38

function wrapLongQuoteLine(line: string, maxLength = MAX_QUOTE_LINE_LENGTH): string[] {
  const trimmed = line.trim()
  if (!trimmed) return []
  if (trimmed.length <= maxLength) return [trimmed]

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (!words.length) return [trimmed.slice(0, maxLength)]

  const result: string[] = []
  let bucket: string[] = []

  const flush = () => {
    if (!bucket.length) return
    result.push(bucket.join(' '))
    bucket = []
  }

  for (const word of words) {
    if (word.length > maxLength) {
      flush()
      for (let index = 0; index < word.length; index += maxLength) {
        result.push(word.slice(index, index + maxLength))
      }
      continue
    }

    const candidate = [...bucket, word].join(' ')
    if (candidate.length > maxLength && bucket.length > 0) {
      flush()
      bucket = [word]
    } else {
      bucket.push(word)
    }
  }

  flush()
  return result.length ? result : [trimmed]
}

function seedQuoteLines(normalized: string): string[] {
  if (normalized.includes(' / ')) {
    return normalized.split(' / ').map((line) => line.trim()).filter(Boolean)
  }

  const sentenceParts = normalized
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (sentenceParts.length >= 2) return sentenceParts

  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length <= 5) return [normalized]

  const midpoint = Math.ceil(words.length / 2)
  return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')]
}

export function formatQuoteLines(text: string): string[] {
  const raw = text.replace(/\r\n/g, '\n').trim()
  if (!raw) return []

  const segments = raw.includes('\n')
    ? raw.split('\n').map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean)
    : [raw.replace(/\s+/g, ' ').trim()]

  return segments
    .flatMap((segment) => seedQuoteLines(segment))
    .flatMap((line) => wrapLongQuoteLine(line.toUpperCase()))
}

export interface ArticleSessionTrack {
  id: string
  title: string
  artistName: string
  durationSec: number
  streamUrl: string
}

function parsePuckSessionTracks(puckData?: Record<string, unknown>): ArticleSessionTrack[] | null {
  const raw = puckData?.sessionTracks
  if (!Array.isArray(raw)) return null

  const tracks = raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const track = item as Record<string, unknown>
      const streamUrl = typeof track.streamUrl === 'string' ? track.streamUrl.trim() : ''
      const title = typeof track.title === 'string' ? track.title.trim() : ''
      if (!streamUrl || !title) return null

      return {
        id: typeof track.id === 'string' ? track.id : `puck-${index}`,
        title,
        artistName:
          typeof track.artistName === 'string' && track.artistName.trim()
            ? track.artistName.trim()
            : 'Unknown artist',
        durationSec: typeof track.durationSec === 'number' ? track.durationSec : 210,
        streamUrl,
      }
    })
    .filter((track): track is ArticleSessionTrack => track !== null)

  return tracks.length > 0 ? tracks : null
}

function findMatchingPlaylist(article: ArticleDto, explore: ExplorePayload) {
  const all = [
    ...(explore.playlists.featured ? [explore.playlists.featured] : []),
    ...explore.playlists.items,
  ]

  const exact = all.find((playlist) => playlist.slug === article.slug)
  if (exact) return exact

  const articleTokens = new Set([
    ...slugToken(article.slug),
    ...slugToken(article.title),
  ])

  let best: { playlist: (typeof all)[number]; score: number } | null = null

  for (const playlist of all) {
    const playlistTokens = slugToken(`${playlist.slug} ${playlist.title}`)
    let score = 0
    for (const token of playlistTokens) {
      if (token.length > 3 && articleTokens.has(token)) score += 2
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { playlist, score }
    }
  }

  return best?.playlist ?? explore.playlists.featured ?? explore.playlists.items[0] ?? null
}

function playlistToSessionTracks(playlist: { slug: string; tracks: Array<{ title: string; artistName: string; durationSec?: number; streamUrl?: string }> }): ArticleSessionTrack[] {
  return playlist.tracks
    .filter((track) => track.streamUrl)
    .map((track, index) => ({
      id: `${playlist.slug}-${index}`,
      title: track.title,
      artistName: track.artistName?.trim() || 'Unknown artist',
      durationSec: track.durationSec ?? 210,
      streamUrl: track.streamUrl!,
    }))
}

function releasesToSessionTracks(
  releases: ExplorePayload['releases'],
  fallbackStream?: string,
  fallbackTitle?: string,
  fallbackArtist?: string,
): ArticleSessionTrack[] {
  const playable = releases.filter((release) => release.streamUrl)

  if (playable.length === 0) {
    if (!fallbackStream) return []
    return [
      {
        id: 'session-0',
        title: fallbackTitle ?? 'Session',
        artistName: fallbackArtist ?? 'IOS',
        durationSec: 372,
        streamUrl: fallbackStream,
      },
    ]
  }

  return playable.slice(0, 8).map((release, index) => ({
    id: release.id || `release-${index}`,
    title: release.title,
    artistName: release.artistName?.trim() || 'Unknown artist',
    durationSec: 180 + index * 22 + (release.title.length % 60),
    streamUrl: release.streamUrl!,
  }))
}

export function resolveArticleSessionTracks(
  article: ArticleDto,
  explore?: ExplorePayload | null,
): ArticleSessionTrack[] {
  const fromPuck = parsePuckSessionTracks(article.puckData)
  if (fromPuck) return fromPuck

  const defaultStream = resolveArticleSessionAudio(article, explore)
  const defaultArtist = articleAuthorName(article.slug)

  if (explore) {
    const playlist = findMatchingPlaylist(article, explore)
    if (playlist) {
      const fromPlaylist = playlistToSessionTracks(playlist)
      if (fromPlaylist.length > 0) return fromPlaylist
    }

    const fromReleases = releasesToSessionTracks(
      explore.releases,
      defaultStream,
      article.title,
      defaultArtist,
    )
    if (fromReleases.length > 0) return fromReleases
  }

  if (defaultStream) {
    return [
      {
        id: 'session-0',
        title: article.title,
        artistName: defaultArtist,
        durationSec: 372,
        streamUrl: defaultStream,
      },
    ]
  }

  return []
}

export function articleSessionAudio(article: ArticleDto): string | undefined {
  const fromPuck = article.puckData?.sessionAudioUrl
  if (typeof fromPuck === 'string' && fromPuck.trim()) return fromPuck.trim()
  return undefined
}

export function resolveArticleSessionAudio(
  article: ArticleDto,
  explore?: ExplorePayload | null,
): string | undefined {
  const fromArticle = articleSessionAudio(article)
  if (fromArticle) return fromArticle
  if (!explore) return undefined

  const articleTokens = new Set([
    ...slugToken(article.slug),
    ...slugToken(article.title),
  ])

  const releaseMatch = explore.releases.find((release) => {
    if (!release.streamUrl) return false
    const releaseTokens = slugToken(release.title)
    return releaseTokens.some((token) => articleTokens.has(token) && token.length > 3)
  })
  if (releaseMatch?.streamUrl) return releaseMatch.streamUrl

  const releaseStream = explore.releases.find((release) => release.streamUrl)?.streamUrl
  if (releaseStream) return releaseStream

  const playlistStream =
    explore.playlists.featured?.tracks.find((track) => track.streamUrl)?.streamUrl ??
    explore.playlists.items
      .flatMap((playlist) => playlist.tracks)
      .find((track) => track.streamUrl)?.streamUrl

  return playlistStream
}

function slugToken(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

export function articleSessionLabel(article: ArticleDto): string {
  const fromPuck = article.puckData?.sessionLabel
  if (typeof fromPuck === 'string' && fromPuck.trim()) return fromPuck.trim()
  return 'Listen to the session'
}
