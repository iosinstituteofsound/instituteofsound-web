import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowUpRight, Flag, MessageCircle, Shield, Store, Swords } from 'lucide-react'
import {
  cancelDisband,
  claimChallenge,
  demoteMember,
  getAllianceChallenges,
  getAllianceLegacy,
  getAllianceUnlocks,
  joinAlliance,
  kickMember,
  leaveAlliance,
  promoteMember,
  startDisband,
  transferLeadership,
  updateAlliance,
} from '@/modules/tribes/api/tribes.api'
import { useAlliance, useAllianceMembershipGate } from '@/modules/tribes/hooks/use-alliances'
import { openMessengerPopup } from '@/modules/messenger/lib/messenger-popup-open'
import { ReportDialog } from '@/modules/support/components/report-dialog'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { AllianceVisibility } from '@/modules/tribes/types/alliance.types'
import '@/modules/tribes/styles/alliance.css'

type HqTab = 'overview' | 'roster' | 'wars' | 'legacy' | 'rewards'

export function AllianceHqPage() {
  const { genreSlug = 'electronic', slug = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, refetch, isLoading } = useAlliance(slug)
  const gate = useAllianceMembershipGate(slug)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<HqTab>('overview')
  const [reportOpen, setReportOpen] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: legacy = [] } = useQuery({
    queryKey: ['alliance-legacy', slug],
    queryFn: () => getAllianceLegacy(slug),
    enabled: Boolean(slug) && (tab === 'legacy' || tab === 'overview'),
  })

  const { data: challenges = [], refetch: refetchChallenges } = useQuery({
    queryKey: ['alliance-challenges', slug],
    queryFn: () => getAllianceChallenges(slug),
    enabled: Boolean(slug) && (tab === 'wars' || tab === 'overview'),
  })

  const { data: unlocks = [], refetch: refetchUnlocks } = useQuery({
    queryKey: ['alliance-unlocks', slug],
    queryFn: () => getAllianceUnlocks(slug),
    enabled: Boolean(slug) && Boolean(gate.isViewingOwnAlliance || data?.viewerMembership),
  })

  const ownedKeys = useMemo(() => new Set(unlocks.filter((u) => u.owned).map((u) => u.key)), [unlocks])

  if (isLoading || !data) {
    return (
      <div className="alliance-page">
        <p className="alliance-muted">Loading HQ…</p>
      </div>
    )
  }

  const { alliance, roster, viewerMembership } = data
  const isMember = Boolean(viewerMembership) || gate.isViewingOwnAlliance
  const threadId = alliance.allianceThreadId ?? gate.myThreadId
  const canJoin = gate.canJoinAlliance && !isMember
  const viewerRank = viewerMembership?.rank ?? -1
  const canAdmin = viewerRank >= 4
  const canSettings = viewerRank >= 5
  const midnight = ownedKeys.has('hq_theme_midnight')
  const neon = ownedKeys.has('banner_frame_neon')

  async function invalidate() {
    await refetch()
    await refetchChallenges()
    await refetchUnlocks()
    await queryClient.invalidateQueries({ queryKey: ['my-alliance'] })
    await queryClient.invalidateQueries({ queryKey: ['alliance-legacy', slug] })
  }

  async function handleJoin() {
    setBusy(true)
    setError(null)
    try {
      const needsInvite = alliance.visibility === 'invite_only' || alliance.visibility === 'private'
      if (needsInvite && !inviteCode.trim()) {
        setError('Invite code required')
        return
      }
      const joined = await joinAlliance(slug, inviteCode.trim() || undefined)
      if (joined.threadId) void openMessengerPopup({ threadId: joined.threadId })
      await invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join')
    } finally {
      setBusy(false)
    }
  }

  async function handleLeave() {
    setBusy(true)
    try {
      await leaveAlliance(slug)
      navigate(`/genres/${genreSlug}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={`alliance-page alliance-hq${midnight ? ' is-midnight' : ''}${neon ? ' is-neon' : ''}`}
    >
      <div
        className="alliance-hq__banner"
        style={alliance.bannerUrl ? { backgroundImage: `url(${alliance.bannerUrl})` } : undefined}
      >
        <div className="alliance-hq__banner-shade" />
        <div className="alliance-hq__banner-body">
          <p className="alliance-kicker">
            {alliance.genreLabel ?? alliance.genreSlug} · {alliance.reputationTag}
            {neon ? ' · neon' : ''}
          </p>
          <h1>{alliance.name}</h1>
          {alliance.tagline ? <p>{alliance.tagline}</p> : null}
          <div className="alliance-hq__stats">
            <span>
              Lv {alliance.level}
              {alliance.verified ? ' ✓' : ''}
            </span>
            <span>Score {alliance.tribeScore.toLocaleString()}</span>
            <span>
              {alliance.memberCount}/{alliance.maxMembers} members
            </span>
            <span>{alliance.signalsBalance} Signals</span>
          </div>
        </div>
      </div>

      <div className="alliance-tabs">
        {(['overview', 'roster', 'wars', 'legacy', 'rewards'] as const).map((key) => (
          <button
            key={key}
            type="button"
            className={tab === key ? 'alliance-tabs__btn is-active' : 'alliance-tabs__btn'}
            onClick={() => setTab(key)}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="alliance-hq__actions">
        {canJoin && alliance.status === 'active' ? (
          <>
            {(alliance.visibility === 'invite_only' || alliance.visibility === 'private') && (
              <input
                className="alliance-input"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Invite code"
              />
            )}
            <button type="button" className="alliance-btn" disabled={busy} onClick={() => void handleJoin()}>
              Join alliance
            </button>
          </>
        ) : null}
        {gate.isBlockedFromJoining ? (
          <p className="alliance-muted">
            You&apos;re already in {gate.myAlliance?.name}. Leave that alliance first to join another.
          </p>
        ) : null}
        {gate.isBlockedFromJoining && gate.myAlliance ? (
          <Link
            to={`/genres/${gate.myAlliance.genreSlug}/alliances/${gate.myAlliance.slug}`}
            className="alliance-btn alliance-btn--ghost"
          >
            Go to my alliance
          </Link>
        ) : null}
        {isMember && threadId ? (
          <button
            type="button"
            className="alliance-btn alliance-btn--ghost"
            onClick={() => void openMessengerPopup({ threadId })}
          >
            <MessageCircle size={16} /> Squad chat
          </button>
        ) : null}
        {isMember ? (
          <Link to={`/genres/${genreSlug}/alliances/${slug}/shop`} className="alliance-btn alliance-btn--ghost">
            <Store size={16} /> Market
          </Link>
        ) : null}
        {isMember ? (
          <button
            type="button"
            className="alliance-btn alliance-btn--danger"
            disabled={busy}
            onClick={() => void handleLeave()}
          >
            Leave
          </button>
        ) : null}
        {canSettings ? (
          <button
            type="button"
            className="alliance-btn alliance-btn--ghost"
            onClick={() => setSettingsOpen((v) => !v)}
          >
            Settings
          </button>
        ) : null}
        <Link to={`/genres/${genreSlug}`} className="alliance-btn alliance-btn--ghost">
          Back to genre <ArrowUpRight size={14} />
        </Link>
        <button type="button" className="alliance-btn alliance-btn--ghost" onClick={() => setReportOpen(true)}>
          <Flag size={16} /> Report alliance
        </button>
      </div>

      {error ? <p className="alliance-error">{error}</p> : null}

      {alliance.status === 'disbanding' ? (
        <p className="alliance-error">
          This alliance is disbanding
          {alliance.disbandAt ? ` · archives ${new Date(alliance.disbandAt).toLocaleDateString()}` : ''}.
        </p>
      ) : null}

      {settingsOpen && canSettings ? (
        <AllianceSettingsPanel
          alliance={alliance}
          onSaved={async () => {
            await invalidate()
            setSettingsOpen(false)
          }}
        />
      ) : null}

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        target={{ type: 'tribe', id: alliance.id }}
        subject="Report alliance"
        diagnosticsRoute={`alliances/${alliance.slug}`}
      />

      {tab === 'overview' ? (
        <section className="alliance-section">
          <h2>Identity score</h2>
          <div className="alliance-score-grid">
            {Object.entries(alliance.scoreBreakdown).map(([key, value]) => (
              <div key={key} className="alliance-score-card">
                <span className="alliance-score-card__label">{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className="alliance-muted">
            Weekly dB: {alliance.weeklyDb.toLocaleString()} · Season: {alliance.seasonDb.toLocaleString()}
          </p>
          {viewerMembership ? (
            <p className="alliance-membership">
              <Shield size={14} /> You are {viewerMembership.rankTitle} ({viewerMembership.platformRole})
            </p>
          ) : null}
        </section>
      ) : null}

      {tab === 'roster' ? (
        <section className="alliance-section">
          <h2>Roster</h2>
          <ul className="alliance-roster">
            {roster.map((member) => (
              <li key={member.userId} className="alliance-roster__item">
                <div>
                  <strong>{member.name}</strong>
                  <span className="alliance-muted">@{member.username ?? member.userId.slice(-6)}</span>
                </div>
                <div className="alliance-roster__meta">
                  <span>{member.rankTitle}</span>
                  <span>{member.weeklyDbContributed} wk dB</span>
                  {member.isFounder ? <span className="alliance-badge">Founder</span> : null}
                  {member.isLeader ? <span className="alliance-badge">Aegis</span> : null}
                  {canAdmin && !member.isLeader ? (
                    <span className="alliance-roster__actions">
                      <button
                        type="button"
                        className="alliance-btn alliance-btn--ghost"
                        onClick={() =>
                          void promoteMember(slug, member.userId)
                            .then(invalidate)
                            .catch((err) => alert(err instanceof Error ? err.message : 'Failed'))
                        }
                      >
                        Promote
                      </button>
                      <button
                        type="button"
                        className="alliance-btn alliance-btn--ghost"
                        onClick={() =>
                          void demoteMember(slug, member.userId)
                            .then(invalidate)
                            .catch((err) => alert(err instanceof Error ? err.message : 'Failed'))
                        }
                      >
                        Demote
                      </button>
                      <button
                        type="button"
                        className="alliance-btn alliance-btn--danger"
                        onClick={() => {
                          if (!confirm(`Kick ${member.name}?`)) return
                          void kickMember(slug, member.userId)
                            .then(invalidate)
                            .catch((err) => alert(err instanceof Error ? err.message : 'Failed'))
                        }}
                      >
                        Kick
                      </button>
                      {viewerRank >= 5 ? (
                        <button
                          type="button"
                          className="alliance-btn alliance-btn--ghost"
                          onClick={() => {
                            if (!confirm(`Transfer Aegis to ${member.name}?`)) return
                            void transferLeadership(slug, member.userId)
                              .then(invalidate)
                              .catch((err) => alert(err instanceof Error ? err.message : 'Failed'))
                          }}
                        >
                          Transfer
                        </button>
                      ) : null}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === 'wars' ? (
        <section className="alliance-section">
          <h2>
            <Swords size={18} /> Weekly mission
          </h2>
          {challenges.map((challenge) => (
            <article key={challenge.id} className="alliance-challenge">
              <h3>{challenge.title}</h3>
              <p className="alliance-muted">
                {challenge.warType} war · {challenge.progress}/{challenge.target}
              </p>
              <div
                className="alliance-board__bar"
                style={
                  {
                    '--pct': `${Math.min(100, Math.round((challenge.progress / challenge.target) * 100))}%`,
                  } as React.CSSProperties
                }
              >
                <span />
              </div>
              <p>
                Reward: {challenge.signalsReward} Signals · {challenge.status}
              </p>
              {challenge.status === 'completed' && canAdmin ? (
                <button
                  type="button"
                  className="alliance-btn"
                  onClick={() =>
                    void claimChallenge(slug, challenge.id)
                      .then(invalidate)
                      .catch((err) => alert(err instanceof Error ? err.message : 'Claim failed'))
                  }
                >
                  Claim reward
                </button>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {tab === 'legacy' ? (
        <section className="alliance-section">
          <h2>Hall of Fame</h2>
          <ul className="alliance-legacy">
            {legacy.map((event) => (
              <li key={event.id}>
                <strong>{event.kind}</strong>
                <span className="alliance-muted">
                  {event.actorName ?? event.actorId} → {event.targetName ?? ''} ·{' '}
                  {new Date(event.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === 'rewards' ? (
        <section className="alliance-section">
          <h2>Rewards</h2>
          <p className="alliance-muted">
            Treasury: {alliance.signalsBalance} Signals ·{' '}
            {unlocks.filter((u) => u.owned).length}/{unlocks.length} unlocks owned
          </p>
          <Link
            to={`/genres/${genreSlug}/alliances/${slug}/shop`}
            className="alliance-btn"
          >
            <Store size={16} /> Open alliance market
          </Link>
        </section>
      ) : null}
    </div>
  )
}

function AllianceSettingsPanel({
  alliance,
  onSaved,
}: {
  alliance: {
    slug: string
    name: string
    tagline?: string
    visibility: AllianceVisibility
    inviteCode?: string
    status: string
  }
  onSaved: () => Promise<void>
}) {
  const [name, setName] = useState(alliance.name)
  const [tagline, setTagline] = useState(alliance.tagline ?? '')
  const [visibility, setVisibility] = useState<AllianceVisibility>(alliance.visibility)
  const [busy, setBusy] = useState(false)

  return (
    <section className="alliance-section">
      <h2>Alliance settings</h2>
      <label>
        Name
        <input className="alliance-input" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Tagline
        <input className="alliance-input" value={tagline} onChange={(e) => setTagline(e.target.value)} />
      </label>
      <label>
        Visibility
        <select
          className="alliance-input"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as AllianceVisibility)}
        >
          <option value="public">Public</option>
          <option value="invite_only">Invite only</option>
          <option value="private">Private</option>
        </select>
      </label>
      {alliance.inviteCode && visibility !== 'public' ? (
        <p className="alliance-muted">
          Invite code: <strong>{alliance.inviteCode}</strong>
        </p>
      ) : null}
      <div className="alliance-hq__actions">
        <button
          type="button"
          className="alliance-btn"
          disabled={busy}
          onClick={() => {
            setBusy(true)
            void updateAlliance(alliance.slug, {
              name: name.trim(),
              tagline: tagline.trim() || undefined,
              visibility,
            })
              .then(onSaved)
              .catch((err) => alert(err instanceof Error ? err.message : 'Save failed'))
              .finally(() => setBusy(false))
          }}
        >
          Save
        </button>
        {alliance.status === 'disbanding' ? (
          <button
            type="button"
            className="alliance-btn alliance-btn--ghost"
            onClick={() =>
              void cancelDisband(alliance.slug)
                .then(onSaved)
                .catch((err) => alert(err instanceof Error ? err.message : 'Failed'))
            }
          >
            Cancel disband
          </button>
        ) : (
          <button
            type="button"
            className="alliance-btn alliance-btn--danger"
            onClick={() => {
              if (!confirm('Start disband grace period?')) return
              void startDisband(alliance.slug)
                .then(onSaved)
                .catch((err) => alert(err instanceof Error ? err.message : 'Failed'))
            }}
          >
            Start disband
          </button>
        )}
      </div>
    </section>
  )
}
