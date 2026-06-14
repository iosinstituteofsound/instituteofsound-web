import clsx from 'clsx'

interface BpmGaugeProps {
  bpm: number
  confidence?: number
  label?: string
  size?: 'lg' | 'md'
}

export function BpmGauge({ bpm, confidence, label = 'Tempo', size = 'lg' }: BpmGaugeProps) {
  const confPct = confidence != null ? Math.round(confidence * 100) : null

  return (
    <div className={clsx('ios-tools-bpm-gauge', size === 'md' && 'ios-tools-bpm-gauge-md')}>
      <p className="ios-tools-bpm-gauge-label">{label}</p>
      <p className="ios-tools-bpm-gauge-value">{Math.round(bpm)}</p>
      <p className="ios-tools-bpm-gauge-unit">BPM</p>
      {confPct != null && (
        <div className="ios-tools-bpm-confidence">
          <div className="ios-tools-meter-track ios-tools-meter-track-sm">
            <span className="ios-tools-meter-fill" style={{ width: `${confPct}%` }} />
          </div>
          <span className="text-xs text-muted">{confPct}% confidence</span>
        </div>
      )}
    </div>
  )
}

export function TapPad({ onTap, tapCount }: { onTap: () => void; tapCount: number }) {
  return (
    <button type="button" className="ios-tools-tap-pad" onClick={onTap}>
      <span className="ios-tools-tap-pad-ring" aria-hidden />
      <span className="ios-tools-tap-pad-label">TAP</span>
      <span className="ios-tools-tap-pad-hint">{tapCount ? `${tapCount} taps` : 'Tap the beat'}</span>
    </button>
  )
}
