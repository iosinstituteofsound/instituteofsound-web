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
import {
  COMMON_RELEASE_TIMEZONES,
  formatReleaseGoLivePreview,
  getDefaultReleaseTimezone,
} from '@/modules/music/lib/release-schedule'

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
  releaseTimezone: string
  onReleaseTimezoneChange: (value: string) => void
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
  releaseTimezone,
  onReleaseTimezoneChange,
}: ReleaseScheduleStepProps) {
  const today = new Date().toISOString().slice(0, 10)
  const preview = formatReleaseGoLivePreview(
    releaseDate,
    releaseTimeEnabled,
    releaseHour,
    releaseMinute,
    releasePeriod,
    releaseTimezone || getDefaultReleaseTimezone(),
  )

  return (
    <div className="space-y-8">
      <header className="rbl-section-head">
        <p className="rbl-section-head__kicker ios-mh-kicker">Schedule</p>
        <h2 className="rbl-section-head__title">Plan your release</h2>
        <p className="rbl-section-head__desc">
          Choose when your release goes live. It stays private until the scheduled date and time.
        </p>
      </header>

      <section className="rbl-panel">
        <div className="rbl-panel__header">
          <h3 className="rbl-panel__title">Release date</h3>
          <p className="rbl-panel__meta">Pick a date on or after today</p>
        </div>
        <div className="rbl-panel__body">
          <ReleaseDatePicker value={releaseDate} onChange={onReleaseDateChange} minDate={today} />
        </div>
      </section>

      <div className="rbl-toggle-panel">
        <div className="rbl-toggle-panel__head">
          <div>
            <p className="rbl-toggle-panel__title">Set a release time</p>
            <p className="rbl-toggle-panel__desc">Pinpoint the exact moment your release goes public</p>
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

      <section className="rbl-panel">
        <div className="rbl-panel__header">
          <h3 className="rbl-panel__title">Timezone</h3>
        </div>
        <div className="rbl-panel__body space-y-3">
          <Select value={releaseTimezone} onValueChange={onReleaseTimezoneChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_RELEASE_TIMEZONES.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="rbl-panel">
        <div className="rbl-panel__body flex items-start gap-3">
          <Rocket className="rbl-text-accent mt-0.5 size-5 shrink-0" />
          <p className="rbl-text-muted text-sm leading-relaxed">
            {preview
              ? `Goes live: ${preview} (${releaseTimezone})`
              : 'Your release will become public at the scheduled moment in the selected timezone.'}
          </p>
        </div>
      </div>
    </div>
  )
}
