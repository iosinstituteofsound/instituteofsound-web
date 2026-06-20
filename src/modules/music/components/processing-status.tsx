const STAGE_LABELS: Record<string, string> = {
  created: 'Initializing uplink',
  uploaded: 'Signal received',
  analyzing: 'Spectral analysis',
  normalizing: 'Calibrating loudness',
  transcoding: 'Encoding stream matrix',
  uploading: 'Transmitting to R2 nebula',
  ready: 'Transmission complete',
  failed: 'Signal lost',
}

interface ProcessingStatusProps {
  status: string
  progress: number
  errorMessage?: string
  variant?: 'default' | 'scifi'
}

export function ProcessingStatus({
  status,
  progress,
  errorMessage,
  variant = 'default',
}: ProcessingStatusProps) {
  const label = STAGE_LABELS[status] ?? status
  const isFailed = status === 'failed'
  const isReady = status === 'ready'

  if (variant === 'scifi') {
    return (
      <div className={`rbl-proc${isFailed ? ' rbl-proc--failed' : ''}${isReady ? ' rbl-proc--ready' : ''}`}>
        <div className="rbl-proc__head">
          <span className="rbl-proc__label">{label}</span>
          <span className="rbl-proc__pct">{progress}%</span>
        </div>
        <div className="rbl-proc__track">
          <div className="rbl-proc__beam" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
        {errorMessage ? <p className="rbl-proc__error">{errorMessage}</p> : null}
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-[width] ${isFailed ? 'bg-destructive' : isReady ? 'bg-primary' : 'bg-primary'}`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
    </div>
  )
}
