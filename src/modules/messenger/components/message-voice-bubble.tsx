import { Pause, Play } from 'lucide-react'
import { VoiceWaveformBars } from '@/modules/messenger/components/voice-waveform-bars'
import { useMessageVoiceBubble } from '@/modules/messenger/hooks/use-message-voice-bubble'
import { UserAvatar } from '@/shared/components/user'
import { cn } from '@/shared/lib/cn'

type MessageVoiceBubbleProps = {
  messageId: string
  mediaUrl?: string
  isOutgoing: boolean
  senderName?: string
  senderAvatar?: string
  isTail?: boolean
  isStacked?: boolean
}

export function MessageVoiceBubble({
  messageId,
  mediaUrl,
  isOutgoing,
  senderName,
  senderAvatar,
  isTail,
  isStacked,
}: MessageVoiceBubbleProps) {
  const {
    resolvedUrl,
    isPlaying,
    showSpeedControl,
    isPreparing,
    durationLabel,
    progress,
    waveformSamples,
    playbackError,
    playbackSpeedLabel,
    toggle,
    cycleSpeed,
    seek,
  } = useMessageVoiceBubble({
    messageId,
    mediaUrl,
    isOutgoing,
    isTail,
    isStacked,
  })

  if (!resolvedUrl) return null

  const showSenderAvatar = !isOutgoing && Boolean(senderAvatar || senderName)

  return (
    <div
      className={cn(
        'messenger-voice-bubble',
        isOutgoing ? 'is-outgoing' : 'is-incoming',
        isStacked && 'is-stacked',
        isTail && (isOutgoing ? 'is-tail-out' : 'is-tail-in'),
      )}
    >
      <button
        type="button"
        className={cn(
          'messenger-voice-bubble__play',
          isOutgoing ? 'is-outgoing' : 'is-incoming',
        )}
        aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
        disabled={isPreparing}
        onClick={() => void toggle()}
      >
        {showSenderAvatar ? (
          <>
            <UserAvatar
              name={senderName ?? 'User'}
              avatarUrl={senderAvatar}
              className="h-11 w-11"
            />
            <span className="messenger-voice-bubble__play-overlay" aria-hidden>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </span>
          </>
        ) : isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </button>

      {showSpeedControl ? (
        <button
          type="button"
          className="messenger-voice-bubble__speed"
          aria-label={`Playback speed ${playbackSpeedLabel}. Click to change.`}
          onClick={cycleSpeed}
        >
          {playbackSpeedLabel}
        </button>
      ) : null}

      <div className="messenger-voice-bubble__track">
        <VoiceWaveformBars
          samples={waveformSamples}
          progress={progress}
          isOutgoing={isOutgoing}
          onSeek={seek}
        />
        <span
          className={cn(
            'messenger-voice-bubble__time',
            playbackError && 'has-error',
          )}
        >
          {playbackError ? 'Tap' : durationLabel}
        </span>
      </div>
    </div>
  )
}
