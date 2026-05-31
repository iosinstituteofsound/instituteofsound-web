import { noiseScoreFromDb } from '@/lib/network/noiseScore'

interface NetworkNoiseScoreGaugeProps {
  totalDb: number
  rankLabel: string
}

export function NetworkNoiseScoreGauge({ totalDb, rankLabel }: NetworkNoiseScoreGaugeProps) {
  const score = noiseScoreFromDb(totalDb)
  const pct = Math.min(100, (score / 10) * 100)
  const circumference = 2 * Math.PI * 42
  const dash = (pct / 100) * circumference

  return (
    <div className="network-noise-gauge" aria-label={`Noise score ${score} out of 10`}>
      <div className="network-noise-gauge-ring">
        <svg viewBox="0 0 100 100" className="network-noise-gauge-svg" aria-hidden>
          <circle cx="50" cy="50" r="42" className="network-noise-gauge-track" />
          <circle
            cx="50"
            cy="50"
            r="42"
            className="network-noise-gauge-fill"
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={circumference * 0.25}
          />
        </svg>
        <div className="network-noise-gauge-center">
          <span className="network-noise-gauge-value">{score.toFixed(1)}</span>
          <span className="network-noise-gauge-label">Noise</span>
        </div>
      </div>
      <div className="network-noise-gauge-meta">
        <p className="network-noise-gauge-rank">{rankLabel}</p>
        <p className="network-noise-gauge-db">{totalDb.toLocaleString()} dB lifetime</p>
      </div>
    </div>
  )
}
