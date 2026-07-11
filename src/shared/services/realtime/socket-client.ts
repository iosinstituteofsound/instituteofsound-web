import { io, type Socket } from 'socket.io-client'
import { env, realtimeServerUrl } from '@/shared/config/env'
import { ensureAccessToken } from '@/shared/services/api/ensure-access-token'
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
import {
  CALL_ACCEPT_EVENT,
  CALL_ANSWER_EVENT,
  CALL_END_EVENT,
  CALL_ICE_EVENT,
  CALL_INVITE_EVENT,
  CALL_OFFER_EVENT,
  CALL_REJECT_EVENT,
  type CallPeerPayload,
} from '@/modules/messenger/types/call.types'
import {
  MESSENGER_MESSAGE_EVENT,
  MESSENGER_MESSAGE_UPDATED_EVENT,
  MESSENGER_PRESENCE_EVENT,
  MESSENGER_PRESENCE_SYNC_EVENT,
  MESSENGER_READ_EVENT,
  MESSENGER_THREAD_EVENT,
  MESSENGER_TYPING_EVENT,
  PRESENCE_HEARTBEAT_EVENT,
  type DmMessage,
  type DmThreadSummary,
  type MessengerPresencePayload,
  type MessengerPresenceSyncPayload,
  type MessengerReadPayload,
  type MessengerTypingPayload,
} from '@/modules/messenger/types/messenger.types'

type AnalyticsListener = (envelope: RealtimeAnalyticsEnvelope) => void
type NotificationListener = (notification: NotificationDto) => void
type MessengerMessageListener = (message: DmMessage) => void
type MessengerMessageUpdatedListener = (message: DmMessage) => void
type MessengerThreadListener = (thread: DmThreadSummary) => void
type MessengerTypingListener = (payload: MessengerTypingPayload) => void
type MessengerReadListener = (payload: MessengerReadPayload) => void
type MessengerPresenceListener = (payload: MessengerPresencePayload) => void
type MessengerPresenceSyncListener = (payload: MessengerPresenceSyncPayload) => void
type CallListener = (payload: CallPeerPayload) => void

type CallEmitPayload = Omit<CallPeerPayload, 'fromUserId'> & { toUserId: string }

const CONNECT_TIMEOUT_MS = 15_000
const PRESENCE_HEARTBEAT_MS = 30_000

class RealtimeSocketClient {
  private socket: Socket | null = null
  private listeners = new Set<AnalyticsListener>()
  private notificationListeners = new Set<NotificationListener>()
  private messengerMessageListeners = new Set<MessengerMessageListener>()
  private messengerMessageUpdatedListeners = new Set<MessengerMessageUpdatedListener>()
  private messengerThreadListeners = new Set<MessengerThreadListener>()
  private messengerTypingListeners = new Set<MessengerTypingListener>()
  private messengerReadListeners = new Set<MessengerReadListener>()
  private messengerPresenceListeners = new Set<MessengerPresenceListener>()
  private messengerPresenceSyncListeners = new Set<MessengerPresenceSyncListener>()
  private callInviteListeners = new Set<CallListener>()
  private callAcceptListeners = new Set<CallListener>()
  private callRejectListeners = new Set<CallListener>()
  private callOfferListeners = new Set<CallListener>()
  private callAnswerListeners = new Set<CallListener>()
  private callIceListeners = new Set<CallListener>()
  private callEndListeners = new Set<CallListener>()
  private subscribedReleaseIds = new Set<string>()
  private subscribedThreadIds = new Set<string>()
  private subscribedArtistProfileId: string | null = null
  private connectListeners = new Set<() => void>()
  private connectPromise: Promise<Socket | null> | null = null
  private handlersBound = false
  private presenceHeartbeatTimer: ReturnType<typeof setInterval> | null = null

  get isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  connect(): void {
    if (!env.wsEnabled || !tokenStorage.hasSession()) return
    void this.connectAuthenticated()
  }

  disconnect(): void {
    this.stopPresenceHeartbeat()
    this.socket?.disconnect()
    this.socket = null
    this.connectPromise = null
    this.handlersBound = false
  }

  onAnalyticsUpdated(listener: AnalyticsListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  onConnect(listener: () => void): () => void {
    this.connectListeners.add(listener)
    return () => {
      this.connectListeners.delete(listener)
    }
  }

  onNotification(listener: NotificationListener): () => void {
    this.notificationListeners.add(listener)
    this.connect()
    return () => {
      this.notificationListeners.delete(listener)
    }
  }

  onMessengerMessage(listener: MessengerMessageListener): () => void {
    this.messengerMessageListeners.add(listener)
    this.connect()
    return () => this.messengerMessageListeners.delete(listener)
  }

  onMessengerMessageUpdated(listener: MessengerMessageUpdatedListener): () => void {
    this.messengerMessageUpdatedListeners.add(listener)
    return () => this.messengerMessageUpdatedListeners.delete(listener)
  }

  onMessengerThread(listener: MessengerThreadListener): () => void {
    this.messengerThreadListeners.add(listener)
    return () => this.messengerThreadListeners.delete(listener)
  }

  onMessengerTyping(listener: MessengerTypingListener): () => void {
    this.messengerTypingListeners.add(listener)
    return () => this.messengerTypingListeners.delete(listener)
  }

  onMessengerRead(listener: MessengerReadListener): () => void {
    this.messengerReadListeners.add(listener)
    return () => this.messengerReadListeners.delete(listener)
  }

  onMessengerPresence(listener: MessengerPresenceListener): () => void {
    this.messengerPresenceListeners.add(listener)
    return () => this.messengerPresenceListeners.delete(listener)
  }

  onMessengerPresenceSync(listener: MessengerPresenceSyncListener): () => void {
    this.messengerPresenceSyncListeners.add(listener)
    this.connect()
    return () => this.messengerPresenceSyncListeners.delete(listener)
  }

  onCallInvite(listener: CallListener): () => void {
    this.callInviteListeners.add(listener)
    this.connect()
    return () => this.callInviteListeners.delete(listener)
  }

  onCallAccept(listener: CallListener): () => void {
    this.callAcceptListeners.add(listener)
    this.connect()
    return () => this.callAcceptListeners.delete(listener)
  }

  onCallReject(listener: CallListener): () => void {
    this.callRejectListeners.add(listener)
    this.connect()
    return () => this.callRejectListeners.delete(listener)
  }

  onCallOffer(listener: CallListener): () => void {
    this.callOfferListeners.add(listener)
    this.connect()
    return () => this.callOfferListeners.delete(listener)
  }

  onCallAnswer(listener: CallListener): () => void {
    this.callAnswerListeners.add(listener)
    this.connect()
    return () => this.callAnswerListeners.delete(listener)
  }

  onCallIce(listener: CallListener): () => void {
    this.callIceListeners.add(listener)
    this.connect()
    return () => this.callIceListeners.delete(listener)
  }

  onCallEnd(listener: CallListener): () => void {
    this.callEndListeners.add(listener)
    this.connect()
    return () => this.callEndListeners.delete(listener)
  }

  async emitCallInvite(payload: CallEmitPayload): Promise<boolean> {
    return this.emitCallEvent(CALL_INVITE_EVENT, payload)
  }

  async emitCallAccept(payload: CallEmitPayload): Promise<boolean> {
    return this.emitCallEvent(CALL_ACCEPT_EVENT, payload)
  }

  async emitCallReject(payload: CallEmitPayload): Promise<boolean> {
    return this.emitCallEvent(CALL_REJECT_EVENT, payload)
  }

  async emitCallOffer(payload: CallEmitPayload): Promise<boolean> {
    return this.emitCallEvent(CALL_OFFER_EVENT, payload)
  }

  async emitCallAnswer(payload: CallEmitPayload): Promise<boolean> {
    return this.emitCallEvent(CALL_ANSWER_EVENT, payload)
  }

  async emitCallIce(payload: CallEmitPayload): Promise<boolean> {
    return this.emitCallEvent(CALL_ICE_EVENT, payload)
  }

  async emitCallEnd(payload: CallEmitPayload): Promise<boolean> {
    return this.emitCallEvent(CALL_END_EVENT, payload)
  }

  private async emitCallEvent(event: string, payload: CallEmitPayload): Promise<boolean> {
    if (!env.wsEnabled) return false
    try {
      const socket = await this.ensureConnected()
      if (!socket?.connected) return false
      socket.emit(event, payload)
      return true
    } catch {
      return false
    }
  }

  async subscribeThread(threadId: string): Promise<void> {
    if (!env.wsEnabled) return
    this.subscribedThreadIds.add(threadId)
    const socket = await this.ensureConnected()
    if (!socket) return
    await this.emitAck(socket, 'subscribe:thread', { threadId })
  }

  async unsubscribeThread(threadId: string): Promise<void> {
    this.subscribedThreadIds.delete(threadId)
    if (!this.socket?.connected) return
    await this.emitAck(this.socket, 'unsubscribe', { room: `thread:${threadId}` })
  }

  emitTypingStart(threadId: string): void {
    if (!threadId) return
    const emit = () => {
      if (!this.socket?.connected) return
      this.socket.emit('typing:start', { threadId })
    }
    if (this.socket?.connected) {
      emit()
      return
    }
    void this.ensureConnected().then(() => emit()).catch(() => undefined)
  }

  emitTypingStop(threadId: string): void {
    if (!threadId) return
    const emit = () => {
      if (!this.socket?.connected) return
      this.socket.emit('typing:stop', { threadId })
    }
    if (this.socket?.connected) {
      emit()
      return
    }
    void this.ensureConnected().then(() => emit()).catch(() => undefined)
  }

  async subscribeRelease(releaseId: string): Promise<void> {
    if (!env.wsEnabled) return
    this.subscribedReleaseIds.add(releaseId)
    const socket = await this.ensureConnected()
    if (!socket) return
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
    if (!socket) return
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
    this.disconnect()
    this.connect()
  }

  private async connectAuthenticated(): Promise<Socket | null> {
    if (!env.wsEnabled || !tokenStorage.hasSession()) return null
    if (this.socket?.connected) return this.socket
    if (this.connectPromise) return this.connectPromise

    this.connectPromise = this.doConnect().finally(() => {
      this.connectPromise = null
    })

    return this.connectPromise
  }

  private async doConnect(): Promise<Socket | null> {
    const token = await ensureAccessToken()
    if (!token) return null

    if (this.socket && !this.socket.connected) {
      this.socket.auth = { token }
      if (!this.handlersBound) {
        this.bindSocketHandlers(this.socket)
      }
      this.socket.connect()
      return this.waitForSocket(this.socket)
    }

    if (!this.socket) {
      this.socket = io(`${realtimeServerUrl()}${REALTIME_NAMESPACE}`, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        withCredentials: true,
        auth: { token },
      })
      this.bindSocketHandlers(this.socket)
    }

    return this.waitForSocket(this.socket)
  }

  private bindSocketHandlers(socket: Socket): void {
    if (this.handlersBound) return
    this.handlersBound = true

    socket.io.on('reconnect_attempt', () => {
      void ensureAccessToken().then((token) => {
        if (token) socket.auth = { token }
      })
    })

    socket.on('connect', () => {
      if (env.isDev) {
        console.info('[realtime] connected', socket.id)
      }
      this.startPresenceHeartbeat(socket)
      void this.resubscribeAll()
      for (const listener of this.connectListeners) {
        listener()
      }
    })

    socket.on('disconnect', () => {
      this.stopPresenceHeartbeat()
    })

    socket.on('connect_error', (err) => {
      if (env.isDev) {
        console.warn('[realtime] connect_error', err.message)
      }
    })

    socket.on(REALTIME_ANALYTICS_EVENT, (envelope: RealtimeAnalyticsEnvelope) => {
      if (env.isDev) {
        console.debug('[realtime] analytics:updated', envelope)
      }
      for (const listener of this.listeners) {
        listener(envelope)
      }
    })

    socket.on(REALTIME_NOTIFICATION_EVENT, (notification: NotificationDto) => {
      if (env.isDev) {
        console.debug('[realtime] notification:new', notification)
      }
      for (const listener of this.notificationListeners) {
        listener(notification)
      }
    })

    socket.on(MESSENGER_MESSAGE_EVENT, (message: DmMessage) => {
      for (const listener of this.messengerMessageListeners) listener(message)
    })

    socket.on(MESSENGER_MESSAGE_UPDATED_EVENT, (message: DmMessage) => {
      for (const listener of this.messengerMessageUpdatedListeners) listener(message)
    })

    socket.on(MESSENGER_THREAD_EVENT, (thread: DmThreadSummary) => {
      for (const listener of this.messengerThreadListeners) listener(thread)
    })

    socket.on(MESSENGER_TYPING_EVENT, (payload: MessengerTypingPayload) => {
      for (const listener of this.messengerTypingListeners) listener(payload)
    })

    socket.on(MESSENGER_READ_EVENT, (payload: MessengerReadPayload) => {
      for (const listener of this.messengerReadListeners) listener(payload)
    })

    socket.on(MESSENGER_PRESENCE_EVENT, (payload: MessengerPresencePayload) => {
      for (const listener of this.messengerPresenceListeners) listener(payload)
    })

    socket.on(MESSENGER_PRESENCE_SYNC_EVENT, (payload: MessengerPresenceSyncPayload) => {
      for (const listener of this.messengerPresenceSyncListeners) listener(payload)
    })

    const callEvents: Array<[string, Set<CallListener>]> = [
      [CALL_INVITE_EVENT, this.callInviteListeners],
      [CALL_ACCEPT_EVENT, this.callAcceptListeners],
      [CALL_REJECT_EVENT, this.callRejectListeners],
      [CALL_OFFER_EVENT, this.callOfferListeners],
      [CALL_ANSWER_EVENT, this.callAnswerListeners],
      [CALL_ICE_EVENT, this.callIceListeners],
      [CALL_END_EVENT, this.callEndListeners],
    ]

    for (const [event, listeners] of callEvents) {
      socket.on(event, (payload: CallPeerPayload) => {
        for (const listener of listeners) listener(payload)
      })
    }
  }

  private async ensureConnected(): Promise<Socket | null> {
    if (!env.wsEnabled) {
      throw new Error('Realtime disabled (VITE_WS_ENABLED=false)')
    }
    return this.connectAuthenticated()
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
      ...[...this.subscribedThreadIds].map((threadId) =>
        this.emitAck(this.socket!, 'subscribe:thread', { threadId }),
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

  private startPresenceHeartbeat(socket: Socket): void {
    this.stopPresenceHeartbeat()
    const emitHeartbeat = () => {
      if (socket.connected) {
        socket.emit(PRESENCE_HEARTBEAT_EVENT)
      }
    }
    emitHeartbeat()
    this.presenceHeartbeatTimer = setInterval(emitHeartbeat, PRESENCE_HEARTBEAT_MS)
  }

  private stopPresenceHeartbeat(): void {
    if (this.presenceHeartbeatTimer) {
      clearInterval(this.presenceHeartbeatTimer)
      this.presenceHeartbeatTimer = null
    }
  }
}

export const realtimeSocketClient = new RealtimeSocketClient()
