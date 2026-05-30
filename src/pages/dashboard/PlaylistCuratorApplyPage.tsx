import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { RoleDeskLayout } from '@/components/dashboard/RoleDeskLayout'
import { MetalBadge } from '@/components/ui/MetalBadge'
import { FieldLabel } from '@/components/ui/Input'
import {
  getMyPlaylistCuratorApplications,
  submitPlaylistCuratorApplication,
} from '@/lib/playlistCurator/service'
import type { PlaylistCuratorApplication } from '@/lib/playlistCurator/types'

function statusLabel(status: PlaylistCuratorApplication['status']) {
  switch (status) {
    case 'pending':
      return 'Under review'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Declined'
  }
}

export default function PlaylistCuratorApplyPage() {
  const { user, logout, mode } = useAuth()
  const [links, setLinks] = useState<string[]>([''])
  const [note, setNote] = useState('')
  const [history, setHistory] = useState<PlaylistCuratorApplication[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user?.id) return
    void (async () => {
      setLoadingHistory(true)
      try {
        setHistory(await getMyPlaylistCuratorApplications(user.id))
      } catch {
        setHistory([])
      } finally {
        setLoadingHistory(false)
      }
    })()
  }, [user?.id])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'member') {
    return <Navigate to="/dashboard" replace />
  }

  const latest = history[0]
  const canSubmit = !latest || latest.status === 'rejected'

  const addLink = () => setLinks((prev) => [...prev, ''])
  const updateLink = (index: number, value: string) => {
    setLinks((prev) => prev.map((l, i) => (i === index ? value : l)))
  }
  const removeLink = (index: number) => {
    setLinks((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      await submitPlaylistCuratorApplication(user.id, { playlistLinks: links, note })
      setMessage('Application sent to the super editor desk for link review.')
      setLinks([''])
      setNote('')
      setHistory(await getMyPlaylistCuratorApplications(user.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RoleDeskLayout
      user={user}
      mode={mode}
      kicker="Curation path"
      title="Playlist curator application"
      summary="Share your public playlists and a short note. The super editor desk reviews every link before approval."
      badge={
        <MetalBadge variant="crimson" className="shrink-0">
          Curator apply
        </MetalBadge>
      }
      tab="apply"
      onTabChange={() => {}}
      navGroups={[
        {
          title: 'Application',
          items: [{ id: 'apply', label: 'Submit playlists' }],
        },
      ]}
      quickTiles={[]}
      headerExtra={
        <Link to="/member/dashboard" className="ios-btn ios-btn-ghost !text-xs !py-2">
          ← Member desk
        </Link>
      }
      onLogout={() => logout()}
      rootClassName="member-desk playlist-curator-apply"
    >
      {!loadingHistory && latest && (
        <section className="member-desk-panel mb-6">
          <p className="member-desk-kicker">Latest status</p>
          <p className="member-desk-heading text-lg">{statusLabel(latest.status)}</p>
          {latest.status === 'pending' && (
            <p className="member-desk-lede mt-2">
              Your playlists are in the super editor queue. We will notify you when reviewed.
            </p>
          )}
          {latest.status === 'approved' && (
            <p className="member-desk-lede mt-2">
              You are verified as a playlist curator on Institute of Sound.
            </p>
          )}
          {latest.status === 'rejected' && (
            <p className="member-desk-lede mt-2">
              {latest.reviewNotes?.trim() ||
                'This round was declined. Fix your links or note and submit again.'}
            </p>
          )}
          <ul className="mt-4 space-y-1 text-sm">
            {latest.playlistLinks.map((link) => (
              <li key={link}>
                <a href={link} target="_blank" rel="noreferrer" className="ios-link break-all">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {canSubmit ? (
        <form onSubmit={handleSubmit} className="member-desk-panel space-y-6">
          <div>
            <p className="member-desk-kicker">Playlists</p>
            <h2 className="member-desk-heading">Your playlist links</h2>
            <p className="member-desk-lede mt-2">
              Spotify, Apple Music, YouTube Music, SoundCloud, or any public playlist URL. Add as
              many as you want.
            </p>
          </div>

          <div className="space-y-3">
            {links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => updateLink(index, e.target.value)}
                  placeholder="https://open.spotify.com/playlist/…"
                  className="ios-input flex-1"
                  aria-label={`Playlist link ${index + 1}`}
                />
                <button
                  type="button"
                  className="ios-btn ios-btn-ghost shrink-0 !px-3"
                  onClick={() => removeLink(index)}
                  disabled={links.length <= 1}
                  aria-label="Remove link"
                >
                  −
                </button>
              </div>
            ))}
            <button type="button" className="ios-btn ios-btn-secondary !text-xs" onClick={addLink}>
              + Add another playlist
            </button>
          </div>

          <div>
            <FieldLabel>Note for the desk</FieldLabel>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Genre focus, follower reach, where you curate, why IOS should feature your taste…"
              className="ios-input min-h-[100px] w-full mt-2"
            />
          </div>

          {error && <p className="text-sm text-mh-red">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}

          <button
            type="submit"
            className="ios-btn ios-btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit for review →'}
          </button>
        </form>
      ) : (
        <section className="member-desk-panel">
          <p className="member-desk-lede">
            {latest?.status === 'pending'
              ? 'You cannot submit again while your application is pending.'
              : 'You are already an approved curator.'}
          </p>
          <Link to="/member/dashboard" className="ios-btn ios-btn-secondary mt-4 inline-flex">
            Back to member desk
          </Link>
        </section>
      )}
    </RoleDeskLayout>
  )
}
