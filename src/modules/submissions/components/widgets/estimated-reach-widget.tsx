import { formatReach } from '@/modules/submissions/lib/submission-catalog'

interface EstimatedReachWidgetProps {
  reach: number
}

export function EstimatedReachWidget({ reach }: EstimatedReachWidgetProps) {
  const heights = [0.35, 0.55, 0.75, 0.5, 0.9, 0.65, 0.8]

  return (
    <div className="sub-widget">
      <h3 className="sub-widget__title">Estimated Reach</h3>
      <div className="sub-widget__reach">
        <div>
          <div className="sub-widget__reach-value">{reach > 0 ? formatReach(reach) : '0'}</div>
          <div className="sub-widget__reach-label">Listeners</div>
        </div>
        <div className="sub-widget__reach-bars" aria-hidden>
          {heights.map((h, i) => (
            <span
              key={i}
              className="sub-widget__reach-bar"
              style={{ height: `${h * 100}%`, opacity: reach > 0 ? 0.85 : 0.25 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
