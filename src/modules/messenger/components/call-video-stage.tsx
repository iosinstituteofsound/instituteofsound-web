import { useEffect, useRef } from 'react'
import { useCallVideoLayout } from '@/modules/messenger/hooks/use-call-video-layout'
import type { CameraFacing } from '@/modules/messenger/types/call.types'
import { UserAvatar } from '@/shared/components/user'

function CallVideo({
  stream,
  muted,
  mirror,
  className,
}: {
  stream: MediaStream
  muted?: boolean
  mirror?: boolean
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.srcObject = stream
  }, [stream])

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={
        mirror
          ? `messenger-call__video messenger-call__video--mirror ${className ?? ''}`
          : `messenger-call__video ${className ?? ''}`
      }
    />
  )
}

type CallVideoStageProps = {
  isVideo: boolean
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isCameraOff: boolean
  cameraFacing: CameraFacing
  remoteName: string
  remoteAvatarUrl: string | null
}

export function CallVideoStage({
  isVideo,
  localStream,
  remoteStream,
  isCameraOff,
  cameraFacing,
  remoteName,
  remoteAvatarUrl,
}: CallVideoStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const layout = useCallVideoLayout(containerRef)

  if (!isVideo) {
    return (
      <div className="messenger-call__avatar-stage">
        <UserAvatar name={remoteName} avatarUrl={remoteAvatarUrl ?? undefined} className="h-28 w-28" />
      </div>
    )
  }

  const primaryIsLocal = layout.primaryVideoFeed === 'local'
  const primaryStream = primaryIsLocal ? localStream : remoteStream
  const pipStream = primaryIsLocal ? remoteStream : localStream
  const pipMirror = !primaryIsLocal && cameraFacing === 'user'
  const primaryMirror = primaryIsLocal && cameraFacing === 'user'
  const showPip = Boolean(pipStream) && !layout.isPipHidden
  const pipShowsLocal = !primaryIsLocal
  const pipHasVideo = Boolean(pipStream?.getVideoTracks().length)
  const pipCameraOff = pipShowsLocal && (isCameraOff || !pipHasVideo)
  const primaryHasVideo = Boolean(primaryStream?.getVideoTracks().length)

  return (
    <div ref={containerRef} className="messenger-call__video-stage">
      {primaryStream && (primaryIsLocal ? primaryHasVideo : true) ? (
        <CallVideo
          stream={primaryStream}
          muted={primaryIsLocal}
          mirror={primaryMirror}
          className="messenger-call__primary"
        />
      ) : (
        <div className="messenger-call__avatar-stage">
          <UserAvatar name={remoteName} avatarUrl={remoteAvatarUrl ?? undefined} className="h-28 w-28" />
        </div>
      )}

      {showPip && pipStream ? (
        <div
          className="messenger-call__pip"
          style={{
            left: `${layout.pipPosition.left}px`,
            top: `${layout.pipPosition.top}px`,
            width: `${layout.pipWidth}px`,
            height: `${layout.pipHeight}px`,
          }}
          {...layout.pipPointerHandlers}
          role="button"
          aria-label="Swap video feeds"
        >
          {pipCameraOff ? (
            <div className="messenger-call__pip-placeholder">
              <UserAvatar name="You" className="h-10 w-10" />
            </div>
          ) : (
            <CallVideo
              stream={pipStream}
              muted={pipShowsLocal}
              mirror={pipMirror}
              className="messenger-call__pip-video"
            />
          )}
        </div>
      ) : null}

      {layout.isPipHidden && localStream ? (
        <button
          type="button"
          className="messenger-call__pip-restore"
          onClick={layout.restorePip}
          aria-label="Show self view"
        />
      ) : null}
    </div>
  )
}
