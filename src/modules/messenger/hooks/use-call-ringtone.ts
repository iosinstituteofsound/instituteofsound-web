import { useEffect, useRef } from 'react'
import { useMessengerCallStore } from '@/modules/messenger/store/messenger-call-store'

function playWebRingtone(audioContext: AudioContext, gainNode: GainNode): void {
  const now = audioContext.currentTime
  const frequencies = [440, 480]
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.value = freq
    oscillator.connect(gainNode)
    oscillator.start(now + index * 0.02)
    oscillator.stop(now + 0.35)
  })
}

export function useCallRingtone() {
  const phase = useMessengerCallStore((s) => s.phase)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  useEffect(() => {
    if (phase !== 'incoming') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close().catch(() => undefined)
        audioContextRef.current = null
        gainNodeRef.current = null
      }
      return undefined
    }

    const audioContext = new AudioContext()
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 0.12
    gainNode.connect(audioContext.destination)
    audioContextRef.current = audioContext
    gainNodeRef.current = gainNode

    playWebRingtone(audioContext, gainNode)
    intervalRef.current = setInterval(() => {
      if (audioContextRef.current && gainNodeRef.current) {
        playWebRingtone(audioContextRef.current, gainNodeRef.current)
      }
    }, 1400)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close().catch(() => undefined)
        audioContextRef.current = null
        gainNodeRef.current = null
      }
    }
  }, [phase])
}
