import { Trash2 } from 'lucide-react'
import { VoiceWaveformBars } from '@/modules/messenger/components/voice-waveform-bars'
import { IconButton } from '@/shared/components/ui/icon-button'

type ComposerVoiceRecordingBarProps = {
  formattedElapsed: string
  waveformSamples: number[]
  isSending: boolean
  onDiscard: () => void
  onSend: () => void
}

export function ComposerVoiceRecordingBar({
  formattedElapsed,
  waveformSamples,
  isSending,
  onDiscard,
  onSend,
}: ComposerVoiceRecordingBarProps) {
  return (
    <div className="messenger-composer__voice-bar">
      <IconButton
        type="button"
        className="messenger-composer__voice-discard"
        aria-label="Discard voice message"
        disabled={isSending}
        onClick={onDiscard}
      >
        <Trash2 className="h-4 w-4" />
      </IconButton>

      <div className="messenger-composer__voice-indicator" aria-hidden />

      <VoiceWaveformBars samples={waveformSamples} isOutgoing />

      <span className="messenger-composer__voice-time">{formattedElapsed}</span>

      <button
        type="button"
        className="messenger-composer__voice-send"
        aria-label="Send voice message"
        disabled={isSending}
        onClick={onSend}
      >
        Send
      </button>
    </div>
  )
}
