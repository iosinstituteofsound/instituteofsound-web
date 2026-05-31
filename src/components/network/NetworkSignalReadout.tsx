import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import { RankBadge } from '@/components/ui/RankBadge'

/** Weekly dB as a 0–100 meter fill (caps at 500 for display). */
function weeklyMeterFill(weeklyDb: number): number {
  return Math.min(100, Math.round((weeklyDb / 500) * 100))
}

interface NetworkSignalReadoutProps {
  profile: PublicMemberProfile
}

export function NetworkSignalReadout({ profile }: NetworkSignalReadoutProps) {
  const fill = weeklyMeterFill(profile.weeklyDb)

  return (
    <div className="network-signal-readout" aria-label="Signal readout">
      <div className="network-signal-readout-rank">
        <RankBadge rank={profile.rank} size="md" />
      </div>
      <div className="network-signal-readout-body">
        <p className="network-signal-readout-total">
          <span className="network-signal-readout-value">{profile.totalDb.toLocaleString()}</span>
          <span className="network-signal-readout-unit">dB lifetime</span>
        </p>
        <div className="network-signal-meter" role="meter" aria-valuenow={fill} aria-valuemin={0} aria-valuemax={100}>
          <div className="network-signal-meter-track">
            <div className="network-signal-meter-fill" style={{ width: `${fill}%` }} />
          </div>
          <p className="network-signal-meter-caption">
            <span>This week</span>
            <strong>{profile.weeklyDb.toLocaleString()} dB</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
