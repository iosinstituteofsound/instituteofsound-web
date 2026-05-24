import clsx from 'clsx'
import type { LevelAnalysis } from '@/lib/tools/audio/levels'
import { formatDb } from '@/lib/tools/audio/decode'

interface LevelMeterDisplayProps {
  analysis: LevelAnalysis
  mode: 'loudness' | 'clip'
}

export function LevelMeterDisplay({ analysis, mode }: LevelMeterDisplayProps) {
  const peakPct = Math.min(100, Math.max(0, ((analysis.peakDb + 60) / 60) * 100))
  const rmsPct = Math.min(100, Math.max(0, ((analysis.rmsDb + 60) / 60) * 100))

  return (
    <div className="ios-tools-meters">
      <div className="ios-tools-meter-row">
        <span className="ios-tools-meter-label">Peak</span>
        <div className="ios-tools-meter-track">
          <span
            className={clsx(
              'ios-tools-meter-fill',
              analysis.peakDb > -1 && 'ios-tools-meter-fill-hot'
            )}
            style={{ width: `${peakPct}%` }}
          />
        </div>
        <span className="ios-tools-meter-value">{formatDb(analysis.peakDb)}</span>
      </div>
      <div className="ios-tools-meter-row">
        <span className="ios-tools-meter-label">RMS</span>
        <div className="ios-tools-meter-track">
          <span className="ios-tools-meter-fill ios-tools-meter-fill-rms" style={{ width: `${rmsPct}%` }} />
        </div>
        <span className="ios-tools-meter-value">{formatDb(analysis.rmsDb)}</span>
      </div>
      <div className="ios-tools-meter-stats">
        <div>
          <span className="ios-tools-meter-stat-k">Headroom</span>
          <span className="ios-tools-meter-stat-v">{analysis.headroomDb.toFixed(1)} dB</span>
        </div>
        <div>
          <span className="ios-tools-meter-stat-k">Crest</span>
          <span className="ios-tools-meter-stat-v">{analysis.crestDb.toFixed(1)} dB</span>
        </div>
        {mode === 'clip' && (
          <div>
            <span className="ios-tools-meter-stat-k">Clipped samples</span>
            <span
              className={clsx(
                'ios-tools-meter-stat-v',
                analysis.isClipping && 'text-mh-red'
              )}
            >
              {analysis.clipCount.toLocaleString()} ({analysis.clipPercent.toFixed(4)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
