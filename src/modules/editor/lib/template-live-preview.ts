import type { Data } from '@measured/puck'
import type { ArticleSessionTrack, SoundDnaRow } from '@/modules/explore/lib/article-content'
import { articleSoundDna } from '@/modules/explore/lib/article-content'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import {
  formatLiveQuoteLines,
  parseSessionTracks,
  resolvePuckLivePreview,
  type PuckLivePreviewModel,
} from '@/modules/editor/lib/puck-live-preview'
import type { ArticleTemplateDto } from '@/modules/editor/types/article-template.types'

export type TemplateLivePreviewModel = PuckLivePreviewModel

function buildSoundDnaArticle(template: ArticleTemplateDto, title: string): ArticleDto {
  const meta = (template.puckDocument.meta ?? {}) as Record<string, unknown>
  const type = typeof meta.type === 'string' ? meta.type : template.category === 'review' ? 'review' : 'feature'

  return {
    id: template.id,
    editorId: 'template',
    type: type as ArticleDto['type'],
    title,
    slug: template.id,
    excerpt: template.description,
    bodyHtml: '',
    status: 'draft',
    isCoverStory: false,
  }
}

export function resolveTemplateLivePreview(template: ArticleTemplateDto): TemplateLivePreviewModel {
  const metaRaw = (template.puckDocument.meta ?? {}) as Record<string, unknown>
  const meta = {
    type: (typeof metaRaw.type === 'string' ? metaRaw.type : template.category === 'review' ? 'review' : 'feature') as import('@/modules/editor/types/article-editor.types').ArticleEditorMeta['type'],
    tags: Array.isArray(metaRaw.tags) ? metaRaw.tags.filter((t): t is string => typeof t === 'string') : [],
    isCoverStory: Boolean(metaRaw.isCoverStory),
    wirePick: Boolean(metaRaw.wirePick),
    homepageHero: Boolean(metaRaw.homepageHero),
    trending: Boolean(metaRaw.trending),
    seoTitle: typeof metaRaw.seoTitle === 'string' ? metaRaw.seoTitle : '',
    seoDescription: typeof metaRaw.seoDescription === 'string' ? metaRaw.seoDescription : '',
    sessionAudioUrl:
      (typeof metaRaw.sessionAudioUrl === 'string' ? metaRaw.sessionAudioUrl : '') ||
      (typeof template.puckDocument.sessionAudioUrl === 'string' ? template.puckDocument.sessionAudioUrl : ''),
    sessionLabel:
      (typeof metaRaw.sessionLabel === 'string' ? metaRaw.sessionLabel : '') ||
      (typeof template.puckDocument.sessionLabel === 'string' ? template.puckDocument.sessionLabel : 'Listen to the session'),
  }

  const puck = (template.puckDocument.puck ?? { root: { props: {} }, content: [] }) as Data

  const model = resolvePuckLivePreview({
    puck,
    category: template.category,
    meta,
    excerpt: meta.seoDescription || template.description,
    slug: template.id,
    titleFallback: template.name,
    description: template.description,
    seedId: template.id,
  })

  const stub = buildSoundDnaArticle(template, model.title)

  return {
    ...model,
    soundDna: articleSoundDna(stub),
    showSoundDna: template.category === 'feature' || template.category === 'review',
  }
}

export function formatTemplateQuoteLines(text: string): string[] {
  return formatLiveQuoteLines(text)
}

export { parseSessionTracks }
export type { ArticleSessionTrack, SoundDnaRow }
