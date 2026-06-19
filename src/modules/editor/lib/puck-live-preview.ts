import type { Data } from '@measured/puck'
import {
  articleSoundDna,
  formatQuoteLines,
  type ArticleSessionTrack,
  type SoundDnaRow,
} from '@/modules/explore/lib/article-content'
import type { ArticleDto, ArticleType } from '@/modules/explore/types/explore.types'
import type { ArticleEditorMeta } from '@/modules/editor/types/article-editor.types'
import {
  extractCoverUrl,
  extractGalleryUrls,
  extractTitleFromPuck,
} from '@/modules/editor/lib/puck-to-html'

export interface PuckLiveBlockIds {
  title?: string
  hero?: string
  lead?: string
  quoteBody?: string
  sections: string[]
  heroAudio?: string
  sectionAudios: string[]
  images: string[]
}

export interface PuckLivePreviewModel {
  title: string
  category: string
  deck: string
  coverUrl: string
  introHtml: string
  introImage?: string
  breakImage?: string
  sectionImage?: string
  quote?: { text: string; attribution?: string }
  sections: Array<{ num: string; heading: string; html: string; blockId?: string }>
  sessionAudio?: string
  sessionLabel: string
  sessionTracks: ArticleSessionTrack[]
  showSoundDna: boolean
  soundDna: SoundDnaRow[]
  blockIds: PuckLiveBlockIds
}

const CATEGORY_LABELS: Record<string, string> = {
  feature: 'Feature',
  review: 'Review',
  interview: 'Interview',
  photo: 'Photo essay',
  single: 'Single',
  ep: 'EP',
  band_profile: 'Band profile',
}

const DEMO_SESSION_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

function demoImg(seed: string, w: number, h: number) {
  return `https://picsum.photos/seed/ios-template-${seed}/${w}/${h}`
}

function asHtml(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function readBlockId(props: Record<string, unknown>): string | undefined {
  const id = props.blockId
  return typeof id === 'string' && id.trim() ? id.trim() : undefined
}

export function parseSessionTracks(raw: unknown, fallbackTitle: string): ArticleSessionTrack[] {
  if (!Array.isArray(raw)) {
    return [
      {
        id: 'demo-1',
        title: fallbackTitle,
        artistName: 'IOS Editorial',
        durationSec: 372,
        streamUrl: DEMO_SESSION_AUDIO,
      },
    ]
  }

  const tracks = raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const track = item as Record<string, unknown>
      const streamUrl = asHtml(track.streamUrl)
      const title = asHtml(track.title)
      if (!streamUrl || !title) return null
      return {
        id: asHtml(track.id) || `demo-${index}`,
        title,
        artistName: asHtml(track.artistName) || 'IOS Editorial',
        durationSec: typeof track.durationSec === 'number' ? track.durationSec : 210,
        streamUrl,
      }
    })
    .filter((track): track is ArticleSessionTrack => track !== null)

  return tracks.length > 0
    ? tracks
    : [
        {
          id: 'demo-1',
          title: fallbackTitle,
          artistName: 'IOS Editorial',
          durationSec: 372,
          streamUrl: DEMO_SESSION_AUDIO,
        },
      ]
}

function parseQuoteFromHtml(html: string): {
  quote?: { text: string; attribution?: string }
  rest: string
} {
  if (typeof DOMParser === 'undefined') {
    return { rest: html }
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const blockquote = doc.body.querySelector('blockquote')
  if (!blockquote) return { rest: html }

  const cite = blockquote.querySelector('cite')?.textContent?.trim()
  const clone = blockquote.cloneNode(true) as HTMLElement
  clone.querySelector('cite')?.remove()
  const text = clone.textContent?.trim() ?? ''
  blockquote.remove()

  return {
    quote: text ? { text, attribution: cite } : undefined,
    rest: doc.body.innerHTML.trim(),
  }
}

function resolveDeck(
  deck: string | undefined,
  leadHtml: string,
  meta: ArticleEditorMeta,
  description?: string,
): string {
  if (deck?.trim()) return deck.trim()
  if (meta.seoDescription?.trim()) return meta.seoDescription.trim()
  if (description?.trim()) return description.trim()

  const leadText = stripHtml(leadHtml)
  if (!leadText) return 'Editorial feature from Institute of Sound.'
  return leadText.length > 180 ? `${leadText.slice(0, 177)}…` : leadText
}

function resolveSessionFromMeta(meta: ArticleEditorMeta, category: string, title: string) {
  return {
    sessionAudio: meta.sessionAudioUrl?.trim() || DEMO_SESSION_AUDIO,
    sessionLabel:
      meta.sessionLabel?.trim() ||
      (category === 'review' ? 'Listen to the album' : 'Listen to the session'),
    sessionTracks: parseSessionTracks(undefined, title),
  }
}

function buildSoundDnaStub(
  title: string,
  slug: string,
  type: ArticleType | undefined,
  excerpt: string,
): ArticleDto {
  return {
    id: 'draft',
    title,
    slug: slug || 'draft',
    type,
    excerpt,
    bodyHtml: '',
    status: 'draft',
    isCoverStory: false,
  }
}

export interface ResolvePuckLivePreviewInput {
  puck: Data
  category: string
  meta: ArticleEditorMeta
  excerpt?: string
  slug?: string
  titleFallback?: string
  description?: string
  seedId?: string
}

export function resolvePuckLivePreview(input: ResolvePuckLivePreviewInput): PuckLivePreviewModel {
  const {
    puck,
    category,
    meta,
    excerpt,
    slug = 'draft',
    titleFallback = 'Untitled',
    description,
    seedId = slug,
  } = input

  const gallery = extractGalleryUrls(puck)
  const heroUrl = extractCoverUrl(puck)
  const title = extractTitleFromPuck(puck) || titleFallback
  const categoryKey = category === 'interview' ? 'interview' : meta.type || category
  const categoryLabel = CATEGORY_LABELS[categoryKey] ?? CATEGORY_LABELS[category] ?? category

  let leadHtml = ''
  let bodyHtml = ''
  const sections: PuckLivePreviewModel['sections'] = []
  let quote: PuckLivePreviewModel['quote']
  let sessionAudio: string | undefined
  let sessionLabel = 'Listen to the session'
  let sessionTracks: ArticleSessionTrack[] = []

  const blockIds: PuckLiveBlockIds = {
    sections: [],
    sectionAudios: [],
    images: [],
  }

  let audioIndex = 0

  for (const block of puck.content) {
    const props = block.props as Record<string, unknown>
    const id = readBlockId(props)

    if (block.type === 'ArticleTitle' && id) blockIds.title = id

    if (block.type === 'ArticleHero' && id) blockIds.hero = id

    if (block.type === 'ArticleImage' && id) {
      blockIds.images.push(id)
      if (!blockIds.hero) blockIds.hero = id
    }

    if (block.type === 'ArticleLead') {
      if (id) blockIds.lead = id
      leadHtml += asHtml(props.body)
      continue
    }

    if (block.type === 'ArticleBody') {
      if (id) blockIds.quoteBody = id
      const html = asHtml(props.body)
      const parsed = parseQuoteFromHtml(html)
      if (parsed.quote && !quote) quote = parsed.quote
      if (parsed.rest) bodyHtml += parsed.rest
      continue
    }

    if (block.type === 'ArticleAudio') {
      const audioUrl = asHtml(props.audioUrl)
      const label = asHtml(props.sessionLabel)
      const tracks = parseSessionTracks(props.sessionTracks, asHtml(props.trackTitle) || title)

      if (audioIndex === 0 && id) blockIds.heroAudio = id
      else if (id) blockIds.sectionAudios.push(id)
      audioIndex += 1

      if (!sessionAudio && audioUrl) sessionAudio = audioUrl
      if (label) sessionLabel = label
      if (sessionTracks.length === 0) sessionTracks = tracks
      continue
    }

    if (block.type === 'ArticleSection') {
      if (id) blockIds.sections.push(id)
      sections.push({
        num: String(sections.length + 1).padStart(2, '0'),
        heading: asHtml(props.heading) || `Section ${sections.length + 1}`,
        html: asHtml(props.body) || '<p>Section body copy.</p>',
        blockId: id,
      })
    }
  }

  const sessionMeta = resolveSessionFromMeta(meta, categoryKey, title)
  sessionAudio = sessionAudio ?? sessionMeta.sessionAudio
  sessionLabel = sessionLabel || sessionMeta.sessionLabel
  if (sessionTracks.length === 0) sessionTracks = sessionMeta.sessionTracks

  const coverUrl = heroUrl ?? gallery[0] ?? demoImg(seedId, 1400, 900)
  const inlineImages = gallery.filter((url) => url !== coverUrl)
  const introImage = inlineImages[0]
  const breakImage = inlineImages[1] ?? inlineImages[0]
  const sectionImage = inlineImages[2] ?? inlineImages[1]

  const isFeatureLike = categoryKey === 'feature' || category === 'feature' || category === 'interview'
  if (!quote && isFeatureLike) {
    quote = {
      text: 'WE ARE NOT CHASING A SCENE. WE ARE CHASING A FREQUENCY.',
      attribution: 'VOICE NOTE FROM THE VOID ECHO SESSION',
    }
  }

  const introHtml =
    leadHtml ||
    '<p>The first thing you notice is not the volume — it is the patience. The room waits. The rigs hum.</p>'

  if (sections.length === 0 && bodyHtml) {
    sections.push({
      num: '01',
      heading: 'Sound DNA',
      html: bodyHtml,
    })
  }

  if (sections.length === 1) {
    sections.push({
      num: '02',
      heading: 'Session One',
      html: '<p>The room does not ask for permission. Every take carries the weight of a city that learned to listen after midnight.</p>',
    })
  }

  const showSoundDna =
    categoryKey === 'feature' ||
    categoryKey === 'review' ||
    category === 'feature' ||
    category === 'review'

  const articleType = (meta.type ?? categoryKey) as ArticleType | undefined

  return {
    title,
    category: categoryLabel,
    deck: resolveDeck(excerpt, leadHtml, meta, description),
    coverUrl,
    introHtml,
    introImage,
    breakImage,
    sectionImage,
    quote,
    sections: sections.slice(0, 2),
    sessionAudio,
    sessionLabel,
    sessionTracks,
    showSoundDna,
    soundDna: articleSoundDna(buildSoundDnaStub(title, slug, articleType, excerpt ?? '')),
    blockIds,
  }
}

export function formatLiveQuoteLines(text: string): string[] {
  return formatQuoteLines(text)
}
