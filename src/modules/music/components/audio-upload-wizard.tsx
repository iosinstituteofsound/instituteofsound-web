import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  createAudioUploadJob,
  finalizeAudioUpload,
  getAudioUploadJob,
  uploadAudioFile,
} from '@/modules/music/api/music.api'
import { AudioLibraryConsentToggle } from '@/modules/music/components/audio-library-consent-toggle'
import { ProcessingStatus } from '@/modules/music/components/processing-status'
import { Button } from '@/shared/components/ui/button'
import { FileDropzone } from '@/shared/components/forms'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

interface AudioUploadWizardProps {
  onComplete?: (trackId: string) => void
}

export function AudioUploadWizard({ onComplete }: AudioUploadWizardProps) {
  const [jobId, setJobId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState<string>('created')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [title, setTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [ugcEnabled, setUgcEnabled] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startJobMutation = useMutation({
    mutationFn: createAudioUploadJob,
    onSuccess: (job) => setJobId(job.id),
    onError: () => toast.error('Could not start upload'),
  })

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const pollJob = useCallback(
    (id: string) => {
      stopPolling()
      pollRef.current = setInterval(async () => {
        try {
          const job = await getAudioUploadJob(id)
          setProcessingStatus(job.status)
          setProcessingProgress(job.progress)
          setErrorMessage(job.errorMessage)
          if (job.status === 'ready' && job.trackId) {
            stopPolling()
            toast.success('Track is ready to publish')
            onComplete?.(job.trackId)
          }
          if (job.status === 'failed') {
            stopPolling()
            toast.error(job.errorMessage ?? 'Processing failed')
          }
        } catch {
          stopPolling()
        }
      }, 2000)
    },
    [onComplete, stopPolling],
  )

  useEffect(() => () => stopPolling(), [stopPolling])

  const handleUpload = async () => {
    if (!selectedFile) return
    let id = jobId
    if (!id) {
      const job = await startJobMutation.mutateAsync()
      id = job.id
      setJobId(id)
    }
    await uploadAudioFile(id, selectedFile, setUploadProgress)
    const trackTitle = title.trim() || selectedFile.name.replace(/\.[^.]+$/, '')
    await finalizeAudioUpload(id, trackTitle, ugcEnabled)
    setProcessingStatus('analyzing')
    pollJob(id)
  }

  return (
    <div className="space-y-6">
      <FileDropzone
        onFiles={(files) => {
          const file = files[0] ?? null
          setSelectedFile(file)
          if (file && !title) setTitle(file.name.replace(/\.[^.]+$/, ''))
        }}
        accept="audio/*"
        title="Drop any audio format"
        description="We convert to AAC for streaming"
        icon={<Upload className="size-10 text-muted-foreground" />}
        className={cn(
          'rounded-xl p-10',
          selectedFile ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/25',
        )}
        aria-label="Upload audio"
      />

      <Input placeholder="Song name" value={title} onChange={(e) => setTitle(e.target.value)} />

      <AudioLibraryConsentToggle
        checked={ugcEnabled}
        onCheckedChange={setUgcEnabled}
      />

      {uploadProgress > 0 && uploadProgress < 100 ? (
        <p className="text-sm text-muted-foreground">Uploading: {uploadProgress}%</p>
      ) : null}

      {(processingStatus !== 'created' || processingProgress > 0) && (
        <ProcessingStatus
          status={processingStatus}
          progress={processingProgress}
          errorMessage={errorMessage}
        />
      )}

      <Button
        onClick={() => void handleUpload()}
        disabled={!selectedFile || startJobMutation.isPending || processingStatus === 'ready'}
      >
        Upload & Process
      </Button>
    </div>
  )
}
