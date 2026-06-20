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

const POLL_INTERVAL_MS = 3000
const POLL_ERROR_TOLERANCE = 8

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return (err as NormalizedApiError).message || fallback
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
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
  const activeItemsRef = useRef(new Set<string>())
  const pollIntervalsRef = useRef(new Map<string, ReturnType<typeof setInterval>>())

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

  const pollJob = useCallback(
    (itemId: string, jobId: string): Promise<string | null> =>
      new Promise((resolve) => {
        stopPollingJob(jobId)
        let pollErrors = 0

        const intervalId = setInterval(async () => {
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
              resolve(job.trackId)
              return
            }
            if (job.status === 'failed') {
              stopPollingJob(jobId)
              resolve(null)
            }
          } catch {
            pollErrors += 1
            if (pollErrors >= POLL_ERROR_TOLERANCE) {
              stopPollingJob(jobId)
              resolve(null)
            }
          }
        }, POLL_INTERVAL_MS)

        pollIntervalsRef.current.set(jobId, intervalId)
      }),
    [stopPollingJob, updateItem],
  )

  const processItem = useCallback(
    async (item: QueuedUpload) => {
      if (activeItemsRef.current.has(item.id)) return
      activeItemsRef.current.add(item.id)

      updateItem(item.id, { status: 'uploading', uploadProgress: 0, errorMessage: undefined })
      try {
        const job = await createAudioUploadJob()
        updateItem(item.id, { jobId: job.id })
        await uploadAudioFile(job.id, item.file, (percent) => {
          if (percent === 100 || percent % 5 === 0) {
            updateItem(item.id, { uploadProgress: percent })
          }
        })
        updateItem(item.id, { status: 'processing', processingStatus: 'analyzing', uploadProgress: 100 })
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
          processingStatus: 'failed',
          errorMessage: apiErrorMessage(err, 'Upload failed'),
        })
      } finally {
        activeItemsRef.current.delete(item.id)
      }
    },
    [pollJob, updateItem],
  )

  const runQueue = useCallback(async () => {
    const pending = queueRef.current.filter(
      (item) => item.status === 'pending' && !activeItemsRef.current.has(item.id),
    )
    if (!pending.length) return
    await Promise.all(pending.map((item) => processItem(item)))
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
    [runQueue, syncQueue],
  )

  const removeItem = useCallback(
    (id: string) => {
      const item = queueRef.current.find((entry) => entry.id === id)
      if (item?.jobId) stopPollingJob(item.jobId)
      activeItemsRef.current.delete(id)
      syncQueue(queueRef.current.filter((entry) => entry.id !== id))
    },
    [stopPollingJob, syncQueue],
  )

  const retryItem = useCallback(
    (id: string) => {
      const item = queueRef.current.find((entry) => entry.id === id)
      if (item?.jobId) stopPollingJob(item.jobId)
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
    activeItemsRef.current.clear()
    syncQueue([])
  }, [stopAllPolling, syncQueue])

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
    reorderQueue,
    reorderReadyTracks,
    resetQueue,
    readyTrackIds,
    isProcessing,
    allDone,
    hasReadyTracks,
  }
}
