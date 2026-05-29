import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { networkProfilePath } from '@/lib/community/networkPaths'
import {
  getThreadHeader,
  isMessagingAvailable,
  listMessages,
  listThreads,
  sendMessage,
  setThreadStatus,
} from '@/lib/dm/service'
import type { DmMessage, DmThreadHeader, DmThreadSummary } from '@/lib/dm/types'

type Tab = 'inbox' | 'requests'

function timeAgo(iso?: string): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString()
}

function Avatar({ url, name, size = 'md' }: { url?: string; name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={clsx(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-elevated font-display font-bold uppercase text-mh-red',
        size === 'md' ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs',
      )}
    >
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : name.charAt(0)}
    </span>
  )
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const activeThreadId = params.get('t') ?? undefined

  const [threads, setThreads] = useState<DmThreadSummary[]>([])
  const [tab, setTab] = useState<Tab>('inbox')
  const [loadingThreads, setLoadingThreads] = useState(true)

  const refreshThreads = useCallback(async () => {
    if (!user || !isMessagingAvailable()) {
      setThreads([])
      setLoadingThreads(false)
      return
    }
    const list = await listThreads()
    setThreads(list)
    setLoadingThreads(false)
  }, [user])

  useEffect(() => {
    void refreshThreads()
    const poll = window.setInterval(() => void refreshThreads(), 15000)
    return () => window.clearInterval(poll)
  }, [refreshThreads])

  const { inbox, requests } = useMemo(() => {
    const inboxThreads: DmThreadSummary[] = []
    const requestThreads: DmThreadSummary[] = []
    for (const t of threads) {
      if (t.status === 'pending' && !t.isRequester) requestThreads.push(t)
      else if (t.status !== 'declined') inboxThreads.push(t)
    }
    return { inbox: inboxThreads, requests: requestThreads }
  }, [threads])

  const openThread = (id: string) => {
    params.set('t', id)
    setParams(params, { replace: true })
  }

  const closeThread = () => {
    params.delete('t')
    setParams(params, { replace: true })
  }

  if (!user) return null

  if (!isMessagingAvailable()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-xl font-bold text-signal">Messages</h1>
        <p className="mt-3 text-sm text-muted">
          Direct messages are available on the live network. Sign in there to chat with artists and members.
        </p>
      </div>
    )
  }

  const list = tab === 'inbox' ? inbox : requests

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-4 lg:px-4 lg:py-6">
      <div className="grid h-[calc(100vh-9rem)] grid-cols-1 overflow-hidden rounded-lg border border-border bg-surface lg:grid-cols-[20rem_1fr]">
        {/* Thread list */}
        <aside
          className={clsx(
            'flex min-h-0 flex-col border-border lg:border-r',
            activeThreadId ? 'hidden lg:flex' : 'flex',
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <h1 className="font-display text-sm font-bold uppercase tracking-wider text-signal">
              Messages
            </h1>
          </div>
          <div className="flex shrink-0 gap-1 border-b border-border px-2 py-2">
            {(['inbox', 'requests'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={clsx(
                  'flex-1 rounded px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                  tab === t ? 'bg-mh-red text-white' : 'text-muted hover:bg-elevated hover:text-signal',
                )}
              >
                {t === 'inbox' ? 'Inbox' : 'Requests'}
                {t === 'requests' && requests.length > 0 ? (
                  <span className="ml-1 opacity-80">{requests.length}</span>
                ) : null}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingThreads ? (
              <p className="px-4 py-8 text-center text-sm text-muted">Loading…</p>
            ) : list.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                {tab === 'inbox' ? 'No conversations yet.' : 'No message requests.'}
              </p>
            ) : (
              list.map((t) => (
                <button
                  key={t.threadId}
                  type="button"
                  onClick={() => openThread(t.threadId)}
                  className={clsx(
                    'flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors',
                    t.threadId === activeThreadId ? 'bg-mh-red/10' : 'hover:bg-elevated',
                  )}
                >
                  <Avatar url={t.otherAvatarUrl} name={t.otherName} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-signal">{t.otherName}</span>
                      <span className="shrink-0 text-[10px] text-muted">{timeAgo(t.lastMessageAt)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className={clsx(
                          'truncate text-[12px]',
                          t.unreadCount > 0 ? 'font-semibold text-signal' : 'text-muted',
                        )}
                      >
                        {t.isRequester && t.status === 'pending' ? 'Request sent · ' : ''}
                        {t.lastSenderId === user.id ? 'You: ' : ''}
                        {t.lastMessageBody ?? 'New conversation'}
                      </span>
                      {t.unreadCount > 0 && (
                        <span className="ml-auto flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-mh-red px-1 text-[10px] font-bold text-white">
                          {t.unreadCount}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Conversation */}
        <section className={clsx('min-h-0 flex-col', activeThreadId ? 'flex' : 'hidden lg:flex')}>
          {activeThreadId ? (
            <Conversation
              key={activeThreadId}
              threadId={activeThreadId}
              meId={user.id}
              onBack={closeThread}
              onChanged={refreshThreads}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <p className="text-sm text-muted">Select a conversation to start messaging.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Conversation({
  threadId,
  meId,
  onBack,
  onChanged,
}: {
  threadId: string
  meId: string
  onBack: () => void
  onChanged: () => void
}) {
  const [header, setHeader] = useState<DmThreadHeader | null>(null)
  const [messages, setMessages] = useState<DmMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const [head, msgs] = await Promise.all([getThreadHeader(threadId), listMessages(threadId)])
    setHeader(head)
    setMessages(msgs)
  }, [threadId])

  useEffect(() => {
    void load()
    const poll = window.setInterval(() => void load(), 5000)
    return () => window.clearInterval(poll)
  }, [load])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

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
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send.')
    } finally {
      setSending(false)
    }
  }

  const respond = async (status: 'accepted' | 'declined') => {
    setError('')
    try {
      await setThreadStatus(threadId, status)
      await load()
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.')
    }
  }

  return (
    <>
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-3 lg:px-4">
        <button
          type="button"
          onClick={onBack}
          className="text-muted hover:text-signal lg:hidden"
          aria-label="Back"
        >
          <BackIcon />
        </button>
        {header && (
          <Link to={networkProfilePath(header.otherHandle)} className="flex min-w-0 items-center gap-3">
            <Avatar url={header.otherAvatarUrl} name={header.otherName} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-signal">{header.otherName}</span>
              <span className="block truncate text-[11px] text-muted">@{header.otherHandle}</span>
            </span>
          </Link>
        )}
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4 lg:px-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No messages yet — say hi.</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === meId
            return (
              <div key={m.id} className={clsx('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={clsx(
                    'max-w-[75%] break-words rounded-2xl px-3.5 py-2 text-sm',
                    mine ? 'bg-mh-red text-white' : 'bg-elevated text-signal',
                  )}
                >
                  {m.body}
                  <span className={clsx('mt-0.5 block text-[9px]', mine ? 'text-white/60' : 'text-muted')}>
                    {timeAgo(m.createdAt)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {error && <p className="px-4 pb-1 text-xs text-mh-red">{error}</p>}

      {isPendingRequestToMe ? (
        <div className="shrink-0 border-t border-border px-4 py-3">
          <p className="mb-2 text-center text-xs text-muted">
            {header?.otherName} wants to message you. Accept to reply.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void respond('declined')}
              className="flex-1 rounded border border-border py-2 text-xs font-semibold uppercase tracking-wider text-muted transition-colors hover:text-signal"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => void respond('accepted')}
              className="flex-1 rounded bg-mh-red py-2 text-xs font-semibold uppercase tracking-wider text-white"
            >
              Accept
            </button>
          </div>
        </div>
      ) : (
        <div className="shrink-0 border-t border-border px-3 py-3 lg:px-4">
          {blockedByRequest && (
            <p className="mb-2 text-center text-[11px] text-muted">
              Message request sent — you can send more once they accept.
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void submit()
                }
              }}
              rows={1}
              disabled={blockedByRequest}
              placeholder={blockedByRequest ? 'Waiting for them to accept…' : 'Message…'}
              className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-lg border border-border bg-void px-3 py-2 text-sm text-signal outline-none placeholder:text-muted focus:border-mh-red/50 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void submit()}
              disabled={sending || blockedByRequest || !draft.trim()}
              className="shrink-0 rounded-lg bg-mh-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function BackIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
    </svg>
  )
}
