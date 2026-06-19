import type { Data } from '@measured/puck'
import type { ArticleEditorMeta, ArticleWorkspaceMode } from '@/modules/editor/types/article-editor.types'

export function resolveWorkspaceMode(meta: ArticleEditorMeta, puck: Data): ArticleWorkspaceMode {
  if (meta.workspaceMode === 'live' || meta.workspaceMode === 'canvas') {
    return meta.workspaceMode
  }

  const hasHero = puck.content.some((block) => block.type === 'ArticleHero')
  const hasSection = puck.content.some((block) => block.type === 'ArticleSection')
  if (hasHero && hasSection) return 'live'
  if (puck.content.length >= 6 && hasHero) return 'live'

  return 'canvas'
}

export function withLiveWorkspace(meta: ArticleEditorMeta): ArticleEditorMeta {
  return { ...meta, workspaceMode: 'live' }
}

export function withCanvasWorkspace(meta: ArticleEditorMeta): ArticleEditorMeta {
  return { ...meta, workspaceMode: 'canvas' }
}
