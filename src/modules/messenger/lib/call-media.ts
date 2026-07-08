import type { CameraFacing } from '@/modules/messenger/types/call.types'

const DEFAULT_STUN = 'stun:stun.l.google.com:19302'
const METERED_STUN = 'stun:stun.relay.metered.ca:80'

function buildTurnUrls(turnUrl: string): string[] {
  const hostMatch = turnUrl.match(/^turn[s]?:([^:?]+)/i)
  const host = hostMatch?.[1]
  if (!host?.includes('metered.ca')) {
    return [turnUrl]
  }
  return [
    `turn:${host}:80`,
    `turn:${host}:80?transport=tcp`,
    `turn:${host}:443`,
    `turns:${host}:443?transport=tcp`,
  ]
}

/** Shared ICE config — single source for voice and video calls. */
export function getCallIceServers(): RTCIceServer[] {
  const turnUrl = import.meta.env.VITE_TURN_URL?.trim()
  const turnUser = import.meta.env.VITE_TURN_USERNAME?.trim()
  const turnCred = import.meta.env.VITE_TURN_CREDENTIAL?.trim()

  const servers: RTCIceServer[] = [{ urls: DEFAULT_STUN }]

  if (turnUrl && turnUser && turnCred) {
    servers.push({ urls: METERED_STUN })
    for (const urls of buildTurnUrls(turnUrl)) {
      servers.push({ urls, username: turnUser, credential: turnCred })
    }
  }

  return servers
}

export function getCallAudioConstraints(): MediaTrackConstraints {
  return {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  }
}

export function getCallVideoConstraints(facingMode: CameraFacing = 'user'): MediaTrackConstraints {
  return {
    facingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 },
  }
}

export function getCallMediaConstraints(mode: 'voice' | 'video', facingMode: CameraFacing = 'user'): MediaStreamConstraints {
  return {
    audio: getCallAudioConstraints(),
    video: mode === 'video' ? getCallVideoConstraints(facingMode) : false,
  }
}
