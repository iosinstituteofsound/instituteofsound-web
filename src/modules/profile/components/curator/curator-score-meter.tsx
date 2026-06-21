import type { CSSProperties } from 'react'

type CuratorScoreMeterProps = {
  value: number
  label: string
  index: number
  max?: number
}

const V_TICKS = 12
const H_SEGMENTS = 10

export function CuratorScoreMeter({ value, label, index, max = 100 }: CuratorScoreMeterProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const filledVTicks = Math.round((pct / 100) * V_TICKS)
  const filledHSegments = Math.round((pct / 100) * H_SEGMENTS)
  const meterStyle = { '--meter-pct': `${pct}%` } as CSSProperties

  return (
    <div className="curator-score-meter" aria-label={`${label}: ${value}`}>
      <div className="curator-score-meter__head">
        <span className="curator-score-meter__idx">{String(index).padStart(2, '0')}</span>
        <span className="curator-score-meter__value">{value}</span>
      </div>

      <div
        className="curator-score-meter__vtrack"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className="curator-score-meter__vfill" style={meterStyle} aria-hidden />
        <div className="curator-score-meter__vticks" aria-hidden>
          {Array.from({ length: V_TICKS }, (_, i) => {
            const tickIndex = V_TICKS - 1 - i
            return (
              <span
                key={i}
                className={
                  tickIndex < filledVTicks
                    ? 'curator-score-meter__vtick curator-score-meter__vtick--on'
                    : 'curator-score-meter__vtick'
                }
              />
            )
          })}
        </div>
        <span className="curator-score-meter__cap" aria-hidden />
      </div>

      <div className="curator-score-meter__track" aria-hidden>
        <div className="curator-score-meter__fill" style={meterStyle} />
        <div className="curator-score-meter__segments">
          {Array.from({ length: H_SEGMENTS }, (_, i) => (
            <span
              key={i}
              className={
                i < filledHSegments
                  ? 'curator-score-meter__seg curator-score-meter__seg--on'
                  : 'curator-score-meter__seg'
              }
            />
          ))}
        </div>
      </div>

      <p className="curator-score-meter__label">{label}</p>
    </div>
  )
}

function averageScore(values: number[]) {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}

type CuratorScoreBoardProps = {
  scores: Array<{ value: number; label: string; index: number }>
}

export function CuratorScoreBoard({ scores }: CuratorScoreBoardProps) {
  const values = scores.map((s) => s.value)
  const composite = averageScore(values)
  const compositeStyle = { '--meter-pct': `${composite}%` } as CSSProperties

  return (
    <div className="curator-score-board">
      <div className="curator-score-composite" aria-label={`Composite index: ${composite}`}>
        <div className="curator-score-composite__meta">
          <span className="curator-score-composite__label">Composite Index</span>
          <span className="curator-score-composite__value">{composite}</span>
        </div>
        <div className="curator-score-composite__bar" aria-hidden>
          <div className="curator-score-composite__fill" style={compositeStyle} />
          <div className="curator-score-composite__ticks">
            {values.map((v, i) => (
              <span
                key={i}
                className="curator-score-composite__tick"
                style={{ '--tick-h': `${v}%` } as CSSProperties}
              />
            ))}
          </div>
        </div>
        <span className="curator-score-composite__status">Calibrated</span>
      </div>

      <div className="curator-score-grid">
        {scores.map(({ value, label, index }) => (
          <CuratorScoreMeter key={label} value={value} label={label} index={index} />
        ))}
      </div>
    </div>
  )
}
