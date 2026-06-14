import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  Camera,
  Film,
  Loader2,
  Mic,
  Scissors,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { trimAudioBlob, trimVideoBlob } from '@/modules/feed/lib/media-clip'
import {
  acceptForKind,
  captureVideoPoster,
  formatDuration,
  kindFromFile,
  loadMediaDuration,
  pickRecorderMime,
  type MediaAttachKind,
  type MediaAttachMode,
} from '@/modules/feed/lib/media-utils'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'

export type MediaAttachment = {
  url: string
  posterUrl?: string
  durationSec?: number
}

export type MediaAttachPanelHandle = {
  uploadPendingPreview: () => Promise<MediaAttachment | null>
  clearPendingPreview: () => void
}

interface MediaAttachPanelProps {
  kind: MediaAttachMode
  attachment: MediaAttachment | null
  onAttachmentChange: (attachment: MediaAttachment | null) => void
  onResolvedKind?: (kind: MediaAttachKind) => void
  onUploadStateChange?: (state: { uploading: boolean; hasPreview: boolean }) => void
  disabled?: boolean
  embedded?: boolean
  initialTab?: PanelTab
  showClipEditor?: boolean
}

type PanelTab = 'upload' | 'record'

export const MediaAttachPanel = forwardRef<MediaAttachPanelHandle, MediaAttachPanelProps>(function MediaAttachPanel(
  {
  kind,
  attachment,
  onAttachmentChange,
  onResolvedKind,
  onUploadStateChange,
  disabled = false,
  embedded = false,
  initialTab = 'upload',
  showClipEditor = false,
},
  ref,
) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<PanelTab>(initialTab)
  const [resolvedKind, setResolvedKind] = useState<MediaAttachKind | null>(
    kind === 'photo-video' ? null : kind,
  )
  const [dragOver, setDragOver] = useState(false)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordStreamRef = useRef<MediaStream | null>(null)
  const recordTimerRef = useRef<number | null>(null)
  const recordChunksRef = useRef<BlobPart[]>([])

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    if (kind !== 'photo-video') {
      setResolvedKind(kind)
    }
  }, [kind])

  useEffect(() => {
    onUploadStateChange?.({ uploading: busy, hasPreview: Boolean(previewUrl) })
  }, [busy, previewUrl, onUploadStateChange])

  const activeKind = resolvedKind ?? (kind === 'photo-video' ? 'image' : kind)

  const extensionForBlob = (blob: Blob, blobKind: MediaAttachKind) => {
    if (blobKind === 'image') {
      if (blob.type.includes('png')) return '.png'
      if (blob.type.includes('webp')) return '.webp'
      if (blob.type.includes('gif')) return '.gif'
      return '.jpg'
    }
    if (blobKind === 'video') return '.webm'
    return '.wav'
  }

  const clearPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewBlob(null)
    setPreviewUrl(null)
    setDuration(0)
    setTrimStart(0)
    setTrimEnd(0)
  }, [previewUrl])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      recordStreamRef.current?.getTracks().forEach((track) => track.stop())
      if (recordTimerRef.current) window.clearInterval(recordTimerRef.current)
    }
  }, [previewUrl])

  const setPreviewFromBlob = async (blob: Blob, blobKind: MediaAttachKind) => {
    clearPreview()
    const url = URL.createObjectURL(blob)
    setPreviewBlob(blob)
    setPreviewUrl(url)

    if (blobKind === 'video' || blobKind === 'audio') {
      try {
        const mediaDuration = await loadMediaDuration(blob, blobKind)
        setDuration(mediaDuration)
        setTrimStart(0)
        setTrimEnd(mediaDuration)
      } catch {
        setDuration(0)
      }
    }
  }

  const handleFile = async (file: File) => {
    const fileKind = kindFromFile(file)
    if (!fileKind) {
      toast.error('Unsupported file type')
      return
    }
    if (kind !== 'photo-video' && fileKind !== kind) {
      toast.error(`Please choose a ${kind} file`)
      return
    }
    setResolvedKind(fileKind)
    onResolvedKind?.(fileKind)
    await setPreviewFromBlob(file, fileKind)
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    if (disabled || busy) return
    const file = event.dataTransfer.files[0]
    if (file) await handleFile(file)
  }

  const stopRecordingTracks = () => {
    recordStreamRef.current?.getTracks().forEach((track) => track.stop())
    recordStreamRef.current = null
    if (recordTimerRef.current) {
      window.clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
  }

  const startRecording = async () => {
    if (activeKind === 'image') return

    try {
      const constraints: MediaStreamConstraints =
        activeKind === 'video'
          ? { audio: true, video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } }
          : { audio: true, video: false }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      recordStreamRef.current = stream
      recordChunksRef.current = []

      const mimeType = pickRecorderMime(activeKind)
      const recorder = new MediaRecorder(stream, { mimeType })
      recorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordChunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        stopRecordingTracks()
        const blob = new Blob(recordChunksRef.current, { type: mimeType.split(';')[0] })
        recorderRef.current = null
        setRecording(false)
        setRecordSeconds(0)
        setResolvedKind(activeKind)
        onResolvedKind?.(activeKind)
        await setPreviewFromBlob(blob, activeKind)
      }

      recorder.start(250)
      setRecording(true)
      setRecordSeconds(0)
      recordTimerRef.current = window.setInterval(() => {
        setRecordSeconds((value) => value + 1)
      }, 1000)
    } catch {
      stopRecordingTracks()
      toast.error('Could not access camera/microphone')
    }
  }

  const stopRecording = () => {
    recorderRef.current?.stop()
  }

  const getProcessedBlob = async (): Promise<Blob | null> => {
    if (!previewBlob) return null

    if (kind === 'image' || activeKind === 'image') return previewBlob

    const hasTrim = duration > 0 && (trimStart > 0.05 || trimEnd < duration - 0.05)
    if (!hasTrim) return previewBlob

    try {
      if (activeKind === 'video') return await trimVideoBlob(previewBlob, trimStart, trimEnd)
      return await trimAudioBlob(previewBlob, trimStart, trimEnd)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not trim clip'
      toast.error(message)
      return null
    }
  }

  const uploadBlobToServer = async (
    blob: Blob,
    blobKind: MediaAttachKind,
  ): Promise<MediaAttachment | null> => {
    if (busy) return null

    setBusy(true)
    setUploadProgress(0)
    setResolvedKind(blobKind)
    onResolvedKind?.(blobKind)

    try {
      const filename = `feed-${Date.now()}${extensionForBlob(blob, blobKind)}`
      const uploaded = await uploadMediaFile(blob, filename, setUploadProgress)

      let posterUrl: string | undefined
      let durationSec: number | undefined

      if (blobKind === 'video') {
        const poster = await captureVideoPoster(blob)
        if (poster) {
          const posterUpload = await uploadMediaFile(poster, `poster-${Date.now()}.jpg`)
          posterUrl = posterUpload.absoluteUrl ?? posterUpload.url
        }
        durationSec = await loadMediaDuration(blob, 'video').catch(() => undefined)
      }

      if (blobKind === 'audio') {
        durationSec = await loadMediaDuration(blob, 'audio').catch(() => undefined)
      }

      return {
        url: uploaded.absoluteUrl ?? uploaded.url,
        posterUrl,
        durationSec,
      }
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Upload failed'
      toast.error(message)
      return null
    } finally {
      setBusy(false)
      setUploadProgress(null)
    }
  }

  const uploadPendingPreview = useCallback(async (): Promise<MediaAttachment | null> => {
    if (!previewBlob) return null

    const processed = await getProcessedBlob()
    if (!processed) return null

    const uploaded = await uploadBlobToServer(processed, activeKind)
    if (uploaded) clearPreview()
    return uploaded
  }, [activeKind, previewBlob, busy, duration, trimStart, trimEnd])

  useImperativeHandle(
    ref,
    () => ({
      uploadPendingPreview,
      clearPendingPreview: clearPreview,
    }),
    [uploadPendingPreview, clearPreview],
  )

  const uploadPreview = async () => {
    const uploaded = await uploadPendingPreview()
    if (!uploaded) return
    onAttachmentChange(uploaded)
    toast.success('Media ready to post')
  }

  const removeAttachment = () => {
    onAttachmentChange(null)
    clearPreview()
  }

  const canRecord = activeKind === 'video' || activeKind === 'audio'
  const showClipControls =
    (showClipEditor || previewBlob) && (activeKind === 'video' || activeKind === 'audio') && duration > 0

  return (
    <div className={cn('space-y-3', embedded ? '' : 'rounded-lg border bg-muted/30 p-3')}>
      {attachment ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            {!embedded ? (
              <p className="text-xs font-medium text-emerald-600">Media attached</p>
            ) : (
              <span />
            )}
            <Button type="button" variant="ghost" size="sm" onClick={removeAttachment} disabled={disabled || busy}>
              <Trash2 className="mr-1 h-4 w-4" />
              Remove
            </Button>
          </div>
          {activeKind === 'image' ? (
            <img src={attachment.url} alt="Attached" className="max-h-56 w-full rounded-lg object-cover" />
          ) : null}
          {activeKind === 'video' ? (
            <video
              src={attachment.url}
              poster={attachment.posterUrl}
              controls
              className="max-h-56 w-full rounded-lg bg-black"
            />
          ) : null}
          {activeKind === 'audio' ? (
            <audio src={attachment.url} controls className="w-full" />
          ) : null}
        </div>
      ) : (
        <>
          {canRecord && !embedded ? (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={tab === 'upload' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setTab('upload')}
                disabled={disabled || busy || recording}
              >
                <Upload className="mr-1 h-4 w-4" />
                Upload
              </Button>
              <Button
                type="button"
                size="sm"
                variant={tab === 'record' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setTab('record')}
                disabled={disabled || busy}
              >
                {activeKind === 'video' ? <Video className="mr-1 h-4 w-4" /> : <Mic className="mr-1 h-4 w-4" />}
                Record
              </Button>
            </div>
          ) : null}

          {tab !== 'record' && !previewUrl ? (
            <div
              onDragOver={(event) => {
                event.preventDefault()
                if (!disabled && !busy) setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 text-center transition-colors',
                embedded ? 'py-4' : 'py-6',
                dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 bg-background/50',
                (disabled || busy) && 'pointer-events-none opacity-60',
              )}
            >
              {activeKind === 'image' || kind === 'photo-video' ? (
                <Camera className="h-7 w-7 text-muted-foreground" />
              ) : activeKind === 'video' ? (
                <Film className="h-7 w-7 text-muted-foreground" />
              ) : (
                <Mic className="h-7 w-7 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {kind === 'photo-video' ? 'Drag photo, video or audio' : `Drag & drop ${activeKind}`}
                </p>
                <p className="text-xs text-muted-foreground">or tap to browse</p>
              </div>
              {!embedded ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || busy}
                >
                  Browse files
                </Button>
              ) : (
                <button
                  type="button"
                  className="text-xs font-semibold text-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || busy}
                >
                  Browse device
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptForKind(kind)}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleFile(file)
                  event.target.value = ''
                }}
              />
            </div>
          ) : null}

          {tab === 'record' && canRecord ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border bg-background/60 p-4">
              {recording ? (
                <>
                  <div className="flex items-center gap-2 text-sm font-medium text-red-500">
                    <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    Recording {formatDuration(recordSeconds)}
                  </div>
                  <Button type="button" variant="destructive" onClick={stopRecording}>
                    Stop recording
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {activeKind === 'video' ? 'Record a short video clip' : 'Record audio'}
                  </p>
                  <Button type="button" onClick={startRecording} disabled={disabled || busy}>
                    {activeKind === 'video' ? <Video className="mr-1 h-4 w-4" /> : <Mic className="mr-1 h-4 w-4" />}
                    Start recording
                  </Button>
                </>
              )}
            </div>
          ) : null}

          {previewUrl ? (
            <div className="space-y-3 rounded-lg border bg-background/60 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Preview</p>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={clearPreview}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {activeKind === 'image' ? (
                <img src={previewUrl} alt="Preview" className="max-h-56 w-full rounded-lg object-cover" />
              ) : null}
              {activeKind === 'video' ? (
                <video src={previewUrl} controls className="max-h-56 w-full rounded-lg bg-black" />
              ) : null}
              {activeKind === 'audio' ? <audio src={previewUrl} controls className="w-full" /> : null}

              {showClipControls ? (
                <div className="space-y-2 rounded-md border bg-muted/40 p-3">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <Scissors className="h-3.5 w-3.5" />
                    Instant clip
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Start</Label>
                      <Input
                        type="number"
                        min={0}
                        max={Math.max(0, trimEnd - 0.1)}
                        step={0.1}
                        value={Number(trimStart.toFixed(1))}
                        onChange={(event) => setTrimStart(Number(event.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End</Label>
                      <Input
                        type="number"
                        min={trimStart + 0.1}
                        max={duration}
                        step={0.1}
                        value={Number(trimEnd.toFixed(1))}
                        onChange={(event) => setTrimEnd(Number(event.target.value))}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Clip length: {formatDuration(Math.max(0, trimEnd - trimStart))} / {formatDuration(duration)}
                  </p>
                </div>
              ) : null}

              {embedded ? (
                <p className="text-xs text-muted-foreground">Uploads when you post</p>
              ) : (
                <Button type="button" className="w-full" onClick={uploadPreview} disabled={disabled || busy}>
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadProgress !== null ? `Uploading ${uploadProgress}%` : 'Processing…'}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Use this {activeKind}
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
})

export function mediaKindForFeedType(type: string): MediaAttachKind | null {
  if (type === 'image') return 'image'
  if (type === 'video') return 'video'
  if (type === 'music') return 'audio'
  return null
}
