import { Music2 } from 'lucide-react'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { cn } from '@/shared/lib/cn'
import '@/modules/music/styles/audio-library-consent.css'

interface AudioLibraryConsentToggleProps {
  checked: boolean
  onCheckedChange: (enabled: boolean) => void
  disabled?: boolean
  saving?: boolean
  className?: string
}

export function AudioLibraryConsentToggle({
  checked,
  onCheckedChange,
  disabled = false,
  saving = false,
  className,
}: AudioLibraryConsentToggleProps) {
  return (
    <div
      className={cn(
        'audio-library-consent',
        checked && 'audio-library-consent--active',
        (disabled || saving) && 'audio-library-consent--busy',
        className,
      )}
    >
      <label className="audio-library-consent__label">
        <Checkbox
          checked={checked}
          disabled={disabled || saving}
          onCheckedChange={(value) => onCheckedChange(Boolean(value))}
          className="audio-library-consent__checkbox"
        />
        <span className="audio-library-consent__copy">
          <span className="audio-library-consent__title-row">
            <Music2 className="audio-library-consent__icon" aria-hidden />
            <span className="audio-library-consent__title">Allow in Audio Library</span>
            {saving ? <span className="audio-library-consent__badge">Saving…</span> : null}
          </span>
          <span className="audio-library-consent__desc">
            I consent to let other users search and attach this track as background audio on image and
            video posts. I can turn this off anytime from Edit Release.
          </span>
        </span>
      </label>
    </div>
  )
}
