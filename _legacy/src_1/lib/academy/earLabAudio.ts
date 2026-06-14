let activeCtx: AudioContext | null = null
let activeStop: (() => void) | null = null

function getCtx(): AudioContext {
  if (!activeCtx || activeCtx.state === 'closed') {
    activeCtx = new AudioContext()
  }
  return activeCtx
}

export function stopEarLabAudio(): void {
  activeStop?.()
  activeStop = null
}

/** Pink-ish noise with optional peaking boost at `boostHz` (EQ training game). */
export function playEqTrainingSound(boostHz: number, eqEnabled: boolean, durationMs = 1400): void {
  stopEarLabAudio()
  const ctx = getCtx()
  void ctx.resume()

  const sampleRate = ctx.sampleRate
  const length = Math.floor(sampleRate * (durationMs / 1000))
  const buffer = ctx.createBuffer(2, length, sampleRate)

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    let b0 = 0
    let b1 = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.997 * b0 + 0.029 * white
      b1 = 0.985 * b1 + 0.033 * white
      data[i] = (b0 + b1) * 0.35
    }
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const lowShelf = ctx.createBiquadFilter()
  lowShelf.type = 'highpass'
  lowShelf.frequency.value = 60

  let tail: AudioNode = source
  tail.connect(lowShelf)
  tail = lowShelf

  if (eqEnabled) {
    const peak = ctx.createBiquadFilter()
    peak.type = 'peaking'
    peak.frequency.value = boostHz
    peak.Q.value = 5.5
    peak.gain.value = 14
    tail.connect(peak)
    tail = peak
  }

  const gain = ctx.createGain()
  tail.connect(gain)
  gain.connect(ctx.destination)
  gain.gain.value = 0.55

  const t = ctx.currentTime
  gain.gain.setValueAtTime(0.001, t)
  gain.gain.exponentialRampToValueAtTime(0.55, t + 0.08)
  gain.gain.setValueAtTime(0.55, t + durationMs / 1000 - 0.12)
  gain.gain.exponentialRampToValueAtTime(0.001, t + durationMs / 1000)

  source.start(t)
  source.stop(t + durationMs / 1000 + 0.02)

  activeStop = () => {
    try {
      source.stop()
      gain.disconnect()
    } catch {
      /* already stopped */
    }
  }
}
