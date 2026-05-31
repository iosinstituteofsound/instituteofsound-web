import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  getThreadHeader,
  listMessages,
  sendMessage,
  setThreadStatus,
  DM_EVENT,
} from '@/lib/dm/service'
import type { DmMessage, DmThreadHeader } from '@/lib/dm/types'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { useMessengerPopup } from '@/context/MessengerPopupContext'

function formatDayDivider(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface MessengerChatWindowProps {
  threadId: string
  minimized: boolean
}

export function MessengerChatWindow({ threadId, minimized }: MessengerChatWindowProps) {
  const { user } = useAuth()
  const { closeChat, toggleMinimize, focusChat } = useMessengerPopup()
  const [header, setHeader] = useState<DmThreadHeader | null>(null)
  const [messages, setMessages] = useState<DmMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const head = await getThreadHeader(threadId).catch(() => null)
    if (head) setHeader(head)
    try {
      const msgs = await listMessages(threadId)
      setMessages(msgs)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load messages.')
    }
  }, [threadId])

  useEffect(() => {
    void load()
    const poll = window.setInterval(() => void load(), 5000)
    const onDm = () => void load()
    window.addEventListener(DM_EVENT, onDm)
    return () => {
      window.clearInterval(poll)
      window.removeEventListener(DM_EVENT, onDm)
    }
  }, [load])

  useEffect(() => {
    if (!minimized) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, minimized])

  if (!user) return null

  const meId = user.id
  const isPendingRequestToMe = header?.status === 'pending' && !header.isRequester
  const isMyPendingRequest = header?.status === 'pending' && header.isRequester
  const myMessageCount = messages.filter((m) => m.senderId === meId).length
  const blockedByRequest = isMyPendingRequest && myMessageCount >= 1

  const submit = async () => {
    const body = draft.trim()
    if (!body || sending) return
    setError('')
    setSending(true)
    try {
      await sendMessage(threadId, body)
      setDraft('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send.')
    } finally {
      setSending(false)
    }
  }

  const respond = async (status: 'accepted' | 'declined') => {
    try {
      await setThreadStatus(threadId, status)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.')
    }
  }

  return (
    <div
      className={clsx('v2-messenger-window', minimized && 'v2-messenger-window--minimized')}
      onMouseDown={() => focusChat(threadId)}
    >
      <header className="v2-messenger-window__head">
        <Link
          to={header ? networkProfilePath(header.otherHandle) : '#'}
          className="v2-messenger-window__who"
        >
          <span className="v2-messenger-window__avatar">
            {header?.otherAvatarUrl ? (
              <img src={header.otherAvatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              (header?.otherName ?? '?').charAt(0)
            )}
          </span>
          <span className="v2-messenger-window__name">{header?.otherName ?? 'Loading…'}</span>
        </Link>
        <div className="v2-messenger-window__actions">
          <button type="button" className="v2-messenger-window__icon" aria-label="Minimize" onClick={() => toggleMinimize(threadId)}>
            <MinimizeIcon />
          </button>
          <button type="button" className="v2-messenger-window__icon" aria-label="Close" onClick={() => closeChat(threadId)}>
            <CloseIcon />
          </button>
        </div>
      </header>

      {!minimized && (
        <>
          <div ref={scrollRef} className="v2-messenger-window__body">
            <p className="v2-messenger-window__encrypt">
              Messages on Institute of Sound are private between you and this operator.
            </p>
            {messages.length > 0 && (
              <p className="v2-messenger-window__day">{formatDayDivider(messages[0]!.createdAt)}</p>
            )}
            {messages.length === 0 ? (
              <p className="v2-messenger-window__empty">Say hi — start the thread.</p>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === meId
                return (
                  <div key={m.id} className={clsx('v2-messenger-window__row', mine && 'is-mine')}>
                    <div className={clsx('v2-messenger-window__bubble', mine && 'is-mine')}>
                      {m.body}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {error && <p className="v2-messenger-window__error">{error}</p>}

          {isPendingRequestToMe ? (
            <div className="v2-messenger-window__request">
              <p>{header?.otherName} wants to message you.</p>
              <div className="v2-messenger-window__request-actions">
                <button type="button" onClick={() => void respond('declined')}>
                  Decline
                </button>
                <button type="button" className="is-primary" onClick={() => void respond('accepted')}>
                  Accept
                </button>
              </div>
            </div>
          ) : (
            <div className="v2-messenger-window__composer">
              {blockedByRequest && (
                <p className="v2-messenger-window__hint">Waiting for them to accept your request.</p>
              )}
              <div className="v2-messenger-window__input-row">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void submit()
                    }
                  }}
                  disabled={blockedByRequest}
                  placeholder={blockedByRequest ? 'Request pending…' : 'Aa'}
                  aria-label="Message"
                />
                <button
                  type="button"
                  className="v2-messenger-window__send"
                  disabled={sending || blockedByRequest || !draft.trim()}
                  onClick={() => void submit()}
                  aria-label="Send"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MinimizeIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
      <path d="M4 12h16v2H4z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M3.4 20.4l17.45-7.45c.81-.35.81-1.49 0-1.84L3.4 3.66c-.77-.33-1.53.44-1.2 1.21L4.5 11.5 2.2 19.2c-.33.77.43 1.54 1.2 1.2z" />
    </svg>
  )
}
