import { getCallIceServers, getCallMediaConstraints } from '@/modules/messenger/lib/call-media'
import type { CallMediaMode } from '@/modules/messenger/types/call.types'

export type PeerSessionHandlers = {
  onIceCandidate: (candidate: RTCIceCandidateInit) => void
  onRemoteStream: (stream: MediaStream) => void
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
}

/** Single RTCPeerConnection wrapper — reused for voice and video (Open/Closed via mediaMode). */
export class WebRTCPeerSession {
  private readonly pc: RTCPeerConnection
  private localStream: MediaStream | null = null
  private readonly mediaMode: CallMediaMode
  private readonly handlers: PeerSessionHandlers
  private readonly pendingCandidates: RTCIceCandidateInit[] = []
  private remoteDescriptionReady = false

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

  async acquireLocalMedia(): Promise<MediaStream> {
    if (this.localStream) return this.localStream
    const stream = await navigator.mediaDevices.getUserMedia(getCallMediaConstraints(this.mediaMode))
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

  close(): void {
    this.localStream?.getTracks().forEach((track) => track.stop())
    this.localStream = null
    this.pc.close()
  }
}
