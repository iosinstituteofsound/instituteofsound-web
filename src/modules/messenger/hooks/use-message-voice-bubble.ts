import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import {
  cacheVoiceDuration,
  clearVoicePlayback,
  cycleVoicePlaybackSpeed,
  getActiveVoiceMessageId,
  getCachedVoiceDuration,
  getCachedVoiceWaveform,
  getSharedVoicePlayer,
  getVoicePlaybackSpeed,
  getVoicePlayerSnapshot,
  loadVoiceWaveform,
  pauseActiveVoicePlayback,
  registerVoicePlayback,
  setActiveVoiceMessageId,
  subscribeVoicePlayback,
} from '@/modules/messenger/hooks/use-voice-playback-coordinator'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { resolveMediaUrl } from '@/shared/lib/resolve-media-url'
import {
  applyVoicePlaybackSpeed,
  prepareVoicePlayerForPlayback,
  stopVoicePlayerPlayback,
  waitForVoicePlayerLoad,
} from '@/modules/messenger/utils/voice-player-utils'
import {
  buildPseudoWaveform,
  formatPlaybackSpeedLabel,
  formatVoiceTime,
  VOICE_WAVEFORM_SOURCE_BARS,
} from '@/modules/messenger/utils/voice-waveform-utils'

type UseMessageVoiceBubbleOptions = {
  messageId: string
  mediaUrl?: string
  isOutgoing: boolean
  isTail?: boolean
  isStacked?: boolean
}

export function useMessageVoiceBubble({
  messageId,
  mediaUrl,
  isOutgoing,
  isTail = true,
  isStacked = false,
}: UseMessageVoiceBubbleOptions) {
  const resolvedUrl = resolveMediaUrl(mediaUrl) ?? null
  const player = getSharedVoicePlayer()
  const activeMessageId = useSyncExternalStore(
    subscribeVoicePlayback,
    getActiveVoiceMessageId,
    () => null,
  )
  const playbackSpeed = useSyncExternalStore(
    subscribeVoicePlayback,
    getVoicePlaybackSpeed,
    () => 1 as const,
  )
  const playerSnapshot = useSyncExternalStore(
    subscribeVoicePlayback,
    getVoicePlayerSnapshot,
    getVoicePlayerSnapshot,
  )
  const [playbackError, setPlaybackError] = useState<string | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)

  const playbackId = messageId || resolvedUrl || 'voice-message'
  const isActive = activeMessageId === playbackId
  const isPlaying = isActive && playerSnapshot.playing
  const showSpeedControl =
    isActive && playerSnapshot.isLoaded && (playerSnapshot.playing || playerSnapshot.currentTime > 0)

  useEffect(() => {
    return () => {
      if (getActiveVoiceMessageId() === playbackId) {
        clearVoicePlayback(playbackId)
      }
    }
  }, [playbackId])

  useEffect(() => {
    if (!isActive || !playerSnapshot.isLoaded || playerSnapshot.duration <= 0) return
    cacheVoiceDuration(playbackId, playerSnapshot.duration)
  }, [isActive, playbackId, playerSnapshot.duration, playerSnapshot.isLoaded])

  useEffect(() => {
    if (!isActive) return

    const onEnded = () => {
      stopVoicePlayerPlayback(player)
      clearVoicePlayback(playbackId)
      player.currentTime = 0
    }

    player.addEventListener('ended', onEnded)
    return () => player.removeEventListener('ended', onEnded)
  }, [isActive, playbackId, player])

  useEffect(() => {
    if (!isActive || !playerSnapshot.isLoaded) return
    applyVoicePlaybackSpeed(player, playbackSpeed)
  }, [isActive, playbackSpeed, player, playerSnapshot.isLoaded, playerSnapshot.playing])

  const storedWaveformVersion = useSyncExternalStore(
    subscribeVoicePlayback,
    () =>
      (getCachedVoiceWaveform(playbackId)?.length ?? 0) +
      (resolvedUrl ? getCachedVoiceWaveform(resolvedUrl)?.length ?? 0 : 0),
    () => 0,
  )

  const waveformSamples = useMemo(() => {
    const cached =
      getCachedVoiceWaveform(playbackId) ??
      (resolvedUrl ? getCachedVoiceWaveform(resolvedUrl) : null)
    if (cached?.length) {
      return cached
    }
    return buildPseudoWaveform(resolvedUrl ?? messageId, VOICE_WAVEFORM_SOURCE_BARS)
  }, [messageId, playbackId, resolvedUrl, storedWaveformVersion])

  useEffect(() => {
    if (!resolvedUrl) return
    if (getCachedVoiceWaveform(playbackId)?.length || getCachedVoiceWaveform(resolvedUrl)?.length) {
      return
    }
    void loadVoiceWaveform(playbackId, resolvedUrl)
  }, [playbackId, resolvedUrl, storedWaveformVersion])

  const toggle = useCallback(async () => {
    if (!resolvedUrl || isPreparing) return

    if (isActive && playerSnapshot.playing) {
      stopVoicePlayerPlayback(player)
      clearVoicePlayback(playbackId)
      return
    }

    setPlaybackError(null)
    setIsPreparing(true)
    pauseActiveVoicePlayback()
    usePlayerStore.getState().pause()

    try {
      setActiveVoiceMessageId(playbackId)
      prepareVoicePlayerForPlayback(player)
      player.src = resolvedUrl
      player.load()

      const loaded = await waitForVoicePlayerLoad(player)
      if (!loaded) {
        throw new Error('Voice message did not load')
      }

      registerVoicePlayback(playbackId, player)
      prepareVoicePlayerForPlayback(player)
      applyVoicePlaybackSpeed(player, getVoicePlaybackSpeed())
      await player.play()
    } catch {
      stopVoicePlayerPlayback(player)
      clearVoicePlayback(playbackId)
      setPlaybackError('Could not play voice message')
    } finally {
      setIsPreparing(false)
    }
  }, [isActive, isPreparing, playbackId, player, playerSnapshot.playing, resolvedUrl])

  const cycleSpeed = useCallback(() => {
    const next = cycleVoicePlaybackSpeed()
    if (!isActive || !playerSnapshot.isLoaded) return
    applyVoicePlaybackSpeed(player, next)
  }, [isActive, player, playerSnapshot.isLoaded])

  const seek = useCallback(
    (nextProgress: number) => {
      if (!isActive || !playerSnapshot.isLoaded || playerSnapshot.duration <= 0) return
      const target = Math.max(
        0,
        Math.min(playerSnapshot.duration, nextProgress * playerSnapshot.duration),
      )
      player.currentTime = target
    },
    [isActive, player, playerSnapshot.duration, playerSnapshot.isLoaded],
  )

  const cachedDuration = getCachedVoiceDuration(playbackId)
  const durationSec =
    isActive && playerSnapshot.isLoaded && playerSnapshot.duration > 0
      ? playerSnapshot.duration
      : cachedDuration
  const positionSec = isActive ? playerSnapshot.currentTime : 0
  const progress =
    isActive && playerSnapshot.duration > 0
      ? playerSnapshot.currentTime / playerSnapshot.duration
      : 0

  const durationLabel = isPlaying
    ? formatVoiceTime(positionSec)
    : isPreparing
      ? '...'
      : formatVoiceTime(durationSec)

  return {
    resolvedUrl,
    isPlaying,
    showSpeedControl,
    isPreparing,
    durationLabel,
    progress,
    waveformSamples,
    playbackError,
    playbackSpeedLabel: formatPlaybackSpeedLabel(playbackSpeed),
    toggle,
    cycleSpeed,
    seek,
    isOutgoing,
    isTail,
    isStacked,
  }
}
