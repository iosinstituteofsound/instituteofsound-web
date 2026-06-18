const STAGE_LABELS: Record<string, string> = {
  created: 'Preparing',
  uploaded: 'Uploaded',
  analyzing: 'Analyzing audio',
  normalizing: 'Normalizing loudness',
  transcoding: 'Encoding AAC',
  uploading: 'Uploading to CDN',
  ready: 'Ready',
  failed: 'Failed',
}

interface ProcessingStatusProps {
  status: string
  progress: number
  errorMessage?: string
}

export function ProcessingStatus({ status, progress, errorMessage }: ProcessingStatusProps) {
  const label = STAGE_LABELS[status] ?? status
  const isFailed = status === 'failed'
  const isReady = status === 'ready'

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all ${isFailed ? 'bg-destructive' : isReady ? 'bg-green-500' : 'bg-primary'}`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
    </div>
  )
}
