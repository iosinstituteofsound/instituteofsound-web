import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createAudioUploadJob,
  finalizeAudioUpload,
  getAudioUploadJob,
  uploadAudioFile,
} from '@/modules/music/api/music.api'
import type { QueuedUpload } from '@/modules/music/types/release-builder.types'
import { MAX_AUDIO_UPLOAD_MB, titleFromFilename } from '@/modules/music/types/release-builder.types'
import type { NormalizedApiError } from '@/shared/types/api.types'

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return (err as NormalizedApiError).message || fallback
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

function createQueueItem(file: File): QueuedUpload {
  return {
    id: crypto.randomUUID(),
    file,
    title: titleFromFilename(file.name),
    status: 'pending',
    uploadProgress: 0,
    processingProgress: 0,
    processingStatus: 'created',
  }
}

export function validateAudioFile(file: File): string | null {
  if (!file.type.startsWith('audio/') && !/\.(wav|mp3|flac|aac|m4a|ogg)$/i.test(file.name)) {
    return `${file.name}: unsupported format. Use .wav, .mp3, or .flac`
  }
  const maxBytes = MAX_AUDIO_UPLOAD_MB * 1024 * 1024
  if (file.size > maxBytes) {
    return `${file.name}: exceeds ${MAX_AUDIO_UPLOAD_MB}MB limit`
  }
  return null
}

export function useAudioUploadQueue() {
  const [queue, setQueue] = useState<QueuedUpload[]>([])
  const queueRef = useRef<QueuedUpload[]>([])
  const processingRef = useRef(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const syncQueue = useCallback((next: QueuedUpload[]) => {
    queueRef.current = next
    setQueue(next)
  }, [])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling])

  const updateItem = useCallback((id: string, patch: Partial<QueuedUpload>) => {
    const current = queueRef.current.find((item) => item.id === id)
    if (!current) return
    const hasChange = (Object.keys(patch) as (keyof QueuedUpload)[]).some(
      (key) => patch[key] !== current[key],
    )
    if (!hasChange) return
    const next = queueRef.current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    syncQueue(next)
  }, [syncQueue])

  const pollJob = useCallback(
    (itemId: string, jobId: string): Promise<string | null> =>
      new Promise((resolve) => {
        stopPolling()
        pollRef.current = setInterval(async () => {
          try {
            const job = await getAudioUploadJob(jobId)
            updateItem(itemId, {
              processingStatus: job.status,
              processingProgress: job.progress,
              errorMessage: job.errorMessage,
            })
            if (job.status === 'ready' && job.trackId) {
              stopPolling()
              resolve(job.trackId)
            }
            if (job.status === 'failed') {
              stopPolling()
              resolve(null)
            }
          } catch {
            stopPolling()
            resolve(null)
          }
        }, 3000)
      }),
    [stopPolling, updateItem],
  )

  const processItem = useCallback(
    async (item: QueuedUpload) => {
      updateItem(item.id, { status: 'uploading', uploadProgress: 0, errorMessage: undefined })
      try {
        const job = await createAudioUploadJob()
        updateItem(item.id, { jobId: job.id })
        await uploadAudioFile(job.id, item.file, (percent) => {
          if (percent === 100 || percent % 5 === 0) {
            updateItem(item.id, { uploadProgress: percent })
          }
        })
        updateItem(item.id, { status: 'processing', processingStatus: 'analyzing' })
        await finalizeAudioUpload(job.id, item.title.trim() || titleFromFilename(item.file.name))
        const trackId = await pollJob(item.id, job.id)
        if (trackId) {
          updateItem(item.id, { status: 'ready', trackId, processingStatus: 'ready', processingProgress: 100 })
        } else {
          const failedItem = queueRef.current.find((entry) => entry.id === item.id)
          updateItem(item.id, {
            status: 'failed',
            processingStatus: 'failed',
            errorMessage: failedItem?.errorMessage ?? 'Processing failed. Try again.',
          })
        }
      } catch (err) {
        updateItem(item.id, {
          status: 'failed',
          errorMessage: apiErrorMessage(err, 'Upload failed'),
        })
      }
    },
    [pollJob, updateItem],
  )

  const runQueue = useCallback(async () => {
    if (processingRef.current) return
    processingRef.current = true
    try {
      while (true) {
        const nextItem = queueRef.current.find((item) => item.status === 'pending')
        if (!nextItem) break
        await processItem(nextItem)
      }
    } finally {
      processingRef.current = false
    }
  }, [processItem])

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files)
      const valid: QueuedUpload[] = []
      const errors: string[] = []
      for (const file of incoming) {
        const error = validateAudioFile(file)
        if (error) errors.push(error)
        else valid.push(createQueueItem(file))
      }
      if (valid.length) {
        syncQueue([...queueRef.current, ...valid])
        void runQueue()
      }
      return errors
    },
    [runQueue],
  )

  const removeItem = useCallback((id: string) => {
    syncQueue(queueRef.current.filter((item) => item.id !== id))
  }, [syncQueue])

  const retryItem = useCallback(
    (id: string) => {
      updateItem(id, {
        status: 'pending',
        uploadProgress: 0,
        processingProgress: 0,
        processingStatus: 'created',
        errorMessage: undefined,
        jobId: undefined,
        trackId: undefined,
      })
      void runQueue()
    },
    [runQueue, updateItem],
  )

  const updateTitle = useCallback((id: string, title: string) => {
    updateItem(id, { title })
  }, [updateItem])

  const resetQueue = useCallback(() => {
    stopPolling()
    processingRef.current = false
    syncQueue([])
  }, [stopPolling, syncQueue])

  const readyTrackIds = queue.filter((item) => item.status === 'ready' && item.trackId).map((item) => item.trackId!)
  const isProcessing = queue.some((item) => item.status === 'uploading' || item.status === 'processing')
  const allDone = queue.length > 0 && queue.every((item) => item.status === 'ready' || item.status === 'failed')
  const hasReadyTracks = readyTrackIds.length > 0

  return {
    queue,
    addFiles,
    removeItem,
    retryItem,
    updateTitle,
    resetQueue,
    readyTrackIds,
    isProcessing,
    allDone,
    hasReadyTracks,
  }
}
