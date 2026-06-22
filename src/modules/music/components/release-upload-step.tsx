import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import type { useAudioUploadQueue } from '@/modules/music/hooks/use-audio-upload-queue'
import { ReleaseUploadQueueList } from '@/modules/music/components/release-upload-queue-list'
import { MAX_AUDIO_UPLOAD_MB } from '@/modules/music/types/release-builder.types'
import { cn } from '@/shared/lib/cn'

type UploadQueue = ReturnType<typeof useAudioUploadQueue>

interface ReleaseUploadStepProps {
  queue: UploadQueue
}

const FORMATS = ['WAV', 'MP3', 'FLAC', 'AAC', 'M4A']

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
        <p className="rbl-section-head__kicker ios-mh-kicker">Upload</p>
        <h2 className="rbl-section-head__title">Select your audio files</h2>
        <p className="rbl-section-head__desc">
          High quality audio recommended — 16-bit, 44.1 kHz stereo. Max {MAX_AUDIO_UPLOAD_MB}MB per file. Large
          WAV files upload one at a time; conversion runs in parallel on the server.
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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="rbl-panel__title">Transmission Queue</h3>
                <p className="rbl-panel__meta">
                  {queue.readyTrackIds.length}/{queue.queue.length} synced
                  {queue.isProcessing ? ' · uplink active' : ''}
                  {queue.queue.length > 1 ? ' · drag grip to reorder' : ''}
                </p>
              </div>
              {queue.failedCount > 0 ? (
                <button type="button" className="rbl-btn" onClick={() => queue.retryAllFailed()}>
                  Retry all failed ({queue.failedCount})
                </button>
              ) : null}
            </div>
          </div>
          <div className="rbl-panel__body">
            <ReleaseUploadQueueList queue={queue} />
          </div>
        </section>
      ) : null}
    </div>
  )
}
