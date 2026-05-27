import { useCallback, useEffect, useState } from 'react'
import { fetchPendingEvents, moderateEvent } from '@/lib/events/service'
import type { PendingSceneEvent } from '@/lib/events/types'
import { eventKindLabel } from '@/lib/events/constants'

export function EditorEventsPanel() {
  const [pending, setPending] = useState<PendingSceneEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setPending(await fetchPendingEvents())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const act = async (id: string, action: 'publish' | 'reject') => {
    setBusyId(id)
    setMessage('')
    try {
      await moderateEvent(id, action)
      setMessage(action === 'publish' ? 'Published on /events and scene hubs.' : 'Rejected.')
      await refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="editor-events-panel space-y-6">
      <div>
        <p className="ios-kicker">Events lite</p>
        <h2 className="font-display text-2xl font-bold">Gig listings queue</h2>
        <p className="text-sm text-muted mt-2">
          Approve underground listings before they appear on /events and scene hubs. Anti-fake guardrail.
        </p>
      </div>

      {message && <p className="text-sm text-mh-red">{message}</p>}

      {loading && <p className="text-sm text-muted">Loading queue…</p>}

      {!loading && pending.length === 0 && (
        <p className="text-sm text-muted ios-card p-6">No pending event submissions.</p>
      )}

      <ul className="space-y-4">
        {pending.map((e) => (
          <li key={e.id} className="editor-event-row ios-card">
            <p className="text-[10px] uppercase tracking-widest text-mh-red">
              {eventKindLabel(e.eventKind)} · {e.sceneCity}
              {e.sceneGenreSlug && ` · ${e.sceneGenreSlug}`}
            </p>
            <p className="font-display text-lg font-bold mt-1">{e.title}</p>
            <p className="text-sm text-muted mt-1">
              {e.venueName} · {new Date(e.startsAt).toLocaleString()}
            </p>
            <p className="text-xs text-muted mt-2">
              By {e.submitterName} (@{e.submitterHandle.replace(/^@/, '')})
            </p>
            <a
              href={e.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-mh-red mt-2 inline-block"
            >
              Verify external link →
            </a>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                className="ios-btn ios-btn-primary !text-xs"
                disabled={busyId === e.id}
                onClick={() => void act(e.id, 'publish')}
              >
                Publish
              </button>
              <button
                type="button"
                className="ios-btn ios-btn-ghost !text-xs"
                disabled={busyId === e.id}
                onClick={() => void act(e.id, 'reject')}
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
