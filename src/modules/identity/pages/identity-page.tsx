import { Link } from 'react-router-dom'
import { Award, ExternalLink, Settings, Shield, UserRound } from 'lucide-react'
import { VerifiedBadge } from '@/shared/components/icons/verified-badge'
import { useIdentity } from '@/modules/identity/hooks/use-identity'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import { Button } from '@/shared/components/ui/button'
import '@/modules/identity/styles/identity-hud.css'

function formatMemberSince(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(new Date(value))
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function xpPercent(current: number, target: number) {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

function ringPercent(xpCurrent: number, xpTarget: number) {
  const levelProgress = xpPercent(xpCurrent, xpTarget)
  return Math.min(100, Math.max(8, levelProgress))
}

export function IdentityPage() {
  const { user, dexProfile, modules, authorization, gamification, theme, isLoading, isError, refetch } =
    useIdentity()

  if (isLoading) return <PageLoader />
  if (isError || !user || !dexProfile) return <ErrorState onRetry={refetch} />

  const avatarUrl = user.avatarThumbnailUrl || user.avatarUrl || dexProfile.avatarUrl
  const displayName = user.name || dexProfile.name
  const isVerified = user.isVerified || dexProfile.isVerified
  const networkScore = dexProfile.lifetimeEarned ?? dexProfile.dbScore ?? 0
  const xpPct = xpPercent(dexProfile.xp.current, dexProfile.xp.target)
  const ringPct = ringPercent(dexProfile.xp.current, dexProfile.xp.target)
  const circumference = 2 * Math.PI * 46
  const dashOffset = circumference - (ringPct / 100) * circumference
  const unlockedModules = modules.filter((m) => !m.locked)
  const badgeCount = gamification?.badges.length ?? 0
  const achievementCount = gamification?.achievements.length ?? 0
  const activeBadge = theme?.source === 'badge' ? theme.badge : null

  const fields = [
    { label: 'Username', value: user.username ? `@${user.username}` : dexProfile.username ? `@${dexProfile.username}` : '—' },
    { label: 'Email', value: user.email },
    { label: 'Bio', value: user.bio || dexProfile.bio || '—' },
    { label: 'Organization', value: user.orgLabel || dexProfile.orgLabel || '—' },
    {
      label: 'Link',
      value: user.linkUrl || dexProfile.linkUrl ? (
        <a href={user.linkUrl || dexProfile.linkUrl} target="_blank" rel="noreferrer">
          {user.linkUrl || dexProfile.linkUrl}
          <ExternalLink className="ml-1 inline h-3 w-3 opacity-70" />
        </a>
      ) : (
        '—'
      ),
    },
    { label: 'Member Since', value: formatMemberSince(user.createdAt || dexProfile.memberSince) },
    {
      label: 'Persona',
      value: user.dashboardPersona
        ? user.dashboardPersona.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : '—',
    },
  ]

  return (
    <div className="identity-hud mx-auto w-full max-w-6xl px-1 py-2 sm:px-0 sm:py-4">
      <div className="identity-hud__scanline" aria-hidden />

      <header className="relative z-2 mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="identity-hud__eyebrow">IOS://DEX · Identity Matrix</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Your <span className="text-[var(--id-accent)]">Identity</span>
          </h1>
        </div>
        <div className="identity-hud__actions">
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile">
              <UserRound className="mr-1.5 h-3.5 w-3.5" />
              Full Profile
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile/settings">
              <Settings className="mr-1.5 h-3.5 w-3.5" />
              Settings
            </Link>
          </Button>
        </div>
      </header>

      <div className="identity-hud__grid">
        <section className="identity-hud__hero">
          <p className="identity-hud__eyebrow">Subject ID · {user.id.slice(-8).toUpperCase()}</p>

          <div className="identity-hud__avatar-wrap">
            <div className="identity-hud__avatar-ring" aria-hidden>
              <svg viewBox="0 0 100 100">
                <circle className="track" cx="50" cy="50" r="46" />
                <circle
                  className="progress"
                  cx="50"
                  cy="50"
                  r="46"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
            </div>
            <div className="identity-hud__avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" />
              ) : (
                <span>{initials(displayName)}</span>
              )}
            </div>
          </div>

          <div className="identity-hud__name-row identity-hud__name">
            <span>{displayName}</span>
            {isVerified ? (
              <span className="identity-hud__verified">
                <VerifiedBadge size="sm" className="!h-3 !w-3 [&_path:first-child]:fill-[var(--id-accent)]" />
                Verified
              </span>
            ) : null}
          </div>

          <p className="identity-hud__role">
            <Shield className="mr-1 inline h-3 w-3 opacity-70" />
            {dexProfile.role}
            {activeBadge ? ` · ${activeBadge.name}` : ''}
          </p>

          <div className="identity-hud__rank-row">
            <div className="identity-hud__rank-stat">
              <b>{dexProfile.rank}</b>
              <small>Rank</small>
            </div>
            <div className="identity-hud__rank-stat">
              <b>Lv {dexProfile.level}</b>
              <small>Level</small>
            </div>
            <div className="identity-hud__xp">
              <div className="identity-hud__xp-bar">
                <div className="identity-hud__xp-fill" style={{ width: `${xpPct}%` }} />
              </div>
              <div className="identity-hud__xp-label">
                <span>XP SYNC</span>
                <span>
                  {dexProfile.xp.current.toLocaleString()} / {dexProfile.xp.target.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <section className="identity-hud__panel">
            <div className="identity-hud__panel-header">
              <span className="identity-hud__panel-title">Network Score</span>
              <span className="identity-hud__panel-led" aria-hidden />
            </div>
            <div className="identity-hud__score-display">
              <div className="identity-hud__score-value">{networkScore.toLocaleString()}</div>
              <p className="identity-hud__score-label">DB · Network Resonance</p>
            </div>
            <div className="identity-hud__stats-row">
              <div className="identity-hud__mini-stat">
                <b>{unlockedModules.length}</b>
                <small>DEX Modules</small>
              </div>
              <div className="identity-hud__mini-stat">
                <b>{badgeCount}</b>
                <small>Badges</small>
              </div>
              <div className="identity-hud__mini-stat">
                <b>{achievementCount}</b>
                <small>Achievements</small>
              </div>
            </div>
          </section>

          <section className="identity-hud__panel">
            <div className="identity-hud__panel-header">
              <span className="identity-hud__panel-title">Identity Dossier</span>
              <span className="identity-hud__panel-led" aria-hidden />
            </div>
            <div className="identity-hud__fields">
              {fields.map((field) => (
                <div key={field.label} className="identity-hud__field">
                  <span className="identity-hud__field-label">{field.label}</span>
                  <span className="identity-hud__field-value">{field.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="identity-hud__panel relative z-2 mt-4">
        <div className="identity-hud__panel-header">
          <span className="identity-hud__panel-title">DEX Systems · Role Intelligence</span>
          <span className="identity-hud__panel-led" aria-hidden />
        </div>
        <div className="identity-hud__modules">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className={`identity-hud__module${mod.locked ? ' identity-hud__module--locked' : ''}`}
            >
              <span className="identity-hud__module-icon">{mod.icon}</span>
              <div>
                <div className="identity-hud__module-name">{mod.name}</div>
                <div className="identity-hud__module-meta">
                  {mod.locked ? 'Locked · assign role to unlock' : mod.description}
                </div>
              </div>
              <span className="identity-hud__module-sync">{mod.locked ? '—' : `${mod.sync}%`}</span>
            </div>
          ))}
        </div>
      </section>

      {authorization?.assignedRoles && authorization.assignedRoles.length > 0 ? (
        <section className="identity-hud__panel relative z-2 mt-4">
          <div className="identity-hud__panel-header">
            <span className="identity-hud__panel-title">Assigned Roles</span>
            <Award className="h-3.5 w-3.5 text-[var(--id-accent)] opacity-80" aria-hidden />
          </div>
          <div className="identity-hud__fields">
            {authorization.assignedRoles.map((role) => (
              <div key={role.id} className="identity-hud__field">
                <span className="identity-hud__field-label">{role.slug}</span>
                <span className="identity-hud__field-value">
                  {role.name}
                  {authorization.activeRoleId === role.id ? (
                    <span className="ml-2 font-mono text-[0.58rem] uppercase tracking-widest text-[var(--id-accent)]">
                      Active
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
