import { useCallback, useEffect, useRef, useState } from 'react'

export function useTapTempo() {
  const tapsRef = useRef<number[]>([])
  const [bpm, setBpm] = useState<number | null>(null)
  const [tapCount, setTapCount] = useState(0)

  const tap = useCallback(() => {
    const now = performance.now()
    const taps = [...tapsRef.current, now].slice(-8)
    tapsRef.current = taps
    setTapCount(taps.length)

    if (taps.length >= 2) {
      const intervals: number[] = []
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i]! - taps[i - 1]!)
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
      if (avg > 150 && avg < 2000) {
        setBpm(Math.round(60000 / avg))
      }
    }
  }, [])

  const reset = useCallback(() => {
    tapsRef.current = []
    setBpm(null)
    setTapCount(0)
  }, [])

  return { bpm, tap, reset, tapCount }
}

export function useMetronome(bpm: number) {
  const ctxRef = useRef<AudioContext | null>(null)
  const [playing, setPlaying] = useState(false)

  const click = useCallback(() => {
    const ctx = ctxRef.current ?? new AudioContext()
    ctxRef.current = ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = 880
    gain.gain.value = 0.12
    osc.connect(gain)
    gain.connect(ctx.destination)
    const t = ctx.currentTime
    gain.gain.setValueAtTime(0.12, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
    osc.start(t)
    osc.stop(t + 0.05)
  }, [])

  useEffect(() => {
    if (!playing || bpm < 30 || bpm > 300) return
    click()
    const ms = 60000 / bpm
    const id = window.setInterval(click, ms)
    return () => clearInterval(id)
  }, [playing, bpm, click])

  useEffect(() => {
    return () => {
      void ctxRef.current?.close()
    }
  }, [])

  return {
    playing,
    toggle: () => setPlaying((p) => !p),
    stop: () => setPlaying(false),
  }
}

export function useMicAnalyser(enabled: boolean) {
  const analyserRef = useRef<AnalyserNode | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setReady(false)
      return
    }

    let cancelled = false
    setError('')

    let stream: MediaStream | null = null

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        const ctx = new AudioContext()
        ctxRef.current = ctx
        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 2048
        analyser.smoothingTimeConstant = 0.75
        source.connect(analyser)
        analyserRef.current = analyser
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setError('Microphone access denied or unavailable.')
      })

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
      analyserRef.current = null
      setReady(false)
      void ctxRef.current?.close()
      ctxRef.current = null
    }
  }, [enabled])

  return { analyserRef, ready, error }
}
