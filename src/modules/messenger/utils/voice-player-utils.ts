import type { VoicePlaybackSpeed } from '@/modules/messenger/utils/voice-waveform-utils'

const LOAD_TIMEOUT_MS = 12_000

export async function waitForVoicePlayerLoad(
  player: HTMLAudioElement,
  timeoutMs = LOAD_TIMEOUT_MS,
): Promise<boolean> {
  if (player.readyState >= HTMLMediaElement.HAVE_METADATA) return true

  return new Promise((resolve) => {
    const onReady = () => {
      cleanup()
      resolve(true)
    }
    const onError = () => {
      cleanup()
      resolve(false)
    }
    const timeout = window.setTimeout(() => {
      cleanup()
      resolve(player.readyState >= HTMLMediaElement.HAVE_METADATA)
    }, timeoutMs)

    const cleanup = () => {
      window.clearTimeout(timeout)
      player.removeEventListener('loadedmetadata', onReady)
      player.removeEventListener('canplay', onReady)
      player.removeEventListener('error', onError)
    }

    player.addEventListener('loadedmetadata', onReady)
    player.addEventListener('canplay', onReady)
    player.addEventListener('error', onError)
  })
}

export function prepareVoicePlayerForPlayback(player: HTMLAudioElement): void {
  player.loop = false
}

export function applyVoicePlaybackSpeed(player: HTMLAudioElement, speed: VoicePlaybackSpeed): void {
  player.defaultPlaybackRate = speed
  player.playbackRate = speed
  try {
    ;(player as HTMLMediaElement & { preservesPitch?: boolean }).preservesPitch = true
  } catch {
    // noop
  }
}

export function stopVoicePlayerPlayback(player: HTMLAudioElement): void {
  player.pause()
  player.loop = false
}
