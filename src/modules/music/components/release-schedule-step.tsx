import { Rocket } from 'lucide-react'
import { Switch } from '@/shared/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { ReleaseDatePicker } from '@/modules/music/components/release-date-picker'

interface ReleaseScheduleStepProps {
  releaseDate: string
  onReleaseDateChange: (value: string) => void
  releaseTimeEnabled: boolean
  onReleaseTimeEnabledChange: (value: boolean) => void
  releaseHour: string
  onReleaseHourChange: (value: string) => void
  releaseMinute: string
  onReleaseMinuteChange: (value: string) => void
  releasePeriod: 'AM' | 'PM'
  onReleasePeriodChange: (value: 'AM' | 'PM') => void
}

export function ReleaseScheduleStep({
  releaseDate,
  onReleaseDateChange,
  releaseTimeEnabled,
  onReleaseTimeEnabledChange,
  releaseHour,
  onReleaseHourChange,
  releaseMinute,
  onReleaseMinuteChange,
  releasePeriod,
  onReleasePeriodChange,
}: ReleaseScheduleStepProps) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-8">
      <header className="rbl-section-head">
        <p className="rbl-section-head__kicker">Phase 03 · Orbital schedule</p>
        <h2 className="rbl-section-head__title">Plan Your Release</h2>
        <p className="rbl-section-head__desc">
          Lock in your launch coordinates. Scheduled releases deploy automatically on the selected stellar date.
        </p>
      </header>

      <section className="rbl-panel">
        <div className="rbl-panel__header">
          <h3 className="rbl-panel__title">Launch window</h3>
          <p className="rbl-panel__meta">Pick a date on or after today</p>
        </div>
        <div className="rbl-panel__body">
          <ReleaseDatePicker value={releaseDate} onChange={onReleaseDateChange} minDate={today} />
        </div>
      </section>

      <div className="rbl-toggle-panel">
        <div className="rbl-toggle-panel__head">
          <div>
            <p className="rbl-toggle-panel__title">Set a Release Time</p>
            <p className="rbl-toggle-panel__desc">Pinpoint the exact moment your signal goes live</p>
          </div>
          <Switch checked={releaseTimeEnabled} onCheckedChange={onReleaseTimeEnabledChange} />
        </div>

        {releaseTimeEnabled ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <Select value={releaseHour} onValueChange={onReleaseHourChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={releaseMinute} onValueChange={onReleaseMinuteChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['00', '15', '30', '45'].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={releasePeriod} onValueChange={(v) => onReleasePeriodChange(v as 'AM' | 'PM')}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <div className="rbl-panel">
        <div className="rbl-panel__body flex items-start gap-3">
          <Rocket className="rbl-text-accent mt-0.5 size-5 shrink-0" />
          <p className="rbl-text-muted text-sm leading-relaxed">
            Your release will go live on the selected date. If you enable a release time, it will publish at that exact
            moment in your local timezone.
          </p>
        </div>
      </div>
    </div>
  )
}
