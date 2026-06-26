import { useCallback, useEffect, useRef, useState } from 'react'
import { saveIllustratorArtwork } from '@/modules/illustrator/api/illustrator.api'
import {
  documentHasPaintedContent,
  fingerprintStudioDocument,
  type PersistedStudioDocument,
} from '@/modules/illustrator/lib/studio-document-persistence'
import { savePersistedStudioDocument } from '@/modules/illustrator/lib/studio-autosave-db'
import { compressStudioStateJson } from '@/modules/illustrator/lib/studio-state-compression'

export type StudioSaveStatus = 'saved' | 'saving' | 'dirty'

const AUTOSAVE_DEBOUNCE_MS = 1400

type MarkDirtyOptions = {
  immediate?: boolean
}

type FlushSaveOptions = {
  forcePreview?: boolean
}

type UseStudioAutosaveOptions = {
  enabled: boolean
  isPainting: boolean
  getDocument: () => PersistedStudioDocument | null
  getPreviewDataUrl?: () => string | undefined
  onSaved?: () => void
}

function scheduleIdle(task: () => void) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => task(), { timeout: 2500 })
    return
  }
  setTimeout(task, 0)
}

export function useStudioAutosave({
  enabled,
  isPainting,
  getDocument,
  getPreviewDataUrl,
  onSaved,
}: UseStudioAutosaveOptions) {
  const [status, setStatus] = useState<StudioSaveStatus>('saved')
  const getDocumentRef = useRef(getDocument)
  const getPreviewDataUrlRef = useRef(getPreviewDataUrl)
  const onSavedRef = useRef(onSaved)
  const lastFingerprintRef = useRef<string | null>(null)
  const serverHadPaintRef = useRef(false)
  const debounceTimerRef = useRef<number | null>(null)
  const savingRef = useRef(false)
  const queuedRef = useRef(false)

  getDocumentRef.current = getDocument
  getPreviewDataUrlRef.current = getPreviewDataUrl
  onSavedRef.current = onSaved

  const flushSave = useCallback(async (options?: FlushSaveOptions) => {
    if (!enabled) return

    const doc = getDocumentRef.current()
    if (!doc) return

    if (!options?.forcePreview && serverHadPaintRef.current && !documentHasPaintedContent(doc)) {
      setStatus('dirty')
      return
    }

    const fingerprint = fingerprintStudioDocument(doc)
    const hasPaint = documentHasPaintedContent(doc)

    if (fingerprint === lastFingerprintRef.current && !options?.forcePreview) {
      setStatus('saved')
      return
    }

    if (savingRef.current) {
      queuedRef.current = true
      return
    }

    savingRef.current = true
    setStatus('saving')

    try {
      await savePersistedStudioDocument(doc)

      const stateGzipBase64 = await compressStudioStateJson(JSON.stringify(doc))

      await saveIllustratorArtwork(doc.artworkId, {
        title: doc.title,
        status: doc.status,
        document: doc.document,
        stateGzipBase64,
        previewDataUrl: getPreviewDataUrlRef.current?.(),
      })

      lastFingerprintRef.current = fingerprint
      serverHadPaintRef.current = hasPaint
      setStatus('saved')
      onSavedRef.current?.()
    } catch {
      setStatus('dirty')
    } finally {
      savingRef.current = false
      if (queuedRef.current) {
        queuedRef.current = false
        void flushSave(options)
      }
    }
  }, [enabled])

  const queueSave = useCallback(
    (immediate = false) => {
      if (!enabled || isPainting) return

      setStatus((prev) => (prev === 'saving' ? prev : 'dirty'))
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }

      const run = () => {
        scheduleIdle(() => {
          void flushSave()
        })
      }

      if (immediate) {
        run()
        return
      }

      debounceTimerRef.current = window.setTimeout(run, AUTOSAVE_DEBOUNCE_MS)
    },
    [enabled, flushSave, isPainting],
  )

  const markDirty = useCallback(
    (options?: MarkDirtyOptions) => {
      if (!enabled) return
      setStatus((prev) => (prev === 'saving' ? prev : 'dirty'))
      queueSave(options?.immediate ?? false)
    },
    [enabled, queueSave],
  )

  useEffect(() => {
    if (!enabled || !isPainting) return
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [enabled, isPainting])

  useEffect(() => {
    if (!enabled || isPainting) return
    queueSave()
  }, [enabled, isPainting, queueSave])

  useEffect(() => {
    if (!enabled) return

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void flushSave()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current)
      }
      void flushSave()
    }
  }, [enabled, flushSave])

  const seedFingerprint = useCallback((doc: PersistedStudioDocument | null) => {
    lastFingerprintRef.current = doc ? fingerprintStudioDocument(doc) : null
    serverHadPaintRef.current = documentHasPaintedContent(doc)
    setStatus('saved')
  }, [])

  return {
    status,
    markDirty,
    flushSave,
    seedFingerprint,
  }
}
