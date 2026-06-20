import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Box, Loader2, Trash2, Upload, X } from 'lucide-react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import {
  acceptForKind,
  kindFromFile,
  modelFormatLabel,
  type MediaAttachKind,
} from '@/modules/feed/lib/media-utils'
import { FeedModelViewer } from '@/modules/feed/components/feed-model-viewer'
import { Button } from '@/shared/components/ui/button'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'

export type ModelAttachment = {
  url: string
  sourceFormat?: string
  convertedFormat?: string
  converted?: boolean
  originalName?: string
}

export type ModelAttachPanelHandle = {
  uploadPendingPreview: () => Promise<ModelAttachment | null>
  clearPendingPreview: () => void
}

interface ModelAttachPanelProps {
  attachment: ModelAttachment | null
  onAttachmentChange: (attachment: ModelAttachment | null) => void
  onUploadStateChange?: (state: { uploading: boolean; hasPreview: boolean }) => void
  disabled?: boolean
  embedded?: boolean
}

export const ModelAttachPanel = forwardRef<ModelAttachPanelHandle, ModelAttachPanelProps>(
  function ModelAttachPanel(
    { attachment, onAttachmentChange, onUploadStateChange, disabled = false, embedded = false },
    ref,
  ) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)
    const [previewFile, setPreviewFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState<number | null>(null)
    const [busy, setBusy] = useState(false)

    const clearPreview = useCallback(() => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewFile(null)
      setPreviewUrl(null)
    }, [previewUrl])

    useEffect(() => {
      return () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
      }
    }, [previewUrl])

    useEffect(() => {
      onUploadStateChange?.({ uploading: busy, hasPreview: Boolean(previewUrl) })
    }, [busy, previewUrl, onUploadStateChange])

    const handleFile = async (file: File) => {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
      if (ext === '.mtl') {
        toast.error('Select the .obj file (not .mtl). Textures load when .obj and .mtl share the same folder name on upload.')
        return
      }
      const fileKind = kindFromFile(file)
      if (fileKind !== 'model') {
        toast.error('Unsupported 3D format. Use GLB, GLTF, OBJ, FBX, STL, USDZ, etc.')
        return
      }
      clearPreview()
      const url = URL.createObjectURL(file)
      setPreviewFile(file)
      setPreviewUrl(url)
    }

    const handleDrop = async (event: React.DragEvent) => {
      event.preventDefault()
      setDragOver(false)
      if (disabled || busy) return
      const file = event.dataTransfer.files[0]
      if (file) await handleFile(file)
    }

    const uploadFile = async (file: File): Promise<ModelAttachment | null> => {
      setBusy(true)
      setUploadProgress(0)
      try {
        const uploaded = await uploadMediaFile(file, file.name, setUploadProgress)
        return {
          url: uploaded.absoluteUrl ?? uploaded.url,
          sourceFormat: uploaded.sourceFormat,
          convertedFormat: uploaded.convertedFormat,
          converted: uploaded.converted,
          originalName: uploaded.originalName,
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

    const uploadPendingPreview = useCallback(async (): Promise<ModelAttachment | null> => {
      if (!previewFile) return null
      const uploaded = await uploadFile(previewFile)
      if (uploaded) clearPreview()
      return uploaded
    }, [previewFile, busy])

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
      toast.success(uploaded.converted ? 'Model converted and ready to post' : '3D model ready to post')
    }

    const previewIsUsdz = previewFile?.name.toLowerCase().endsWith('.usdz')

    return (
      <div className={cn('space-y-3', embedded ? '' : 'rounded-lg border bg-muted/30 p-3')}>
        {attachment ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              {!embedded ? (
                <p className="text-xs font-medium text-violet-600">
                  {modelFormatLabel(attachment.sourceFormat, attachment.converted)}
                </p>
              ) : (
                <span />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onAttachmentChange(null)}
                disabled={disabled || busy}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Remove
              </Button>
            </div>
            <div className="feed-model-viewer-frame overflow-hidden rounded-lg border bg-muted/20">
              <FeedModelViewer
                src={attachment.url}
                iosSrc={attachment.convertedFormat === 'usdz' ? attachment.url : undefined}
                alt={attachment.originalName ?? '3D model'}
              />
            </div>
          </div>
        ) : (
          <>
            {!previewUrl ? (
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
                <Box className="h-7 w-7 text-violet-500" />
                <div>
                  <p className="text-sm font-medium">Drag a 3D model</p>
                  <p className="text-xs text-muted-foreground">
                    GLB, GLTF, OBJ, FBX, STL, DAE, PLY, USDZ and more — auto-converts to GLB
                  </p>
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
                  accept={acceptForKind('model')}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void handleFile(file)
                    event.target.value = ''
                  }}
                />
              </div>
            ) : null}

            {previewUrl ? (
              <div className="space-y-3 rounded-lg border bg-background/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Preview · {previewFile?.name}
                  </p>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={clearPreview}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="feed-model-viewer-frame overflow-hidden rounded-lg border bg-muted/20">
                  {previewIsUsdz ? (
                    <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
                      <Box className="h-10 w-10 text-violet-500" />
                      <p>USDZ preview works on iOS after upload. File will post as-is for AR.</p>
                    </div>
                  ) : (
                    <FeedModelViewer src={previewUrl} alt={previewFile?.name ?? '3D model preview'} />
                  )}
                </div>

                {embedded ? (
                  <p className="text-xs text-muted-foreground">
                    Converts and uploads when you post (may take a moment for large files)
                  </p>
                ) : (
                  <Button type="button" className="w-full" onClick={uploadPreview} disabled={disabled || busy}>
                    {busy ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadProgress !== null ? `Uploading ${uploadProgress}%` : 'Converting model…'}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Use this model
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
  },
)

export function mediaKindForFeedType(type: string): MediaAttachKind | null {
  if (type === 'image') return 'image'
  if (type === 'video') return 'video'
  if (type === 'music') return 'audio'
  if (type === 'model') return 'model'
  return null
}
