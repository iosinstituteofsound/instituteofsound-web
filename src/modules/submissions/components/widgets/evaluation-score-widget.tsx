import type { EvaluationMetric } from '@/modules/submissions/types/submission-wizard.types'

interface EvaluationScoreWidgetProps {
  metrics: EvaluationMetric[]
  percent: number
}

const RING_RADIUS = 28
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function EvaluationScoreWidget({ metrics, percent }: EvaluationScoreWidgetProps) {
  const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE

  return (
    <div className="sub-widget">
      <h3 className="sub-widget__title">Evaluation Score</h3>
      <div className="sub-eval">
        <div className="sub-eval__ring" aria-hidden>
          <svg viewBox="0 0 72 72">
            <circle className="sub-eval__ring-bg" cx="36" cy="36" r={RING_RADIUS} />
            <circle
              className="sub-eval__ring-fill"
              cx="36"
              cy="36"
              r={RING_RADIUS}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={offset}
            />
          </svg>
        </div>
        <div className="sub-eval__metrics">
          {metrics.map((metric) => (
            <div key={metric.label} className="sub-eval__metric">
              <span className="sub-eval__metric-label">{metric.label}</span>
              <span className="sub-eval__metric-value">{metric.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
