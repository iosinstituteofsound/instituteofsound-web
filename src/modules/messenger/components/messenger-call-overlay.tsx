import { useEffect, useRef } from 'react'
import { FlipHorizontal, Mic, MicOff, PhoneOff, Video, VideoOff, Volume2 } from 'lucide-react'
import { CallNetworkBadge } from '@/modules/messenger/components/call-network-badge'
import { CallVideoStage } from '@/modules/messenger/components/call-video-stage'
import { useMessengerCallOverlay } from '@/modules/messenger/hooks/use-messenger-call-overlay'
import { IconButton } from '@/shared/components/ui/icon-button'
import { Button } from '@/shared/components/ui/button'
import '@/modules/messenger/styles/messenger-call.css'

export function MessengerCallOverlay() {
  const overlay = useMessengerCallOverlay()

  if (!overlay.visible) return null

  return (
    <div className="messenger-call" role="dialog" aria-label="Messenger call">
      <CallNetworkBadge quality={overlay.connectionQuality} />

      <div className="messenger-call__stage">
        <CallVideoStage
          isVideo={overlay.isVideo}
          localStream={overlay.localStream}
          remoteStream={overlay.remoteStream}
          isCameraOff={overlay.isCameraOff}
          cameraFacing={overlay.cameraFacing}
          remoteName={overlay.remoteName ?? 'Contact'}
          remoteAvatarUrl={overlay.remoteAvatarUrl}
        />

        <div className="messenger-call__meta">
          <div className="messenger-call__name">{overlay.remoteName ?? 'Contact'}</div>
          <div className="messenger-call__status">{overlay.statusLabel}</div>
        </div>
      </div>

      <div className="messenger-call__controls">
        {overlay.phase === 'incoming' ? (
          <>
            <Button variant="destructive" className="messenger-call__action" onClick={overlay.rejectIncoming}>
              Decline
            </Button>
            <IconButton
              className="messenger-call__round-btn"
              aria-label={overlay.answerWithMuted ? 'Answer muted' : 'Answer with mic'}
              onClick={overlay.toggleAnswerWithMuted}
            >
              {overlay.answerWithMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </IconButton>
            {overlay.isVideo ? (
              <IconButton
                className="messenger-call__round-btn"
                aria-label={overlay.answerWithCameraOff ? 'Answer with camera off' : 'Answer with camera'}
                onClick={overlay.toggleAnswerWithCameraOff}
              >
                {overlay.answerWithCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </IconButton>
            ) : null}
            <Button className="messenger-call__action" onClick={overlay.acceptIncoming}>
              Accept
            </Button>
          </>
        ) : (
          <>
            <IconButton
              className="messenger-call__round-btn"
              aria-label={overlay.isMuted ? 'Unmute' : 'Mute'}
              onClick={overlay.toggleMute}
            >
              {overlay.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </IconButton>
            {overlay.isVideo ? (
              <>
                <IconButton
                  className="messenger-call__round-btn"
                  aria-label={overlay.isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                  onClick={overlay.toggleCamera}
                >
                  {overlay.isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </IconButton>
                {overlay.hasMultipleCameras ? (
                  <IconButton
                    className="messenger-call__round-btn"
                    aria-label="Flip camera"
                    onClick={overlay.flipCamera}
                  >
                    <FlipHorizontal className="h-5 w-5" />
                  </IconButton>
                ) : null}
              </>
            ) : (
              <IconButton
                className="messenger-call__round-btn"
                aria-label="Switch to video"
                onClick={overlay.upgradeToVideo}
              >
                <Video className="h-5 w-5" />
              </IconButton>
            )}
            <IconButton
              className="messenger-call__round-btn"
              aria-label={overlay.isSpeakerOn ? 'Speaker on' : 'Speaker off'}
              onClick={overlay.toggleSpeaker}
            >
              <Volume2 className="h-5 w-5" />
            </IconButton>
            <IconButton
              className="messenger-call__round-btn messenger-call__round-btn--danger"
              aria-label="End call"
              onClick={overlay.endCall}
            >
              <PhoneOff className="h-5 w-5" />
            </IconButton>
          </>
        )}
      </div>
    </div>
  )
}
