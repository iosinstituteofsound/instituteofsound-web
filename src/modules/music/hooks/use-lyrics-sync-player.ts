import { useCallback, useEffect, useRef, useState } from 'react'

const SEEK_STEP_MS = 5000
const TIMEUPDATE_THROTTLE_MS = 80

export function useLyricsSyncPlayer(audioUrl?: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentMs, setCurrentMs] = useState(0)
  const [durationMs, setDurationMs] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!audioUrl) {
      audioRef.current = null
      setCurrentMs(0)
      setDurationMs(0)
      setIsPlaying(false)
      return
    }

    const audio = new Audio(audioUrl)
    audioRef.current = audio
    let lastTick = 0

    const onTimeUpdate = () => {
      const now = performance.now()
      if (now - lastTick < TIMEUPDATE_THROTTLE_MS) return
      lastTick = now
      setCurrentMs(audio.currentTime * 1000)
    }
    const onLoaded = () => setDurationMs((audio.duration || 0) * 1000)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('durationchange', onLoaded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('durationchange', onLoaded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audioRef.current = null
    }
  }, [audioUrl])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) void audio.play()
    else audio.pause()
  }, [])

  const seekTo = useCallback((ms: number) => {
    const audio = audioRef.current
    if (!audio) return
    const clamped = Math.max(0, Math.min(ms, (audio.duration || 0) * 1000))
    audio.currentTime = clamped / 1000
    setCurrentMs(clamped)
  }, [])

  const seekBy = useCallback(
    (deltaMs: number) => {
      seekTo(currentMs + deltaMs)
    },
    [currentMs, seekTo],
  )

  const playFrom = useCallback((ms: number) => {
    seekTo(ms)
    void audioRef.current?.play()
  }, [seekTo])

  return {
    audioRef,
    currentMs,
    durationMs,
    isPlaying,
    togglePlay,
    seekTo,
    seekBy,
    playFrom,
    seekStepMs: SEEK_STEP_MS,
  }
}
