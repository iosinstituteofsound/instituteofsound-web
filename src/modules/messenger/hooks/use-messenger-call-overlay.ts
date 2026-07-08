import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { meQueryKey } from '@/modules/auth/hooks/use-auth'
import { useCallQuality } from '@/modules/messenger/hooks/use-call-quality'
import { useCallRingtone } from '@/modules/messenger/hooks/use-call-ringtone'
import { messengerCallController } from '@/modules/messenger/lib/messenger-call-controller'
import { isCallActive, useMessengerCallStore } from '@/modules/messenger/store/messenger-call-store'
import type { MeResponse } from '@/shared/types/auth.types'

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function useMessengerCallOverlay() {
  const queryClient = useQueryClient()
  const phase = useMessengerCallStore((s) => s.phase)
  const remoteName = useMessengerCallStore((s) => s.remoteName)
  const remoteAvatarUrl = useMessengerCallStore((s) => s.remoteAvatarUrl)
  const mediaMode = useMessengerCallStore((s) => s.mediaMode)
  const isMuted = useMessengerCallStore((s) => s.isMuted)
  const isCameraOff = useMessengerCallStore((s) => s.isCameraOff)
  const isSpeakerOn = useMessengerCallStore((s) => s.isSpeakerOn)
  const localStream = useMessengerCallStore((s) => s.localStream)
  const remoteStream = useMessengerCallStore((s) => s.remoteStream)
  const error = useMessengerCallStore((s) => s.error)
  const startedAt = useMessengerCallStore((s) => s.startedAt)
  const cameraFacing = useMessengerCallStore((s) => s.cameraFacing)
  const answerWithMuted = useMessengerCallStore((s) => s.answerWithMuted)
  const answerWithCameraOff = useMessengerCallStore((s) => s.answerWithCameraOff)
  const [now, setNow] = useState(Date.now())
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)

  useCallRingtone()
  const { connectionQuality } = useCallQuality()

  const visible = isCallActive(phase)
  const isVideo = mediaMode === 'video'

  useEffect(() => {
    void navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoInputs = devices.filter((device) => device.kind === 'videoinput')
        setHasMultipleCameras(videoInputs.length > 1)
      })
      .catch(() => setHasMultipleCameras(false))
  }, [])

  useEffect(() => {
    if (phase !== 'active' || !startedAt) return undefined
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [phase, startedAt])

  const statusLabel = useMemo(() => {
    if (phase === 'incoming') return `${isVideo ? 'Video' : 'Voice'} call`
    if (phase === 'outgoing') return 'Calling…'
    if (phase === 'connecting') return 'Connecting…'
    if (phase === 'active') {
      if (startedAt) return formatDuration(now - startedAt)
      return 'Connected'
    }
    return error ?? 'Call ended'
  }, [error, isVideo, now, phase, startedAt])

  const viewer = queryClient.getQueryData<MeResponse>(meQueryKey)

  const acceptIncoming = () => {
    if (!viewer?.user.id) return
    void messengerCallController.acceptIncoming({
      userId: viewer.user.id,
      displayName: viewer.user.name,
      avatarUrl: viewer.user.avatarThumbnailUrl ?? viewer.user.avatarUrl,
    })
  }

  return {
    visible,
    phase,
    remoteName,
    remoteAvatarUrl,
    isVideo,
    isMuted,
    isCameraOff,
    isSpeakerOn,
    localStream,
    remoteStream,
    cameraFacing,
    connectionQuality,
    answerWithMuted,
    answerWithCameraOff,
    hasMultipleCameras,
    statusLabel,
    acceptIncoming,
    rejectIncoming: () => messengerCallController.rejectIncoming(),
    endCall: () => messengerCallController.endCall('hangup'),
    toggleMute: () => messengerCallController.toggleMute(),
    toggleCamera: () => messengerCallController.toggleCamera(),
    toggleSpeaker: () => messengerCallController.toggleSpeaker(),
    flipCamera: () => void messengerCallController.flipCamera(),
    upgradeToVideo: () => void messengerCallController.upgradeToVideo(),
    toggleAnswerWithMuted: () =>
      messengerCallController.setAnswerWithMuted(!answerWithMuted),
    toggleAnswerWithCameraOff: () =>
      messengerCallController.setAnswerWithCameraOff(!answerWithCameraOff),
  }
}
