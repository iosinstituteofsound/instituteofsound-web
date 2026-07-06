import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowUpRight, MessageCircle, Shield, Swords } from 'lucide-react'
import {
  getAllianceChallenges,
  getAllianceLegacy,
  joinAlliance,
  leaveAlliance,
} from '@/modules/tribes/api/tribes.api'
import { useAlliance, useAllianceMembershipGate } from '@/modules/tribes/hooks/use-alliances'
import { openMessengerPopup } from '@/modules/messenger/lib/messenger-popup-open'
import { useQuery } from '@tanstack/react-query'
import '@/modules/tribes/styles/alliance.css'

export function AllianceHqPage() {
  const { genreSlug = 'electronic', slug = '' } = useParams()
  const navigate = useNavigate()
  const { data, refetch, isLoading } = useAlliance(slug)
  const gate = useAllianceMembershipGate(slug)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<'overview' | 'roster' | 'wars' | 'legacy'>('overview')

  const { data: legacy = [] } = useQuery({
    queryKey: ['alliance-legacy', slug],
    queryFn: () => getAllianceLegacy(slug),
    enabled: Boolean(slug) && tab === 'legacy',
  })

  const { data: challenges = [] } = useQuery({
    queryKey: ['alliance-challenges', slug],
    queryFn: () => getAllianceChallenges(slug),
    enabled: Boolean(slug) && tab === 'wars',
  })

  if (isLoading || !data) {
    return <div className="alliance-page"><p className="alliance-muted">Loading HQ…</p></div>
  }

  const { alliance, roster, viewerMembership } = data
  const isMember = Boolean(viewerMembership) || gate.isViewingOwnAlliance
  const threadId = alliance.allianceThreadId ?? gate.myThreadId
  const canJoin = gate.canJoinAlliance && !isMember

  async function handleJoin() {
    setBusy(true)
    try {
      const joined = await joinAlliance(slug)
      if (joined.threadId) void openMessengerPopup({ threadId: joined.threadId })
      await refetch()
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
    <div className="alliance-page alliance-hq">
      <div
        className="alliance-hq__banner"
        style={alliance.bannerUrl ? { backgroundImage: `url(${alliance.bannerUrl})` } : undefined}
      >
        <div className="alliance-hq__banner-shade" />
        <div className="alliance-hq__banner-body">
          <p className="alliance-kicker">{alliance.genreLabel ?? alliance.genreSlug} · {alliance.reputationTag}</p>
          <h1>{alliance.name}</h1>
          {alliance.tagline ? <p>{alliance.tagline}</p> : null}
          <div className="alliance-hq__stats">
            <span>Lv {alliance.level}{alliance.verified ? ' ✓' : ''}</span>
            <span>Score {alliance.tribeScore.toLocaleString()}</span>
            <span>{alliance.memberCount}/{alliance.maxMembers} members</span>
            <span>{alliance.signalsBalance} Signals</span>
          </div>
        </div>
      </div>

      <div className="alliance-tabs">
        {(['overview', 'roster', 'wars', 'legacy'] as const).map((key) => (
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
          <button type="button" className="alliance-btn" disabled={busy} onClick={() => void handleJoin()}>
            Join alliance
          </button>
        ) : null}
        {gate.isBlockedFromJoining ? (
          <p className="alliance-muted">
            You&apos;re already in {gate.myAlliance?.name}. Leave that alliance first to join another.
          </p>
        ) : null}
        {gate.isBlockedFromJoining && gate.myAlliance ? (
          <Link to={`/genres/${gate.myAlliance.genreSlug}/alliances/${gate.myAlliance.slug}`} className="alliance-btn alliance-btn--ghost">
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
          <button type="button" className="alliance-btn alliance-btn--danger" disabled={busy} onClick={() => void handleLeave()}>
            Leave
          </button>
        ) : null}
        <Link to={`/genres/${genreSlug}`} className="alliance-btn alliance-btn--ghost">
          Back to genre <ArrowUpRight size={14} />
        </Link>
      </div>

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
          <p className="alliance-muted">Weekly dB: {alliance.weeklyDb.toLocaleString()} · Season: {alliance.seasonDb.toLocaleString()}</p>
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
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === 'wars' ? (
        <section className="alliance-section">
          <h2><Swords size={18} /> Weekly mission</h2>
          {challenges.map((challenge) => (
            <article key={challenge.id} className="alliance-challenge">
              <h3>{challenge.title}</h3>
              <p className="alliance-muted">{challenge.warType} war · {challenge.progress}/{challenge.target}</p>
              <div className="alliance-board__bar" style={{ '--pct': `${Math.min(100, Math.round((challenge.progress / challenge.target) * 100))}%` } as React.CSSProperties}>
                <span />
              </div>
              <p>Reward: {challenge.signalsReward} Signals · {challenge.status}</p>
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
                  {event.actorName ?? event.actorId} → {event.targetName ?? ''} · {new Date(event.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
