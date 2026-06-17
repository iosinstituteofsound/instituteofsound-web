import {
  ArrowLeft,
  Eye,
  LayoutTemplate,
  Save,
} from 'lucide-react'
import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArticleEditorSidebar } from '@/modules/editor/components/article-editor-sidebar'
import { ArticlePreviewDialog } from '@/modules/editor/components/article-preview-dialog'
import { ArticleTemplatesDialog } from '@/modules/editor/components/article-templates-dialog'
import { ArticleCanvasBoard } from '@/modules/editor/components/article-canvas-board'
import { PublishConfirmDialog } from '@/modules/editor/components/publish-confirm-dialog'
import { SaveTemplateDialog } from '@/modules/editor/components/save-template-dialog'
import { SaveStatusIndicator } from '@/modules/editor/components/save-status-indicator'
import { useArticleTemplates } from '@/modules/editor/hooks/use-article-templates'
import { useArticleStats } from '@/modules/editor/hooks/use-article-stats'
import { usePublishConfig } from '@/modules/editor/hooks/use-publish-config'
import { useArticleEditor } from '@/modules/editor/hooks/use-article-editor'
import { puckToBodyHtml } from '@/modules/editor/lib/puck-to-html'
import type { PreviewDevice } from '@/modules/editor/components/article-preview-dialog'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { Loader } from '@/shared/components/feedback/loader'
import { Button } from '@/shared/components/ui/button'
import type { CanvasPreviewMode } from '@/modules/editor/hooks/use-article-canvas-history'
import { sanitizeSelectedBlockIds } from '@/modules/editor/lib/canvas-block-utils'
import '@/modules/editor/styles/article-editor.css'
import '@/modules/explore/styles/explore.css'

interface ArticleEditorPageProps {
  articleId?: string
}

export function ArticleEditorPage({ articleId: articleIdProp }: ArticleEditorPageProps = {}) {
  const { articleId: articleIdParam } = useParams()
  const articleId = articleIdProp ?? articleIdParam
  const navigate = useNavigate()
  const { data: me } = useMe()
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop')
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([])

  const editor = useArticleEditor(articleId)
  const { saveTemplate, isSaving: isSavingTemplate } = useArticleTemplates()
  const { data: publishConfig } = usePublishConfig()
  const bodyHtml = useMemo(() => puckToBodyHtml(editor.puckData), [editor.puckData])
  const stats = useArticleStats(bodyHtml)

  const canvasBlockIdsKey = useMemo(
    () =>
      editor.puckData.content
        .map((block) => String((block.props as Record<string, unknown>).blockId))
        .join(','),
    [editor.puckData],
  )

  useEffect(() => {
    setSelectedBlockIds((ids) => {
      const next = sanitizeSelectedBlockIds(editor.puckData, ids)
      if (next.length === ids.length && next.every((id, index) => id === ids[index])) {
        return ids
      }
      return next
    })
  }, [canvasBlockIdsKey])

  const handleSelectBlocks = useCallback((blockIds: string[]) => {
    setSelectedBlockIds(blockIds)
  }, [])

  const handleDeselectBlocks = useCallback(() => {
    setSelectedBlockIds([])
  }, [])

  const history = editor.canvasHistory
  const previousPreviewRef = useRef<CanvasPreviewMode>('current')
  void history.revision

  const handleUndo = useCallback(() => {
    history.undo(editor.puckData)
  }, [editor.puckData, history.revision, history.undo])

  const handleRedo = useCallback(() => {
    history.redo(editor.puckData)
  }, [editor.puckData, history.revision, history.redo])

  const handleRedoAll = useCallback(() => {
    history.redoAll(editor.puckData)
  }, [editor.puckData, history.revision, history.redoAll])

  const handleRevert = useCallback(() => {
    history.revert()
  }, [history.revision, history.revert])

  const handleCompareToggle = useCallback(() => {
    history.setPreviewMode((mode) => (mode === 'compare' ? 'current' : 'compare'))
  }, [history.setPreviewMode])

  const handleOriginalHoldStart = useCallback(() => {
    previousPreviewRef.current = history.previewMode === 'original' ? 'current' : history.previewMode
    history.setPreviewMode('original')
  }, [history.previewMode, history.setPreviewMode])

  const handleOriginalHoldEnd = useCallback(() => {
    const restore =
      previousPreviewRef.current === 'original' ? 'current' : previousPreviewRef.current
    history.setPreviewMode(restore)
  }, [history.setPreviewMode])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (!mod) return
      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        handleUndo()
      } else if (event.key === 'z' && event.shiftKey) {
        event.preventDefault()
        handleRedo()
      } else if (event.key === 'y') {
        event.preventDefault()
        handleRedo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleRedo, handleUndo])

  const handleBack = useCallback(async () => {
    try {
      await editor.flushIfDirty()
    } catch {
      // Still return to desk so the editor is not stuck open.
    }
    navigate('/editor')
  }, [editor.flushIfDirty, navigate])

  const authorName = me?.user.name ?? me?.user.email ?? 'Editor'

  if (editor.isLoading) {
    return <Loader className="min-h-screen bg-background" />
  }

  const handlePublish = async () => {
    await editor.publish()
    setPublishOpen(false)
  }

  return (
    <div className="article-editor fixed inset-0 z-[100] flex flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Back to editor desk"
            onClick={() => void handleBack()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <SaveStatusIndicator status={editor.saveStatus} />
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setTemplatesOpen(true)}>
            <LayoutTemplate className="mr-1.5 h-4 w-4" />
            Templates
          </Button>

          <Button type="button" size="sm" variant="outline" onClick={() => setSaveTemplateOpen(true)}>
            <Save className="mr-1.5 h-4 w-4" />
            Save template
          </Button>

          <Button type="button" size="sm" variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="mr-1.5 h-4 w-4" />
            Preview
          </Button>

          <Button type="button" size="sm" variant="outline" onClick={() => void editor.saveNow()} disabled={editor.isSaving}>
            Save draft
          </Button>

          <Button type="button" size="sm" onClick={() => setPublishOpen(true)} disabled={editor.isPublishing}>
            Publish
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="article-editor__write min-h-0 min-w-0 flex-1">
          <ArticleCanvasBoard
            data={editor.puckData}
            baselineData={history.baselineData ?? undefined}
            previewMode={history.previewMode}
            selectedBlockIds={selectedBlockIds}
            onChange={editor.setPuckData}
            onSelectBlocks={handleSelectBlocks}
          />
        </main>

        <ArticleEditorSidebar
          className="article-editor__sidebar hidden lg:flex"
          canvasData={editor.puckData}
          selectedBlockIds={selectedBlockIds}
          excerpt={editor.excerpt}
          slug={editor.slug}
          status={editor.article?.status ?? 'draft'}
          meta={editor.meta}
          authorName={authorName}
          onCanvasChange={editor.setPuckData}
          onSelectBlocks={handleSelectBlocks}
          onDeselectBlocks={handleDeselectBlocks}
          onExcerptChange={editor.setExcerpt}
          onMetaChange={editor.setMeta}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          canRedoAll={history.canRedoAll}
          canRevert={history.hasBaseline}
          previewMode={history.previewMode}
          onRevert={handleRevert}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onRedoAll={handleRedoAll}
          onOriginalHoldStart={handleOriginalHoldStart}
          onOriginalHoldEnd={handleOriginalHoldEnd}
          onCompareToggle={handleCompareToggle}
        />
      </div>

      <footer className="flex h-11 shrink-0 items-center justify-between border-t border-border bg-card px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{stats.words} words</span>
          <span>{stats.readMinutes} min read</span>
        </div>
        <SaveStatusIndicator status={editor.saveStatus} />
      </footer>

      <ArticleTemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onSelect={editor.loadTemplate}
      />

      <SaveTemplateDialog
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        puckDocument={editor.puckDocument}
        categories={publishConfig?.templateCategories ?? []}
        isSaving={isSavingTemplate}
        onSave={saveTemplate}
      />

      <ArticlePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        device={previewDevice}
        onDeviceChange={setPreviewDevice}
        title={editor.title}
        excerpt={editor.excerpt}
        authorName={authorName}
        puckData={editor.puckData}
      />

      <PublishConfirmDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        title={editor.title}
        slug={editor.slug}
        excerpt={editor.excerpt}
        wordCount={stats.words}
        readMinutes={stats.readMinutes}
        isCoverStory={editor.meta.isCoverStory}
        isPublishing={editor.isPublishing}
        onConfirm={() => void handlePublish()}
      />
    </div>
  )
}
