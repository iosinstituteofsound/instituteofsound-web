import type { ArticlePuckDocument } from '@/modules/editor/types/article-editor.types'
import { createEmptyPuckData } from '@/modules/editor/lib/article-puck-data'

export interface ArticleTemplate {
  id: string
  name: string
  description: string
  category: 'feature' | 'review' | 'interview' | 'photo'
  document: ArticlePuckDocument
}

export const ARTICLE_TEMPLATES: ArticleTemplate[] = [
  {
    id: 'blank',
    name: 'Blank article',
    description: 'Start with title, lead, and body blocks.',
    category: 'feature',
    document: createEmptyPuckData(),
  },
  {
    id: 'feature-story',
    name: 'Feature story',
    description: 'Hero image, lead, body, and section.',
    category: 'feature',
    document: {
      version: 1,
      puck: {
        root: { props: {} },
        content: [
          { type: 'ArticleTitle', props: { text: '' } },
          { type: 'ArticleHero', props: { imageUrl: '', caption: '' } },
          { type: 'ArticleLead', props: { body: '<p></p>' } },
          { type: 'ArticleBody', props: { body: '<p></p>' } },
          { type: 'ArticleSection', props: { heading: '', body: '<p></p>' } },
        ],
      },
      meta: {
        type: 'feature',
        tags: [],
        isCoverStory: false,
        wirePick: false,
        homepageHero: false,
        trending: false,
        seoTitle: '',
        seoDescription: '',
        sessionAudioUrl: '',
        sessionLabel: 'Listen to the session',
      },
    },
  },
  {
    id: 'album-review',
    name: 'Album review',
    description: 'Review layout with lead, body sections, and session audio hook.',
    category: 'review',
    document: {
      version: 1,
      puck: {
        root: { props: {} },
        content: [
          { type: 'ArticleTitle', props: { text: '' } },
          { type: 'ArticleLead', props: { body: '<p></p>' } },
          { type: 'ArticleImage', props: { imageUrl: '', caption: '' } },
          { type: 'ArticleBody', props: { body: '<p></p>' } },
          { type: 'ArticleSection', props: { heading: 'Verdict', body: '<p></p>' } },
        ],
      },
      meta: {
        type: 'review',
        tags: [],
        isCoverStory: false,
        wirePick: false,
        homepageHero: false,
        trending: false,
        seoTitle: '',
        seoDescription: '',
        sessionAudioUrl: '',
        sessionLabel: 'Listen to the album',
      },
    },
  },
  {
    id: 'photo-essay',
    name: 'Photo essay',
    description: 'Image-forward layout with multiple gallery blocks.',
    category: 'photo',
    document: {
      version: 1,
      puck: {
        root: { props: {} },
        content: [
          { type: 'ArticleTitle', props: { text: '' } },
          { type: 'ArticleLead', props: { body: '<p></p>' } },
          { type: 'ArticleImage', props: { imageUrl: '', caption: '' } },
          { type: 'ArticleBody', props: { body: '<p></p>' } },
          { type: 'ArticleImage', props: { imageUrl: '', caption: '' } },
        ],
      },
      meta: {
        type: 'feature',
        tags: [],
        isCoverStory: false,
        wirePick: false,
        homepageHero: false,
        trending: false,
        seoTitle: '',
        seoDescription: '',
        sessionAudioUrl: '',
        sessionLabel: 'Listen to the session',
      },
    },
  },
]

export function getArticleTemplate(id: string): ArticleTemplate | undefined {
  return ARTICLE_TEMPLATES.find((template) => template.id === id)
}
