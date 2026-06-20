import { arrayMove } from '@dnd-kit/sortable'
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
import { randomUUID } from '@/shared/lib/random-uuid'

const POLL_INTERVAL_MS = 2500
const POLL_ERROR_TOLERANCE = 12
const UPLOAD_RETRY_ATTEMPTS = 3
const LARGE_FILE_BYTES = 50 * 1024 * 1024

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    const message = (err as NormalizedApiError).message || fallback
    if (message === 'Network Error') {
      return 'Connection lost during upload. Large WAV files upload one at a time — tap Retry.'
    }
    const status = (err as NormalizedApiError).status
    if (status === 413) return 'File too large for the server limit.'
    if (status === 502 || status === 503 || status === 504) {
      return 'Server busy — wait a moment and retry.'
    }
    return message
  }
  if (err instanceof Error && err.message) {
    if (err.message === 'Network Error') {
      return 'Connection lost during upload. Large WAV files upload one at a time — tap Retry.'
    }
    return err.message
  }
  return fallback
}

function isRetryableUploadError(err: unknown): boolean {
  if (err && typeof err === 'object' && 'message' in err) {
    const normalized = err as NormalizedApiError
    if (normalized.message === 'Network Error') return true
    if (normalized.status >= 500) return true
    if (normalized.status === 408 || normalized.status === 429) return true
  }
  return false
}

async function withUploadRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= UPLOAD_RETRY_ATTEMPTS; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (!isRetryableUploadError(err) || attempt === UPLOAD_RETRY_ATTEMPTS) throw err
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt))
    }
  }
  throw lastError ?? new Error(`${label} failed`)
}

function uploadConcurrencyFor(items: QueuedUpload[]) {
  const largest = Math.max(...items.map((item) => item.file.size), 0)
  if (largest >= LARGE_FILE_BYTES) return 1
  if (largest >= 20 * 1024 * 1024) return 2
  return 3
}

function createQueueItem(file: File): QueuedUpload {
  return {
    id: randomUUID(),
    file,
    title: titleFromFilename(file.name),
    status: 'pending',
    uploadProgress: 0,
    processingProgress: 0,
    processingStatus: 'created',
  }
}

async function runPool<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>) {
  const queue = [...items]
  const slots = Math.min(Math.max(concurrency, 1), queue.length)
  await Promise.all(
    Array.from({ length: slots }, async () => {
      while (queue.length) {
        const item = queue.shift()
        if (!item) return
        await worker(item)
      }
    }),
  )
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
  const uploadingItemsRef = useRef(new Set<string>())
  const pollIntervalsRef = useRef(new Map<string, ReturnType<typeof setInterval>>())
  const runQueueRef = useRef<() => void>(() => {})

  const syncQueue = useCallback((next: QueuedUpload[]) => {
    queueRef.current = next
    setQueue(next)
  }, [])

  const stopPollingJob = useCallback((jobId: string) => {
    const intervalId = pollIntervalsRef.current.get(jobId)
    if (!intervalId) return
    clearInterval(intervalId)
    pollIntervalsRef.current.delete(jobId)
  }, [])

  const stopAllPolling = useCallback(() => {
    for (const intervalId of pollIntervalsRef.current.values()) {
      clearInterval(intervalId)
    }
    pollIntervalsRef.current.clear()
  }, [])

  useEffect(() => () => stopAllPolling(), [stopAllPolling])

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

  const startPolling = useCallback(
    (itemId: string, jobId: string) => {
      if (pollIntervalsRef.current.has(jobId)) return

      let pollErrors = 0

      const tick = async () => {
        try {
          const job = await getAudioUploadJob(jobId)
          pollErrors = 0
          updateItem(itemId, {
            processingStatus: job.status,
            processingProgress: job.progress,
            errorMessage: job.errorMessage,
          })

          if (job.status === 'ready' && job.trackId) {
            stopPollingJob(jobId)
            updateItem(itemId, {
              status: 'ready',
              trackId: job.trackId,
              processingStatus: 'ready',
              processingProgress: 100,
            })
            return
          }

          if (job.status === 'failed') {
            stopPollingJob(jobId)
            updateItem(itemId, {
              status: 'failed',
              processingStatus: 'failed',
              errorMessage: job.errorMessage ?? 'Processing failed. Try again.',
            })
          }
        } catch {
          pollErrors += 1
          if (pollErrors >= POLL_ERROR_TOLERANCE) {
            stopPollingJob(jobId)
            updateItem(itemId, {
              status: 'failed',
              processingStatus: 'failed',
              errorMessage: 'Lost connection while processing. Retry upload.',
            })
          }
        }
      }

      void tick()
      const intervalId = setInterval(() => {
        void tick()
      }, POLL_INTERVAL_MS)
      pollIntervalsRef.current.set(jobId, intervalId)
    },
    [stopPollingJob, updateItem],
  )

  const uploadItem = useCallback(
    async (item: QueuedUpload) => {
      if (uploadingItemsRef.current.has(item.id)) return
      uploadingItemsRef.current.add(item.id)

      updateItem(item.id, {
        status: 'uploading',
        uploadProgress: 0,
        errorMessage: undefined,
        processingProgress: 0,
        processingStatus: 'created',
      })

      try {
        const job = await withUploadRetry('Create upload job', createAudioUploadJob)
        updateItem(item.id, { jobId: job.id })

        await withUploadRetry(`Upload ${item.file.name}`, () =>
          uploadAudioFile(job.id, item.file, (percent) => {
            if (percent === 100 || percent % 5 === 0) {
              updateItem(item.id, { uploadProgress: percent })
            }
          }),
        )

        updateItem(item.id, {
          status: 'processing',
          uploadProgress: 100,
          processingStatus: 'analyzing',
          processingProgress: 25,
        })

        await withUploadRetry('Finalize upload', () =>
          finalizeAudioUpload(job.id, item.title.trim() || titleFromFilename(item.file.name)),
        )
        startPolling(item.id, job.id)
      } catch (err) {
        updateItem(item.id, {
          status: 'failed',
          processingStatus: 'failed',
          errorMessage: apiErrorMessage(err, 'Upload failed'),
        })
      } finally {
        uploadingItemsRef.current.delete(item.id)
      }
    },
    [startPolling, updateItem],
  )

  const runQueue = useCallback(async () => {
    const pending = queueRef.current.filter(
      (item) => item.status === 'pending' && !uploadingItemsRef.current.has(item.id),
    )
    if (!pending.length) return

    await runPool(pending, uploadConcurrencyFor(pending), uploadItem)

    const stillPending = queueRef.current.filter(
      (item) => item.status === 'pending' && !uploadingItemsRef.current.has(item.id),
    )
    if (stillPending.length) {
      void runQueueRef.current()
    }
  }, [uploadItem])

  useEffect(() => {
    runQueueRef.current = () => {
      void runQueue()
    }
  }, [runQueue])

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
    [runQueue, syncQueue],
  )

  const removeItem = useCallback(
    (id: string) => {
      const item = queueRef.current.find((entry) => entry.id === id)
      if (item?.jobId) stopPollingJob(item.jobId)
      uploadingItemsRef.current.delete(id)
      syncQueue(queueRef.current.filter((entry) => entry.id !== id))
    },
    [stopPollingJob, syncQueue],
  )

  const retryItem = useCallback(
    (id: string) => {
      const item = queueRef.current.find((entry) => entry.id === id)
      if (item?.jobId) stopPollingJob(item.jobId)
      uploadingItemsRef.current.delete(id)
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
    [runQueue, stopPollingJob, updateItem],
  )

  const retryAllFailed = useCallback(() => {
    const failedIds = queueRef.current.filter((item) => item.status === 'failed').map((item) => item.id)
    for (const id of failedIds) {
      const item = queueRef.current.find((entry) => entry.id === id)
      if (item?.jobId) stopPollingJob(item.jobId)
      uploadingItemsRef.current.delete(id)
      updateItem(id, {
        status: 'pending',
        uploadProgress: 0,
        processingProgress: 0,
        processingStatus: 'created',
        errorMessage: undefined,
        jobId: undefined,
        trackId: undefined,
      })
    }
    void runQueue()
  }, [runQueue, stopPollingJob, updateItem])

  const updateTitle = useCallback((id: string, title: string) => {
    updateItem(id, { title })
  }, [updateItem])

  const reorderQueue = useCallback(
    (activeId: string, overId: string) => {
      const items = queueRef.current
      const oldIndex = items.findIndex((item) => item.id === activeId)
      const newIndex = items.findIndex((item) => item.id === overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return
      syncQueue(arrayMove(items, oldIndex, newIndex))
    },
    [syncQueue],
  )

  const reorderReadyTracks = useCallback(
    (activeId: string, overId: string) => {
      const items = queueRef.current
      const readyIds = items.filter((item) => item.status === 'ready').map((item) => item.id)
      const oldIndex = readyIds.indexOf(activeId)
      const newIndex = readyIds.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return
      const nextReadyIds = arrayMove(readyIds, oldIndex, newIndex)
      const readyById = new Map(items.filter((item) => item.status === 'ready').map((item) => [item.id, item]))
      let readyCursor = 0
      syncQueue(
        items.map((item) => {
          if (item.status !== 'ready') return item
          return readyById.get(nextReadyIds[readyCursor++]!)!
        }),
      )
    },
    [syncQueue],
  )

  const resetQueue = useCallback(() => {
    stopAllPolling()
    uploadingItemsRef.current.clear()
    syncQueue([])
  }, [stopAllPolling, syncQueue])

  const readyTrackIds = queue.filter((item) => item.status === 'ready' && item.trackId).map((item) => item.trackId!)
  const isProcessing = queue.some((item) => item.status === 'uploading' || item.status === 'processing')
  const failedCount = queue.filter((item) => item.status === 'failed').length
  const allDone = queue.length > 0 && queue.every((item) => item.status === 'ready' || item.status === 'failed')
  const hasReadyTracks = readyTrackIds.length > 0

  return {
    queue,
    addFiles,
    removeItem,
    retryItem,
    retryAllFailed,
    updateTitle,
    reorderQueue,
    reorderReadyTracks,
    resetQueue,
    readyTrackIds,
    isProcessing,
    failedCount,
    allDone,
    hasReadyTracks,
  }
}
