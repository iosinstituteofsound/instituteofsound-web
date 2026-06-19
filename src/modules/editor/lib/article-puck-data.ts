import type { Data } from '@measured/puck'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import {
  ARTICLE_PUCK_VERSION,
  DEFAULT_ARTICLE_META,
  type ArticleEditorMeta,
  type ArticlePuckDocument,
} from '@/modules/editor/types/article-editor.types'
import { ensureCanvasLayouts } from '@/modules/editor/lib/canvas-block-utils'

function isPuckData(data: Record<string, unknown>): data is { puck: Data; meta?: ArticleEditorMeta } {
  return Boolean(data.puck && typeof data.puck === 'object' && Array.isArray((data.puck as Data).content))
}

export function parseArticleEditorMeta(raw: Record<string, unknown> | undefined): ArticleEditorMeta {
  return parseMeta(raw)
}

function parseMeta(raw: Record<string, unknown> | undefined): ArticleEditorMeta {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_ARTICLE_META }

  const meta = raw as Partial<ArticleEditorMeta>
  return {
    type: meta.type ?? DEFAULT_ARTICLE_META.type,
    tags: Array.isArray(meta.tags) ? meta.tags.filter((t): t is string => typeof t === 'string') : [],
    isCoverStory: Boolean(meta.isCoverStory),
    wirePick: Boolean(meta.wirePick),
    homepageHero: Boolean(meta.homepageHero),
    trending: Boolean(meta.trending),
    seoTitle: typeof meta.seoTitle === 'string' ? meta.seoTitle : '',
    seoDescription: typeof meta.seoDescription === 'string' ? meta.seoDescription : '',
    sessionAudioUrl: typeof meta.sessionAudioUrl === 'string' ? meta.sessionAudioUrl : '',
    sessionLabel:
      typeof meta.sessionLabel === 'string' && meta.sessionLabel.trim()
        ? meta.sessionLabel
        : DEFAULT_ARTICLE_META.sessionLabel,
  }
}

export function createEmptyPuckData(): ArticlePuckDocument {
  return {
    version: ARTICLE_PUCK_VERSION,
    puck: {
      root: { props: {} },
      content: [],
    },
    meta: { ...DEFAULT_ARTICLE_META },
  }
}

function bodyHtmlToBlocks(bodyHtml: string): Data['content'] {
  const blocks: Data['content'] = []
  const trimmed = bodyHtml.trim()
  if (!trimmed) {
    blocks.push({ type: 'ArticleBody', props: { body: '<p></p>' } })
    return blocks
  }

  const doc = typeof DOMParser !== 'undefined' ? new DOMParser().parseFromString(trimmed, 'text/html') : null
  if (!doc) {
    blocks.push({ type: 'ArticleBody', props: { body: trimmed } })
    return blocks
  }

  const children = Array.from(doc.body.childNodes)
  let buffer: string[] = []

  const flushParagraphs = () => {
    if (!buffer.length) return
    blocks.push({ type: 'ArticleBody', props: { body: buffer.join('') } })
    buffer = []
  }

  for (const node of children) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue
    const el = node as HTMLElement

    if (el.tagName === 'BLOCKQUOTE') {
      flushParagraphs()
      const cite = el.querySelector('cite')?.textContent?.trim() ?? ''
      const text = (el.cloneNode(true) as HTMLElement)
      text.querySelector('cite')?.remove()
      const quoteText = text.textContent?.trim() ?? ''
      if (quoteText) {
        blocks.push({
          type: 'ArticleTitle',
          props: { text: cite ? `${quoteText} — ${cite}` : quoteText },
        })
      }
      continue
    }

    if (el.tagName === 'SECTION' && el.hasAttribute('data-article-section')) {
      flushParagraphs()
      const heading = el.querySelector('h2, h3')?.textContent?.trim() ?? ''
      const clone = el.cloneNode(true) as HTMLElement
      clone.querySelector('h2, h3')?.remove()
      blocks.push({
        type: 'ArticleSection',
        props: { heading, body: clone.innerHTML.trim() || '<p></p>' },
      })
      continue
    }

    if (el.tagName === 'HR') {
      flushParagraphs()
      blocks.push({ type: 'ArticleDivider', props: {} })
      continue
    }

    buffer.push(el.outerHTML)
  }

  flushParagraphs()
  if (!blocks.length) {
    blocks.push({ type: 'ArticleBody', props: { body: '<p></p>' } })
  }
  return blocks
}

export function articleToPuckDocument(article: ArticleDto): ArticlePuckDocument {
  const raw = article.puckData
  if (raw && isPuckData(raw)) {
    const meta = parseMeta(raw.meta as Record<string, unknown> | undefined)
    const legacy = raw as Record<string, unknown>
    if (!meta.sessionAudioUrl && typeof legacy.sessionAudioUrl === 'string') {
      meta.sessionAudioUrl = legacy.sessionAudioUrl
    }
    return {
      version: ARTICLE_PUCK_VERSION,
      puck: ensureCanvasLayouts(raw.puck as Data),
      meta: {
        ...meta,
        type: article.type ?? meta.type,
        isCoverStory: article.isCoverStory ?? meta.isCoverStory,
      },
    }
  }

  const content: Data['content'] = [
    { type: 'ArticleTitle', props: { text: article.title } },
  ]

  if (article.coverUrl) {
    content.push({
      type: 'ArticleHero',
      props: { imageUrl: article.coverUrl, caption: article.excerpt ?? '' },
    })
  }

  const bodyBlocks = bodyHtmlToBlocks(article.bodyHtml)
  const [firstBody, ...restBody] = bodyBlocks

  if (firstBody?.type === 'ArticleBody') {
    content.push({ type: 'ArticleLead', props: { body: firstBody.props.body } })
    content.push(...restBody)
  } else {
    content.push(...bodyBlocks)
  }

  for (const url of article.galleryUrls ?? []) {
    if (url === article.coverUrl) continue
    content.push({ type: 'ArticleImage', props: { imageUrl: url, caption: '' } })
  }

  const legacyMeta = parseMeta(raw)
  if (typeof raw?.sessionAudioUrl === 'string') {
    legacyMeta.sessionAudioUrl = raw.sessionAudioUrl
  }

  return {
    version: ARTICLE_PUCK_VERSION,
    puck: ensureCanvasLayouts({ root: { props: {} }, content }),
    meta: {
      ...legacyMeta,
      type: article.type ?? legacyMeta.type,
      isCoverStory: article.isCoverStory ?? legacyMeta.isCoverStory,
    },
  }
}

export function serializePuckDocument(doc: ArticlePuckDocument): Record<string, unknown> {
  return {
    version: doc.version,
    puck: doc.puck,
    meta: doc.meta,
    sessionAudioUrl: doc.meta.sessionAudioUrl || undefined,
    sessionLabel: doc.meta.sessionLabel || undefined,
  }
}
