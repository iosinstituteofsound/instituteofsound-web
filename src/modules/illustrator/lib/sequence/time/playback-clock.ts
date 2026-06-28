export type PlaybackClockState = {
  timeMs: number
  playing: boolean
  fps: number
}

export class PlaybackClock {
  private timeMs = 0
  private playing = false
  private fps = 24
  private lastTickAt: number | null = null

  getState(): PlaybackClockState {
    return { timeMs: this.timeMs, playing: this.playing, fps: this.fps }
  }

  setFps(fps: number): void {
    this.fps = Math.max(1, fps)
  }

  seek(timeMs: number): void {
    this.timeMs = Math.max(0, timeMs)
    this.lastTickAt = null
  }

  play(): void {
    this.playing = true
    this.lastTickAt = null
  }

  pause(): void {
    this.playing = false
    this.lastTickAt = null
  }

  toggle(): void {
    if (this.playing) this.pause()
    else this.play()
  }

  /** Advance clock by real delta; returns new timeMs */
  tick(nowMs: number, durationMs: number, mode: 'loop' | 'ping-pong' | 'one-shot' = 'loop'): number {
    if (!this.playing) return this.timeMs
    if (this.lastTickAt == null) {
      this.lastTickAt = nowMs
      return this.timeMs
    }
    const delta = nowMs - this.lastTickAt
    this.lastTickAt = nowMs
    this.timeMs += delta

    if (mode === 'loop' && this.timeMs >= durationMs) {
      this.timeMs = this.timeMs % Math.max(durationMs, 1)
    } else if (this.timeMs >= durationMs) {
      this.timeMs = durationMs
      this.playing = false
      this.lastTickAt = null
    }

    return this.timeMs
  }
}
