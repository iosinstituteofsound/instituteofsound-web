import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react'
import { meQueryKey } from '@/modules/auth/hooks/use-auth'
import { messengerCallController } from '@/modules/messenger/lib/messenger-call-controller'
import { isCallActive, useMessengerCallStore } from '@/modules/messenger/store/messenger-call-store'
import { UserAvatar } from '@/shared/components/user'
import { IconButton } from '@/shared/components/ui/icon-button'
import { Button } from '@/shared/components/ui/button'
import type { MeResponse } from '@/shared/types/auth.types'
import '@/modules/messenger/styles/messenger-call.css'

function CallVideo({ stream, muted, mirror, className }: { stream: MediaStream | null; muted?: boolean; mirror?: boolean; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.srcObject = stream
  }, [stream])

  if (!stream) return null

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={mirror ? `messenger-call__video messenger-call__video--mirror ${className ?? ''}` : `messenger-call__video ${className ?? ''}`}
    />
  )
}

export function MessengerCallOverlay() {
  const queryClient = useQueryClient()
  const phase = useMessengerCallStore((s) => s.phase)
  const remoteName = useMessengerCallStore((s) => s.remoteName)
  const remoteAvatarUrl = useMessengerCallStore((s) => s.remoteAvatarUrl)
  const mediaMode = useMessengerCallStore((s) => s.mediaMode)
  const isMuted = useMessengerCallStore((s) => s.isMuted)
  const isCameraOff = useMessengerCallStore((s) => s.isCameraOff)
  const localStream = useMessengerCallStore((s) => s.localStream)
  const remoteStream = useMessengerCallStore((s) => s.remoteStream)
  const error = useMessengerCallStore((s) => s.error)

  if (!isCallActive(phase)) return null

  const viewer = queryClient.getQueryData<MeResponse>(meQueryKey)
  const isVideo = mediaMode === 'video'
  const statusLabel =
    phase === 'incoming'
      ? `${isVideo ? 'Video' : 'Voice'} call`
      : phase === 'outgoing'
        ? 'Calling…'
        : phase === 'connecting'
          ? 'Connecting…'
          : phase === 'active'
            ? 'Connected'
            : error ?? 'Call ended'

  return (
    <div className="messenger-call" role="dialog" aria-label="Messenger call">
      <div className="messenger-call__stage">
        {isVideo && remoteStream ? (
          <CallVideo stream={remoteStream} className="messenger-call__remote" />
        ) : (
          <div className="messenger-call__avatar-stage">
            <UserAvatar name={remoteName ?? 'Contact'} avatarUrl={remoteAvatarUrl ?? undefined} className="h-28 w-28" />
          </div>
        )}

        {isVideo && localStream && !isCameraOff ? (
          <CallVideo stream={localStream} muted mirror className="messenger-call__pip" />
        ) : null}

        <div className="messenger-call__meta">
          <div className="messenger-call__name">{remoteName ?? 'Contact'}</div>
          <div className="messenger-call__status">{statusLabel}</div>
        </div>
      </div>

      <div className="messenger-call__controls">
        {phase === 'incoming' ? (
          <>
            <Button variant="destructive" className="messenger-call__action" onClick={() => messengerCallController.rejectIncoming()}>
              Decline
            </Button>
            <Button
              className="messenger-call__action"
              onClick={() => {
                if (!viewer?.user.id) return
                void messengerCallController.acceptIncoming({
                  userId: viewer.user.id,
                  displayName: viewer.user.name,
                  avatarUrl: viewer.user.avatarThumbnailUrl ?? viewer.user.avatarUrl,
                })
              }}
            >
              Accept
            </Button>
          </>
        ) : (
          <>
            <IconButton
              className="messenger-call__round-btn"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              onClick={() => messengerCallController.toggleMute()}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </IconButton>
            {isVideo ? (
              <IconButton
                className="messenger-call__round-btn"
                aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                onClick={() => messengerCallController.toggleCamera()}
              >
                {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </IconButton>
            ) : null}
            <IconButton
              className="messenger-call__round-btn messenger-call__round-btn--danger"
              aria-label="End call"
              onClick={() => messengerCallController.endCall('hangup')}
            >
              <PhoneOff className="h-5 w-5" />
            </IconButton>
          </>
        )}
      </div>
    </div>
  )
}
