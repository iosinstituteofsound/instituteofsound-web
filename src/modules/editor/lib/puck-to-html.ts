import type { Data } from '@measured/puck'
import { parseExternalAudioLink } from '@/modules/editor/lib/external-audio-link'
import { parseExternalVideoLink } from '@/modules/editor/lib/external-video-link'

function asHtml(value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed || trimmed === '<p></p>' || trimmed === '<p><br></p>') return ''
  return trimmed
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function extractGalleryUrls(puck: Data): string[] {
  const urls: string[] = []
  for (const block of puck.content) {
    if (block.type === 'ArticleImage' || block.type === 'ArticleHero') {
      const imageUrl = block.props.imageUrl
      if (typeof imageUrl === 'string' && imageUrl.trim()) {
        urls.push(imageUrl.trim())
      }
    }
  }
  return [...new Set(urls)]
}

export function findPuckBlockById(puck: Data, blockId: string): Data['content'][number] | undefined {
  return puck.content.find(
    (block) => String((block.props as Record<string, unknown>).blockId) === blockId,
  )
}

export function readImageBlockUrl(block: Data['content'][number] | undefined): string | undefined {
  if (!block || (block.type !== 'ArticleHero' && block.type !== 'ArticleImage')) return undefined
  const imageUrl = (block.props as Record<string, unknown>).imageUrl
  return typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : undefined
}

/** Cover image for the composed hero — prefers the resolved hero block id. */
export function extractHeroImageUrl(puck: Data, heroBlockId?: string): string | undefined {
  if (heroBlockId) {
    const fromHeroBlock = readImageBlockUrl(findPuckBlockById(puck, heroBlockId))
    if (fromHeroBlock) return fromHeroBlock
  }
  return extractCoverUrl(puck)
}

export function extractCoverUrl(puck: Data): string | undefined {
  const hero = puck.content.find((block) => block.type === 'ArticleHero')
  const imageUrl = hero?.props.imageUrl
  if (typeof imageUrl === 'string' && imageUrl.trim()) return imageUrl.trim()

  const firstImage = puck.content.find((block) => block.type === 'ArticleImage')
  const fallback = firstImage?.props.imageUrl
  if (typeof fallback === 'string' && fallback.trim()) return fallback.trim()

  for (const block of puck.content) {
    if (block.type !== 'ArticleVideo') continue
    const posterUrl = block.props.posterUrl
    if (typeof posterUrl === 'string' && posterUrl.trim()) return posterUrl.trim()
  }

  const rootProps = puck.root?.props as Record<string, unknown> | undefined
  const backgroundUrl = rootProps?.canvasBackgroundUrl
  if (typeof backgroundUrl === 'string' && backgroundUrl.trim()) return backgroundUrl.trim()

  return undefined
}

export function extractTitleFromPuck(puck: Data): string {
  const titleBlock = puck.content.find((block) => block.type === 'ArticleTitle')
  const text = titleBlock?.props.text
  return typeof text === 'string' ? text.trim() : ''
}

export function puckToBodyHtml(puck: Data): string {
  const parts: string[] = []

  for (const block of puck.content) {
    switch (block.type) {
      case 'ArticleTitle':
        break
      case 'ArticleLead': {
        const html = asHtml(block.props.body)
        if (html) parts.push(html)
        break
      }
      case 'ArticleBody': {
        const html = asHtml(block.props.body)
        if (html) parts.push(html)
        break
      }
      case 'ArticleQuote': {
        const text = typeof block.props.text === 'string' ? block.props.text.trim() : ''
        const attribution =
          typeof block.props.attribution === 'string' ? block.props.attribution.trim() : ''
        if (!text && !attribution) break
        parts.push(
          `<blockquote><p>${escapeHtml(text)}</p>${attribution ? `<cite>${escapeHtml(attribution)}</cite>` : ''}</blockquote>`,
        )
        break
      }
      case 'ArticleSection': {
        const heading = typeof block.props.heading === 'string' ? block.props.heading.trim() : ''
        const body = asHtml(block.props.body)
        if (!heading && !body) break
        const headingHtml = heading ? `<h2>${escapeHtml(heading)}</h2>` : ''
        parts.push(`<section data-article-section>${headingHtml}${body}</section>`)
        break
      }
      case 'ArticleDivider':
        parts.push('<hr />')
        break
      case 'ArticleAudio': {
        const audioUrl = typeof block.props.audioUrl === 'string' ? block.props.audioUrl.trim() : ''
        const trackTitle =
          typeof block.props.trackTitle === 'string' ? block.props.trackTitle.trim() : 'Session'
        const sessionLabel =
          typeof block.props.sessionLabel === 'string'
            ? block.props.sessionLabel.trim()
            : 'Listen to the session'
        if (!audioUrl) break
        const parsed = parseExternalAudioLink(audioUrl)
        if (parsed.embedUrl) {
          parts.push(
            `<figure data-article-audio data-provider="${escapeHtml(parsed.provider)}"><figcaption>${escapeHtml(sessionLabel)} — ${escapeHtml(trackTitle)}</figcaption><iframe src="${escapeHtml(parsed.embedUrl)}" title="${escapeHtml(trackTitle)}" allow="autoplay; encrypted-media; fullscreen" loading="lazy"></iframe><p><a href="${escapeHtml(parsed.openUrl)}" target="_blank" rel="noopener noreferrer">Open on ${escapeHtml(parsed.providerLabel)}</a></p></figure>`,
          )
        } else {
          const src = parsed.streamUrl ?? audioUrl
          parts.push(
            `<figure data-article-audio><figcaption>${escapeHtml(sessionLabel)}</figcaption><audio controls src="${escapeHtml(src)}" title="${escapeHtml(trackTitle)}"></audio></figure>`,
          )
        }
        break
      }
      case 'ArticleVideo': {
        const videoUrl = typeof block.props.videoUrl === 'string' ? block.props.videoUrl.trim() : ''
        const videoTitle =
          typeof block.props.videoTitle === 'string' ? block.props.videoTitle.trim() : 'Session video'
        const caption =
          typeof block.props.caption === 'string' ? block.props.caption.trim() : 'Watch the session'
        const posterUrl =
          typeof block.props.posterUrl === 'string' ? block.props.posterUrl.trim() : ''
        if (!videoUrl) break
        const parsed = parseExternalVideoLink(videoUrl)
        if (parsed.embedUrl) {
          parts.push(
            `<figure data-article-video data-provider="${escapeHtml(parsed.provider)}"><figcaption>${escapeHtml(caption)} — ${escapeHtml(videoTitle)}</figcaption><iframe src="${escapeHtml(parsed.embedUrl)}" title="${escapeHtml(videoTitle)}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe><p><a href="${escapeHtml(parsed.openUrl)}" target="_blank" rel="noopener noreferrer">Open on ${escapeHtml(parsed.providerLabel)}</a></p></figure>`,
          )
        } else {
          const src = parsed.streamUrl ?? videoUrl
          const posterAttr = posterUrl || parsed.posterUrl ? ` poster="${escapeHtml(posterUrl || parsed.posterUrl || '')}"` : ''
          parts.push(
            `<figure data-article-video><figcaption>${escapeHtml(caption)}</figcaption><video controls src="${escapeHtml(src)}" title="${escapeHtml(videoTitle)}"${posterAttr}></video></figure>`,
          )
        }
        break
      }
      default:
        break
    }
  }

  return parts.join('\n')
}

export function countWordsFromHtml(html: string): number {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return 0
  return text.split(' ').filter(Boolean).length
}

export function estimateReadMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200))
}
