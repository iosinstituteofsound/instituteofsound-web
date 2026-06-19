import {
  createEditorArticle,
  getEditorArticle,
  publishEditorArticle,
  updateEditorArticle,
} from '@/modules/explore/api/explore.api'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import { buildArticleSavePayload } from '@/modules/editor/lib/article-save-payload'
import {
  articleToPuckDocument,
  createEmptyPuckData,
} from '@/modules/editor/lib/article-puck-data'
import {
  extractTitleFromPuck,
} from '@/modules/editor/lib/puck-to-html'
import type { ArticlePuckDocument, SaveStatus } from '@/modules/editor/types/article-editor.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { Data } from '@measured/puck'
import { ensureCanvasLayouts, puckNeedsLayoutSync } from '@/modules/editor/lib/canvas-block-utils'
import { useArticleCanvasHistory } from '@/modules/editor/hooks/use-article-canvas-history'
import { sendKeepaliveDraftSave } from '@/modules/editor/lib/keepalive-draft-save'

const AUTOSAVE_MS = 1000

export function useArticleEditor(articleId: string | undefined) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [puckDocument, setPuckDocument] = useState<ArticlePuckDocument>(createEmptyPuckData())
  const [excerpt, setExcerpt] = useState('')
  const [slug, setSlug] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [resolvedId, setResolvedId] = useState<string | null>(articleId ?? null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirtyRef = useRef(false)
  const hydratingRef = useRef(false)
  const bootstrapDraftRef = useRef(false)
  const stateRef = useRef({ puckDocument, excerpt, resolvedId })

  stateRef.current = { puckDocument, excerpt, resolvedId }

  const { data: article, isLoading } = useQuery({
    queryKey: ['editor-article', articleId],
    queryFn: () => getEditorArticle(articleId!),
    enabled: Boolean(articleId),
  })

  const persistMutation = useMutation({
    mutationFn: async (input: { id?: string; payload: ReturnType<typeof buildArticleSavePayload> }) => {
      if (input.id) {
        return updateEditorArticle(input.id, input.payload)
      }
      return createEditorArticle(input.payload)
    },
    onSuccess: (saved: ArticleDto) => {
      setResolvedId(saved.id)
      setSlug(saved.slug)
      setSaveStatus('saved')
      dirtyRef.current = false
      queryClient.setQueryData(['editor-article', saved.id], saved)
      void queryClient.invalidateQueries({ queryKey: ['editor-articles'] })
      if (!articleId && saved.id) {
        navigate(`/editor/write/${saved.id}`, { replace: true })
      }
    },
    onError: () => {
      setSaveStatus('error')
      toast.error('Failed to save article')
    },
  })

  const persistRef = useRef(persistMutation.mutateAsync)
  persistRef.current = persistMutation.mutateAsync

  useEffect(() => {
    if (articleId || resolvedId || bootstrapDraftRef.current) return
    bootstrapDraftRef.current = true

    void (async () => {
      try {
        setSaveStatus('saving')
        const payload = buildArticleSavePayload(createEmptyPuckData(), '')
        await persistRef.current({ payload })
      } catch {
        bootstrapDraftRef.current = false
      }
    })()
  }, [articleId, resolvedId])

  const publishMutation = useMutation({
    mutationFn: publishEditorArticle,
    onSuccess: () => {
      toast.success('Article published')
      void queryClient.invalidateQueries({ queryKey: ['editor-articles'] })
      void queryClient.invalidateQueries({ queryKey: ['editor-article'] })
    },
    onError: () => toast.error('Failed to publish'),
  })

  const flushSave = useCallback(async () => {
    if (hydratingRef.current) return
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    const payload = buildArticleSavePayload(puckDocument, excerpt)
    setSaveStatus('saving')
    await persistMutation.mutateAsync({ id: resolvedId ?? undefined, payload })
  }, [excerpt, persistMutation, puckDocument, resolvedId])

  const flushIfDirty = useCallback(async () => {
    if (hydratingRef.current || !dirtyRef.current) return
    await flushSave()
  }, [flushSave])

  const scheduleSave = useCallback(() => {
    if (hydratingRef.current) return
    dirtyRef.current = true
    setSaveStatus('saving')
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      void flushSave()
    }, AUTOSAVE_MS)
  }, [flushSave])

  const scheduleSaveRef = useRef(scheduleSave)
  scheduleSaveRef.current = scheduleSave

  const applyPuckFromHistory = useCallback(
    (data: Data) => {
      setPuckDocument((prev) => ({
        ...prev,
        puck: ensureCanvasLayouts(data),
      }))
      scheduleSave()
    },
    [scheduleSave],
  )

  const canvasHistory = useArticleCanvasHistory({ onApply: applyPuckFromHistory })
  const setBaselineRef = useRef(canvasHistory.setBaseline)
  const recordChangeRef = useRef(canvasHistory.recordChange)
  setBaselineRef.current = canvasHistory.setBaseline
  recordChangeRef.current = canvasHistory.recordChange
  const emptyBaselineSetRef = useRef(false)

  useEffect(() => {
    if (!article) return
    if (dirtyRef.current) return

    hydratingRef.current = true
    const doc = articleToPuckDocument(article)
    const rawPuck =
      article.puckData &&
      typeof article.puckData === 'object' &&
      'puck' in article.puckData &&
      Array.isArray((article.puckData as { puck: Data }).puck?.content)
        ? (article.puckData as { puck: Data }).puck.content
        : []
    const rawCount = rawPuck.length
    const cleanedCount = doc.puck.content.length
    setPuckDocument(doc)
    setExcerpt(article.excerpt ?? '')
    setSlug(article.slug)
    setResolvedId(article.id)
    setBaselineRef.current(ensureCanvasLayouts(doc.puck))
    queueMicrotask(() => {
      hydratingRef.current = false
      if (cleanedCount < rawCount) {
        dirtyRef.current = true
        scheduleSaveRef.current()
      } else {
        dirtyRef.current = false
      }
    })
  }, [article])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
      if (hydratingRef.current || !dirtyRef.current) return

      const { puckDocument: doc, excerpt: ex, resolvedId: id } = stateRef.current
      const payload = buildArticleSavePayload(doc, ex)
      void persistRef.current({ id: id ?? undefined, payload })
    }
  }, [])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hydratingRef.current || !dirtyRef.current) return

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }

      const { puckDocument: doc, excerpt: ex, resolvedId: id } = stateRef.current
      if (id) {
        sendKeepaliveDraftSave(id, buildArticleSavePayload(doc, ex))
      }

      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  useEffect(() => {
    if (articleId) {
      emptyBaselineSetRef.current = false
      return
    }
    if (emptyBaselineSetRef.current) return
    emptyBaselineSetRef.current = true
    setBaselineRef.current(ensureCanvasLayouts(createEmptyPuckData().puck))
  }, [articleId])

  const setPuckData = useCallback(
    (data: Data) => {
      setPuckDocument((prev) => {
        recordChangeRef.current(prev.puck)
        const puck =
          data.content === prev.puck.content && !puckNeedsLayoutSync(data)
            ? data
            : ensureCanvasLayouts(data)
        return { ...prev, puck }
      })
      scheduleSave()
    },
    [scheduleSave],
  )

  const setMeta = useCallback(
    (patch: Partial<ArticlePuckDocument['meta']>) => {
      setPuckDocument((prev) => ({ ...prev, meta: { ...prev.meta, ...patch } }))
      scheduleSave()
    },
    [scheduleSave],
  )

  const setExcerptField = useCallback(
    (value: string) => {
      setExcerpt(value)
      scheduleSave()
    },
    [scheduleSave],
  )

  const loadTemplate = useCallback(
    async (document: ArticlePuckDocument) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }

      const nextDoc: ArticlePuckDocument = {
        version: document.version,
        puck: ensureCanvasLayouts(document.puck),
        meta: { ...document.meta },
      }
      const nextExcerpt = document.meta.seoDescription || ''

      hydratingRef.current = true
      dirtyRef.current = true
      stateRef.current = {
        puckDocument: nextDoc,
        excerpt: nextExcerpt,
        resolvedId: stateRef.current.resolvedId,
      }

      setPuckDocument(nextDoc)
      setExcerpt(nextExcerpt)
      setBaselineRef.current(nextDoc.puck)
      setSaveStatus('saving')

      try {
        await persistMutation.mutateAsync({
          id: stateRef.current.resolvedId ?? undefined,
          payload: buildArticleSavePayload(nextDoc, nextExcerpt),
        })
        toast.success('Template applied to workspace')
      } catch {
        toast.error('Failed to save template')
      } finally {
        hydratingRef.current = false
      }
    },
    [persistMutation],
  )

  const publish = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    if (dirtyRef.current || !resolvedId) {
      const saved = await persistMutation.mutateAsync({
        id: resolvedId ?? undefined,
        payload: buildArticleSavePayload(puckDocument, excerpt),
      })
      await publishMutation.mutateAsync(saved.id)
      return
    }
    if (resolvedId) await publishMutation.mutateAsync(resolvedId)
  }, [excerpt, persistMutation, publishMutation, puckDocument, resolvedId])

  const title = extractTitleFromPuck(puckDocument.puck)
  const puckData = useMemo(() => ensureCanvasLayouts(puckDocument.puck), [puckDocument])

  return {
    article,
    isLoading: Boolean(articleId) && isLoading,
    puckDocument,
    puckData,
    meta: puckDocument.meta,
    excerpt,
    slug,
    title,
    saveStatus,
    articleId: resolvedId,
    setPuckData,
    setMeta,
    setExcerpt: setExcerptField,
    loadTemplate,
    publish,
    saveNow: flushSave,
    flushIfDirty,
    isPublishing: publishMutation.isPending,
    isSaving: persistMutation.isPending,
    canvasHistory,
  }
}
