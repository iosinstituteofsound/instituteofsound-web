import type { Data } from '@measured/puck'
import type { ArticleType } from '@/modules/explore/types/explore.types'

export const ARTICLE_PUCK_VERSION = 1

export type ArticleWorkspaceMode = 'canvas' | 'live'

export interface ArticleEditorMeta {
  type: ArticleType
  tags: string[]
  isCoverStory: boolean
  wirePick: boolean
  homepageHero: boolean
  trending: boolean
  seoTitle: string
  seoDescription: string
  sessionAudioUrl: string
  sessionLabel: string
  soundDna?: ArticleSoundDnaField[]
  /** `canvas` = free-form board (default). `live` = published-article layout after template apply. */
  workspaceMode?: ArticleWorkspaceMode
}

export interface ArticleSoundDnaField {
  label: string
  value: string
}

export interface ArticlePuckDocument {
  version: number
  puck: Data
  meta: ArticleEditorMeta
}

export type ArticleEditorMode = 'write' | 'layout' | 'focus'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface ArticleEditorState {
  articleId: string | null
  title: string
  excerpt: string
  slug: string
  coverUrl: string
  puckDocument: ArticlePuckDocument
}

export const DEFAULT_ARTICLE_META: ArticleEditorMeta = {
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
}
