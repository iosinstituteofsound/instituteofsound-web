import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useMyCrew } from '@/hooks/useCommunityCrew'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { useCommunityGenres } from '@/hooks/useCommunityGenres'
import {
  createCrew,
  joinCrew,
  leaveCrew,
  disbandCrew,
} from '@/lib/community/crewService'
import { RankBadge } from '@/components/ui/RankBadge'
import { IOSImage } from '@/components/ui/IOSImage'
import { Button } from '@/components/ui/Button'
import type { CommunityRank } from '@/types'

type PanelMode = 'overview' | 'create' | 'join'

export function CommunityCrewPanel() {
  const { crew, roster, loading, refresh, isLoggedIn } = useMyCrew()
  const { stats } = useCommunityMemberStats()
  const { genres } = useCommunityGenres()
  const [mode, setMode] = useState<PanelMode>('overview')
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [genreSlug, setGenreSlug] = useState('')
  const [inviteInput, setInviteInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isLoggedIn) {
    return (
      <section className="community-crew-panel ios-card community-crew-panel-guest">
        <h2 className="font-display text-xl font-bold">Crews</h2>
        <p className="text-sm text-muted mt-2 max-w-xl">
          Form a squad of up to 12. Combined weekly dB powers your crew on the crew wars board.
        </p>
        <Link to="/login" className="ios-btn ios-btn-metal inline-block mt-4">
          Sign in to join →
        </Link>
      </section>
    )
  }

  if (loading && !crew) {
    return (
      <section className="community-crew-panel ios-card">
        <p className="text-sm text-muted">Loading crew…</p>
      </section>
    )
  }

  const copyInvite = async () => {
    if (!crew?.inviteCode) return
    try {
      await navigator.clipboard.writeText(crew.inviteCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const handleCreate = async () => {
    setSaving(true)
    setError(null)
    try {
      await createCrew({
        name,
        tagline,
        genreSlug: genreSlug || stats?.primaryGenreSlug,
      })
      setMode('overview')
      setName('')
      setTagline('')
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create crew.')
    } finally {
      setSaving(false)
    }
  }

  const handleJoin = async () => {
    setSaving(true)
    setError(null)
    try {
      await joinCrew(inviteInput)
      setMode('overview')
      setInviteInput('')
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not join crew.')
    } finally {
      setSaving(false)
    }
  }

  const handleLeave = async () => {
    if (!confirm('Leave this crew?')) return
    setSaving(true)
    setError(null)
    try {
      await leaveCrew()
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not leave.')
    } finally {
      setSaving(false)
    }
  }

  const handleDisband = async () => {
    if (!confirm('Disband crew for all members? This cannot be undone.')) return
    setSaving(true)
    setError(null)
    try {
      await disbandCrew()
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not disband.')
    } finally {
      setSaving(false)
    }
  }

  if (crew) {
    return (
      <section className="community-crew-panel ios-card" aria-labelledby="my-crew-heading">
        <div className="community-crew-panel-head">
          <div>
            <p className="ios-kicker">Your crew</p>
            <h2 id="my-crew-heading" className="font-display text-2xl font-bold">
              {crew.name}
            </h2>
            {crew.tagline && <p className="text-sm text-muted mt-1">{crew.tagline}</p>}
          </div>
          <div className="community-crew-stat-block">
            <span className="community-crew-stat-value">{crew.weeklyDb.toLocaleString()}</span>
            <span className="community-crew-stat-label">dB this week</span>
          </div>
        </div>

        <div className="community-crew-meta-row">
          <span>
            {crew.memberCount}/{crew.maxMembers} members
          </span>
          {crew.genreSlug && (
            <span className="community-crew-genre-pill">{formatGenre(crew.genreSlug)}</span>
          )}
          <span className="text-muted">Role: {crew.myRole}</span>
        </div>

        <div className="community-crew-invite">
          <p className="community-crew-invite-label">Invite code</p>
          <div className="community-crew-invite-row">
            <code className="community-crew-invite-code">{crew.inviteCode}</code>
            <button type="button" className="ios-btn ios-btn-secondary" onClick={() => void copyInvite()}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-muted mt-2">Share with up to {crew.maxMembers - crew.memberCount} more.</p>
        </div>

        {roster.length > 0 && (
          <ol className="community-crew-roster">
            {roster.map((member, index) => (
              <li key={member.userId} className="community-crew-roster-row">
                <span className="community-crew-roster-rank">{index + 1}</span>
                <div className="community-crew-roster-avatar">
                  {member.avatarUrl ? (
                    <IOSImage src={member.avatarUrl} alt="" width={40} className="w-full h-full object-cover" />
                  ) : (
                    <span aria-hidden>{member.name.charAt(0)}</span>
                  )}
                </div>
                <div className="community-crew-roster-meta">
                  <p className="community-crew-roster-name">
                    {member.name}
                    {member.role === 'founder' && (
                      <span className="community-crew-founder-tag">Founder</span>
                    )}
                  </p>
                  <p className="community-crew-roster-handle">{member.handle}</p>
                </div>
                <div className="community-crew-roster-stats">
                  <RankBadge rank={member.rank as CommunityRank} />
                  <span className="community-crew-roster-db">{member.weeklyDb.toLocaleString()} dB</span>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="community-crew-actions">
          {crew.myRole === 'founder' ? (
            <button
              type="button"
              className="community-crew-danger"
              disabled={saving}
              onClick={() => void handleDisband()}
            >
              Disband crew
            </button>
          ) : (
            <button
              type="button"
              className="community-crew-danger"
              disabled={saving}
              onClick={() => void handleLeave()}
            >
              Leave crew
            </button>
          )}
        </div>
        {error && <p className="text-sm text-mh-red mt-3">{error}</p>}
      </section>
    )
  }

  return (
    <section className="community-crew-panel ios-card" aria-labelledby="crews-heading">
      <h2 id="crews-heading" className="font-display text-xl font-bold">
        Crews
      </h2>
      <p className="text-sm text-muted mt-2 mb-4">
        Squads of up to 12. Stack weekly dB together and climb the crew wars board.
      </p>

      <div className="community-crew-mode-tabs">
        <button
          type="button"
          className={clsx('community-crew-mode-tab', mode === 'create' && 'community-crew-mode-tab-active')}
          onClick={() => setMode('create')}
        >
          Start crew
        </button>
        <button
          type="button"
          className={clsx('community-crew-mode-tab', mode === 'join' && 'community-crew-mode-tab-active')}
          onClick={() => setMode('join')}
        >
          Join with code
        </button>
      </div>

      {mode === 'create' && (
        <div className="community-crew-form">
          <label className="community-feed-label">
            Crew name
            <input
              className="community-feed-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
              placeholder="Signal Cartel"
              disabled={saving}
            />
          </label>
          <label className="community-feed-label">
            Tagline <span className="text-muted">(optional)</span>
            <input
              className="community-feed-input"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={80}
              placeholder="Underground only."
              disabled={saving}
            />
          </label>
          <label className="community-feed-label">
            Tribe focus <span className="text-muted">(optional)</span>
            <select
              className="community-feed-input"
              value={genreSlug || stats?.primaryGenreSlug || ''}
              onChange={(e) => setGenreSlug(e.target.value)}
              disabled={saving}
            >
              <option value="">Any / none</option>
              {genres.map((g) => (
                <option key={g.id} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="button" variant="primary" disabled={saving || name.trim().length < 3} onClick={() => void handleCreate()}>
            {saving ? 'Creating…' : 'Launch crew'}
          </Button>
        </div>
      )}

      {mode === 'join' && (
        <div className="community-crew-form">
          <label className="community-feed-label">
            Invite code
            <input
              className="community-feed-input community-crew-invite-input"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={8}
              disabled={saving}
            />
          </label>
          <Button type="button" variant="primary" disabled={saving || inviteInput.trim().length < 4} onClick={() => void handleJoin()}>
            {saving ? 'Joining…' : 'Join crew'}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-mh-red mt-3">{error}</p>}
    </section>
  )
}

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
