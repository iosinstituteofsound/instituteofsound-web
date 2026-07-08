import {
  getCallAudioConstraints,
  getCallIceServers,
  getCallMediaConstraints,
  getCallVideoConstraints,
} from '@/modules/messenger/lib/call-media'
import type { CallMediaMode, CameraFacing, ConnectionQuality } from '@/modules/messenger/types/call.types'

export type PeerSessionHandlers = {
  onIceCandidate: (candidate: RTCIceCandidateInit) => void
  onRemoteStream: (stream: MediaStream) => void
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
}

/** Single RTCPeerConnection wrapper — reused for voice and video (Open/Closed via mediaMode). */
export class WebRTCPeerSession {
  private readonly pc: RTCPeerConnection
  private localStream: MediaStream | null = null
  private mediaMode: CallMediaMode
  private cameraFacing: CameraFacing = 'user'
  private readonly handlers: PeerSessionHandlers
  private readonly pendingCandidates: RTCIceCandidateInit[] = []
  private remoteDescriptionReady = false
  private lastBytesReceived = 0
  private lastStatsAt = 0

  constructor(mediaMode: CallMediaMode, handlers: PeerSessionHandlers) {
    this.mediaMode = mediaMode
    this.handlers = handlers
    this.pc = new RTCPeerConnection({ iceServers: getCallIceServers() })
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.handlers.onIceCandidate(event.candidate.toJSON())
      }
    }
    this.pc.ontrack = (event) => {
      if (event.streams[0]) {
        this.handlers.onRemoteStream(event.streams[0])
      }
    }
    this.pc.onconnectionstatechange = () => {
      this.handlers.onConnectionStateChange?.(this.pc.connectionState)
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getCameraFacing(): CameraFacing {
    return this.cameraFacing
  }

  getMediaMode(): CallMediaMode {
    return this.mediaMode
  }

  getConnectionState(): RTCPeerConnectionState {
    return this.pc.connectionState
  }

  async acquireLocalMedia(facingMode: CameraFacing = 'user'): Promise<MediaStream> {
    if (this.localStream) return this.localStream
    this.cameraFacing = facingMode
    const stream = await navigator.mediaDevices.getUserMedia(getCallMediaConstraints(this.mediaMode, facingMode))
    this.localStream = stream
    for (const track of stream.getTracks()) {
      this.pc.addTrack(track, stream)
    }
    return stream
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)
    return offer
  }

  async acceptOffer(remoteOffer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    await this.pc.setRemoteDescription(remoteOffer)
    await this.flushPendingCandidates()
    const answer = await this.pc.createAnswer()
    await this.pc.setLocalDescription(answer)
    return answer
  }

  async applyAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await this.pc.setRemoteDescription(answer)
    await this.flushPendingCandidates()
  }

  async createRenegotiationOffer(options?: { iceRestart?: boolean }): Promise<RTCSessionDescriptionInit> {
    const offer = await this.pc.createOffer({ iceRestart: options?.iceRestart ?? false })
    await this.pc.setLocalDescription(offer)
    return offer
  }

  async acceptRenegotiationOffer(remoteOffer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    return this.acceptOffer(remoteOffer)
  }

  async applyRenegotiationAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    return this.applyAnswer(answer)
  }

  async addVideoTrack(facingMode: CameraFacing = 'user'): Promise<MediaStream> {
    if (!this.localStream) {
      throw new Error('Local stream not acquired')
    }
    if (this.localStream.getVideoTracks().length > 0) {
      return this.localStream
    }

    const videoStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: getCallVideoConstraints(facingMode),
    })
    const videoTrack = videoStream.getVideoTracks()[0]
    if (!videoTrack) {
      throw new Error('Could not acquire video track')
    }

    this.localStream.addTrack(videoTrack)
    this.pc.addTrack(videoTrack, this.localStream)
    this.mediaMode = 'video'
    this.cameraFacing = facingMode
    return this.localStream
  }

  async switchCamera(): Promise<CameraFacing> {
    const videoTrack = this.localStream?.getVideoTracks()[0]
    if (!videoTrack) {
      return this.cameraFacing
    }

    const nextFacing: CameraFacing = this.cameraFacing === 'user' ? 'environment' : 'user'
    const videoStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: getCallVideoConstraints(nextFacing),
    })
    const newTrack = videoStream.getVideoTracks()[0]
    if (!newTrack) return this.cameraFacing

    const sender = this.pc.getSenders().find((s) => s.track?.kind === 'video')
    if (sender) {
      await sender.replaceTrack(newTrack)
    }

    videoTrack.stop()
    this.localStream.removeTrack(videoTrack)
    this.localStream.addTrack(newTrack)
    this.cameraFacing = nextFacing
    return this.cameraFacing
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!candidate.candidate) return
    if (!this.remoteDescriptionReady) {
      this.pendingCandidates.push(candidate)
      return
    }
    try {
      await this.pc.addIceCandidate(candidate)
    } catch {
      this.pendingCandidates.push(candidate)
    }
  }

  private async flushPendingCandidates(): Promise<void> {
    this.remoteDescriptionReady = true
    const queued = [...this.pendingCandidates]
    this.pendingCandidates.length = 0
    for (const candidate of queued) {
      try {
        await this.pc.addIceCandidate(candidate)
      } catch {
        this.pendingCandidates.push(candidate)
      }
    }
  }

  setMicEnabled(enabled: boolean): void {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled
    })
  }

  setCameraEnabled(enabled: boolean): void {
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled
    })
  }

  async getConnectionQuality(): Promise<ConnectionQuality> {
    const state = this.pc.connectionState
    if (state === 'failed' || state === 'disconnected') {
      return 'poor'
    }

    try {
      const stats = await this.pc.getStats()
      let packetsLost = 0
      let packetsReceived = 0
      let bytesReceived = 0

      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          packetsLost += report.packetsLost ?? 0
          packetsReceived += report.packetsReceived ?? 0
          bytesReceived += report.bytesReceived ?? 0
        }
      })

      const now = Date.now()
      let bitrateKbps = 0
      if (this.lastStatsAt > 0 && now > this.lastStatsAt) {
        const deltaBytes = Math.max(0, bytesReceived - this.lastBytesReceived)
        const deltaSec = (now - this.lastStatsAt) / 1000
        bitrateKbps = (deltaBytes * 8) / deltaSec / 1000
      }
      this.lastBytesReceived = bytesReceived
      this.lastStatsAt = now

      const totalPackets = packetsLost + packetsReceived
      const lossRate = totalPackets > 0 ? packetsLost / totalPackets : 0

      if (lossRate > 0.05 || bitrateKbps < 150) return 'poor'
      if (lossRate > 0.02 || bitrateKbps < 400) return 'fair'
      return 'good'
    } catch {
      return state === 'connected' ? 'good' : 'fair'
    }
  }

  close(): void {
    this.localStream?.getTracks().forEach((track) => track.stop())
    this.localStream = null
    this.pc.close()
  }
}
