import { useCallback, useRef, useState } from 'react'
import { FileAudio, RotateCcw, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import type { useAudioUploadQueue } from '@/modules/music/hooks/use-audio-upload-queue'
import { ProcessingStatus } from '@/modules/music/components/processing-status'
import { MAX_AUDIO_UPLOAD_MB } from '@/modules/music/types/release-builder.types'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

type UploadQueue = ReturnType<typeof useAudioUploadQueue>

interface ReleaseUploadStepProps {
  queue: UploadQueue
}

const FORMATS = ['WAV', 'MP3', 'FLAC', 'AAC', 'M4A']

function statusClass(status: string) {
  if (status === 'ready') return 'rbl-queue__status--ready'
  if (status === 'failed') return 'rbl-queue__status--failed'
  return ''
}

export function ReleaseUploadStep({ queue }: ReleaseUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | File[] | null) => {
      if (!files?.length) return
      const errors = queue.addFiles(files)
      if (errors.length) toast.error(errors[0])
      if (errors.length > 1) toast.error(`${errors.length - 1} more file(s) rejected`)
    },
    [queue],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  return (
    <div className="space-y-6">
      <header className="rbl-section-head">
        <p className="rbl-section-head__kicker">Phase 01 · Signal intake</p>
        <h2 className="rbl-section-head__title">Select your audio files</h2>
        <p className="rbl-section-head__desc">
          High quality audio recommended — 16-bit, 44.1 kHz stereo. Max {MAX_AUDIO_UPLOAD_MB}MB per file. Multiple files
          upload one at a time through the relay queue.
        </p>
      </header>

      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
        }}
        className={cn('rbl-portal', isDragging && 'rbl-portal--drag')}
      >
        <div className="rbl-portal__icon" aria-hidden>
          <Upload className="size-8" />
        </div>
        <div>
          <p className="rbl-portal__title">Drag &amp; Drop Files</p>
          <p className="rbl-portal__hint">
            Drop any audio files, or <em>browse your files</em>
          </p>
        </div>
        <div className="rbl-portal__formats" aria-label="Supported formats">
          {FORMATS.map((format) => (
            <span key={format} className="rbl-portal__format">
              {format}
            </span>
          ))}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.wav,.mp3,.flac,.aac,.m4a"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {queue.queue.length > 0 ? (
        <section className="rbl-panel">
          <div className="rbl-panel__header">
            <h3 className="rbl-panel__title">Transmission Queue</h3>
            <p className="rbl-panel__meta">
              {queue.readyTrackIds.length}/{queue.queue.length} synced
              {queue.isProcessing ? ' · uplink active' : ''}
            </p>
          </div>
          <div className="rbl-panel__body">
            <div className="rbl-queue">
              {queue.queue.map((item, index) => {
                const isActive = item.status === 'uploading' || item.status === 'processing'
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'rbl-queue__item',
                      isActive && 'rbl-queue__item--active',
                      item.status === 'ready' && 'rbl-queue__item--ready',
                      item.status === 'failed' && 'rbl-queue__item--failed',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="rbl-queue__index">{String(index + 1).padStart(2, '0')}</span>
                      <FileAudio className="rbl-text-accent mt-0.5 size-5 shrink-0" />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="rbl-queue__name">{item.file.name}</p>
                            <p className="rbl-queue__meta">
                              {(item.file.size / (1024 * 1024)).toFixed(1)} MB · track {index + 1}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn('rbl-queue__status', statusClass(item.status))}>{item.status}</span>
                            {item.status === 'pending' || item.status === 'failed' ? (
                              <button
                                type="button"
                                className="rbl-btn rbl-btn--icon"
                                onClick={() => queue.removeItem(item.id)}
                                aria-label="Remove track"
                              >
                                <X className="size-4" />
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {item.status === 'pending' ? (
                          <div className="rbl-field">
                            <span className="rbl-field__label">Track title</span>
                            <Input
                              placeholder="Track title"
                              value={item.title}
                              onChange={(e) => queue.updateTitle(item.id, e.target.value)}
                            />
                          </div>
                        ) : null}

                        {item.status === 'uploading' && item.uploadProgress > 0 ? (
                          <ProcessingStatus variant="scifi" status="uploaded" progress={item.uploadProgress} />
                        ) : null}

                        {(item.status === 'processing' || item.status === 'ready' || item.status === 'failed') &&
                        item.processingStatus !== 'created' ? (
                          <ProcessingStatus
                            variant="scifi"
                            status={item.processingStatus}
                            progress={item.processingProgress}
                            errorMessage={item.errorMessage}
                          />
                        ) : null}

                        {item.status === 'failed' ? (
                          <button type="button" className="rbl-btn" onClick={() => queue.retryItem(item.id)}>
                            <RotateCcw className="size-3.5" />
                            Retry upload
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
