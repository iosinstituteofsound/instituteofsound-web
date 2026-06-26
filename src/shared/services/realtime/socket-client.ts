import { io, type Socket } from 'socket.io-client'
import { env, realtimeServerUrl } from '@/shared/config/env'
import { tokenStorage } from '@/shared/services/api/token-storage'
import {
  REALTIME_ANALYTICS_EVENT,
  REALTIME_NAMESPACE,
  type RealtimeAnalyticsEnvelope,
} from '@/shared/services/realtime/realtime.types'
import {
  REALTIME_NOTIFICATION_EVENT,
  type NotificationDto,
} from '@/modules/notifications/types/notification.types'

type AnalyticsListener = (envelope: RealtimeAnalyticsEnvelope) => void
type NotificationListener = (notification: NotificationDto) => void

const CONNECT_TIMEOUT_MS = 15_000

class RealtimeSocketClient {
  private socket: Socket | null = null
  private listeners = new Set<AnalyticsListener>()
  private notificationListeners = new Set<NotificationListener>()
  private subscribedReleaseIds = new Set<string>()
  private subscribedArtistProfileId: string | null = null
  private connectPromise: Promise<Socket> | null = null

  get isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  connect(): void {
    if (!env.wsEnabled) return
    if (this.socket?.connected) return
    if (this.connectPromise) return

    const token = tokenStorage.getAccessToken()
    this.socket = io(`${realtimeServerUrl()}${REALTIME_NAMESPACE}`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      withCredentials: true,
      auth: token ? { token } : {},
    })

    this.socket.on('connect', () => {
      if (env.isDev) {
        console.info('[realtime] connected', this.socket?.id)
      }
      void this.resubscribeAll()
    })

    this.socket.on('connect_error', (err) => {
      if (env.isDev) {
        console.warn('[realtime] connect_error', err.message)
      }
    })

    this.socket.on(REALTIME_ANALYTICS_EVENT, (envelope: RealtimeAnalyticsEnvelope) => {
      if (env.isDev) {
        console.debug('[realtime] analytics:updated', envelope)
      }
      for (const listener of this.listeners) {
        listener(envelope)
      }
    })

    this.socket.on(REALTIME_NOTIFICATION_EVENT, (notification: NotificationDto) => {
      if (env.isDev) {
        console.debug('[realtime] notification:new', notification)
      }
      for (const listener of this.notificationListeners) {
        listener(notification)
      }
    })

    this.connectPromise = this.waitForSocket(this.socket).finally(() => {
      this.connectPromise = null
    })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
    this.connectPromise = null
  }

  onAnalyticsUpdated(listener: AnalyticsListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  onNotification(listener: NotificationListener): () => void {
    this.notificationListeners.add(listener)
    return () => {
      this.notificationListeners.delete(listener)
    }
  }

  async subscribeRelease(releaseId: string): Promise<void> {
    if (!env.wsEnabled) return
    this.subscribedReleaseIds.add(releaseId)
    const socket = await this.ensureConnected()
    await this.emitAck(socket, 'subscribe:release', { releaseId })
  }

  async unsubscribeRelease(releaseId: string): Promise<void> {
    this.subscribedReleaseIds.delete(releaseId)
    if (!this.socket?.connected) return
    await this.emitAck(this.socket, 'unsubscribe', { room: `release:${releaseId}` })
  }

  async subscribeArtist(artistProfileId: string): Promise<void> {
    if (!env.wsEnabled) return
    this.subscribedArtistProfileId = artistProfileId
    const socket = await this.ensureConnected()
    await this.emitAck(socket, 'subscribe:artist', { artistProfileId })
  }

  async unsubscribeArtist(artistProfileId: string): Promise<void> {
    if (this.subscribedArtistProfileId === artistProfileId) {
      this.subscribedArtistProfileId = null
    }
    if (!this.socket?.connected) return
    await this.emitAck(this.socket, 'unsubscribe', { room: `artist:${artistProfileId}` })
  }

  refreshAuth(): void {
    if (!this.socket) return
    const token = tokenStorage.getAccessToken()
    this.socket.auth = token ? { token } : {}
    if (this.socket.connected) {
      this.socket.disconnect().connect()
    }
  }

  private async ensureConnected(): Promise<Socket> {
    if (!env.wsEnabled) {
      throw new Error('Realtime disabled (VITE_WS_ENABLED=false)')
    }
    this.connect()
    if (this.connectPromise) {
      return this.connectPromise
    }
    if (this.socket?.connected) {
      return this.socket
    }
    if (!this.socket) {
      throw new Error('Realtime socket not initialized')
    }
    return this.waitForSocket(this.socket)
  }

  private waitForSocket(socket: Socket): Promise<Socket> {
    if (socket.connected) return Promise.resolve(socket)

    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        cleanup()
        reject(new Error('Realtime socket connect timeout'))
      }, CONNECT_TIMEOUT_MS)

      const onConnect = () => {
        cleanup()
        resolve(socket)
      }
      const onError = (err: Error) => {
        cleanup()
        reject(err)
      }
      const cleanup = () => {
        window.clearTimeout(timeout)
        socket.off('connect', onConnect)
        socket.off('connect_error', onError)
      }

      socket.once('connect', onConnect)
      socket.once('connect_error', onError)
    })
  }

  private async resubscribeAll(): Promise<void> {
    if (!this.socket?.connected) return
    await Promise.all([
      ...[...this.subscribedReleaseIds].map((releaseId) =>
        this.emitAck(this.socket!, 'subscribe:release', { releaseId }),
      ),
      this.subscribedArtistProfileId
        ? this.emitAck(this.socket!, 'subscribe:artist', {
            artistProfileId: this.subscribedArtistProfileId,
          })
        : Promise.resolve(),
    ])
  }

  private emitAck<TPayload extends Record<string, unknown>>(
    socket: Socket,
    event: string,
    payload: TPayload,
  ): Promise<void> {
    return new Promise((resolve) => {
      socket.emit(event, payload, (res: { ok?: boolean; error?: string } | undefined) => {
        if (env.isDev && res && res.ok === false) {
          console.warn(`[realtime] ${event} failed`, res.error)
        }
        resolve()
      })
    })
  }
}

export const realtimeSocketClient = new RealtimeSocketClient()
