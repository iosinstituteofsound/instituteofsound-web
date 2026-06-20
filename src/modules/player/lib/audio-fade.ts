export const PLAYER_FADE_MS = 140

type FadeHandle = { frameId: number | null }

export function createFadeHandle(): FadeHandle {
  return { frameId: null }
}

export function cancelAudioFade(handle: FadeHandle) {
  if (handle.frameId != null) {
    cancelAnimationFrame(handle.frameId)
    handle.frameId = null
  }
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

export function fadeAudioVolume(
  audio: HTMLAudioElement,
  to: number,
  ms: number,
  handle: FadeHandle,
): Promise<void> {
  cancelAudioFade(handle)

  const from = audio.volume
  const target = Math.min(1, Math.max(0, to))

  if (ms <= 0 || Math.abs(from - target) < 0.001) {
    audio.volume = target
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const start = performance.now()

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / ms)
      audio.volume = from + (target - from) * smoothstep(progress)

      if (progress < 1) {
        handle.frameId = requestAnimationFrame(step)
        return
      }

      handle.frameId = null
      audio.volume = target
      resolve()
    }

    handle.frameId = requestAnimationFrame(step)
  })
}
