import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { roleLabel } from '@/lib/auth/roles'
import { updateUserProfile } from '@/lib/auth/profile'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { DashboardCommunityHub } from '@/components/dashboard/DashboardCommunityHub'
import { MemberTrustPanel } from '@/components/dashboard/MemberTrustPanel'
import type { DashboardPersona } from '@/lib/auth/types'

const PERSONA_OPTIONS: {
  id: DashboardPersona
  title: string
  subtitle: string
}[] = [
  {
    id: 'event_promoter',
    title: 'Event Promoter',
    subtitle: 'Publish gigs, push RSVPs, and activate local scenes.',
  },
  {
    id: 'artist_manager',
    title: 'Artist Manager',
    subtitle: 'Coordinate releases, collabs, and artist growth loops.',
  },
  {
    id: 'label',
    title: 'Label',
    subtitle: 'Operate roster planning, release calendars, and coverage.',
  },
  {
    id: 'brand',
    title: 'Brand',
    subtitle: 'Run campaigns with scenes, creators, and event partnerships.',
  },
]

const PERSONA_ROLE_INFO: Record<
  DashboardPersona,
  { roleSummary: string; canDo: string[] }
> = {
  event_promoter: {
    roleSummary:
      'Event Promoters run live experiences and audience growth across city and genre scenes.',
    canDo: [
      'Publish and manage event listings',
      'Track RSVP momentum for upcoming gigs',
      'Coordinate crew and partner calls through collab',
    ],
  },
  artist_manager: {
    roleSummary:
      'Artist Managers coordinate release operations, growth strategy, and artist opportunities.',
    canDo: [
      'Plan artist release workflows',
      'Route high-quality drops toward editorial visibility',
      'Manage collaborator sourcing and campaign timing',
    ],
  },
  label: {
    roleSummary:
      'Labels manage roster operations, release pipelines, and scene-driven promotion.',
    canDo: [
      'Operate roster and launch planning',
      'Map releases to city/genre scene opportunities',
      'Coordinate events and distribution visibility loops',
    ],
  },
  brand: {
    roleSummary:
      'Brands activate music-led campaigns with scene, event, and creator collaboration.',
    canDo: [
      'Identify relevant scene hubs',
      'Build campaign partnerships with artists and promoters',
      'Track activation opportunities across events and collab',
    ],
  },
}

const PERSONA_CONTENT: Record<
  DashboardPersona,
  {
    badge: string
    heading: string
    summary: string
    priorities: string[]
    workflow: { stage: string; objective: string }[]
    toolkit: string[]
    actions: { to: string; label: string; primary?: boolean }[]
  }
> = {
  event_promoter: {
    badge: 'Promoter workspace',
    heading: 'Drive event momentum',
    summary:
      'Use Events + Scenes to promote lineups, track demand via RSVPs, and build recurring city traffic.',
    priorities: [
      'Submit and manage upcoming gigs',
      'Post collab calls for crew / tech / support acts',
      'Push audience traffic to city × genre hubs',
    ],
    workflow: [
      { stage: 'Pre-launch', objective: 'Announce lineup + open RSVP early' },
      { stage: 'Hype week', objective: 'Drive scene hub + collab visibility' },
      { stage: 'Post-show', objective: 'Convert attendees into recurring community' },
    ],
    toolkit: [
      'Event submission checklist',
      'City × genre targeting view',
      'Crew sourcing via collab board',
    ],
    actions: [
      { to: '/events', label: 'Open events board', primary: true },
      { to: '/scenes', label: 'Open scene hubs' },
      { to: '/collab', label: 'Find collaborators' },
    ],
  },
  artist_manager: {
    badge: 'Manager workspace',
    heading: 'Coordinate artist growth',
    summary:
      'Plan releases, build profile visibility, and keep your artists active across community and editorial opportunities.',
    priorities: [
      'Prepare artist profile + release schedule',
      'Use collab board for producers and featured artists',
      'Route strongest tracks to editorial submit flow',
    ],
    workflow: [
      { stage: 'Asset prep', objective: 'Profile, links, visual pack, release notes' },
      { stage: 'Release run', objective: 'Coordinate scenes, collabs, and timing' },
      { stage: 'Momentum', objective: 'Push editorial + event opportunities' },
    ],
    toolkit: [
      'Release planning lane',
      'Editorial-ready pitch framing',
      'Cross-artist collaboration tracker',
    ],
    actions: [
      { to: '/member/upgrade', label: 'Upgrade to artist studio', primary: true },
      { to: '/collab', label: 'Open collab board' },
      { to: '/discover', label: 'Track discovery surface' },
    ],
  },
  label: {
    badge: 'Label workspace',
    heading: 'Manage roster and releases',
    summary:
      'Keep your catalog visible with artist pages, release drops, and scene-aware promotion loops.',
    priorities: [
      'Launch or refresh artist pages for signed acts',
      'Build release calendar with city/genre discovery in mind',
      'Use events + collab to support launches',
    ],
    workflow: [
      { stage: 'Roster setup', objective: 'Activate artist pages + release slots' },
      { stage: 'Campaigns', objective: 'Sync events, scenes, and collab channels' },
      { stage: 'Optimization', objective: 'Scale acts showing traction fastest' },
    ],
    toolkit: [
      'Roster visibility workflow',
      'Launch calendar blocks',
      'Scene-fit planning prompts',
    ],
    actions: [
      { to: '/member/upgrade', label: 'Launch artist page flow', primary: true },
      { to: '/discover', label: 'Explore release ecosystem' },
      { to: '/events', label: 'Coordinate launch gigs' },
    ],
  },
  brand: {
    badge: 'Brand workspace',
    heading: 'Plan music-led campaigns',
    summary:
      'Partner with scenes and artists through events, editorial angles, and community activation.',
    priorities: [
      'Identify suitable scene hubs by city and genre',
      'Find campaign collaborators via collab board',
      'Align branded activations with event calendar',
    ],
    workflow: [
      { stage: 'Discovery', objective: 'Pick scenes with the right audience intent' },
      { stage: 'Activation', objective: 'Ship artist + event campaign concepts' },
      { stage: 'Scale', objective: 'Repeat formats that convert into community' },
    ],
    toolkit: [
      'Partnership scouting lane',
      'Campaign concept templates',
      'Event-linked activation planner',
    ],
    actions: [
      { to: '/scenes', label: 'Browse scene hubs', primary: true },
      { to: '/events', label: 'Check event pipeline' },
      { to: '/collab', label: 'Source collaborators' },
    ],
  },
}

export default function MemberDashboardPage() {
  const { user, logout, mode, refreshUser } = useAuth()
  const [savingPersona, setSavingPersona] = useState(false)
  const [personaError, setPersonaError] = useState('')
  const [personaModal, setPersonaModal] = useState<DashboardPersona | null>(null)
  if (!user) return null

  const handle = memberHandleFromUser(user)
  const profilePath = `/network/${handle}`
  const persona = user.dashboardPersona
  const personaPanel = persona ? PERSONA_CONTENT[persona] : null
  const showOnlyRoleDashboard = Boolean(personaPanel)

  const savePersona = async (next: DashboardPersona | null) => {
    if (savingPersona) return
    setPersonaError('')
    setSavingPersona(true)
    try {
      await updateUserProfile(user.id, { dashboardPersona: next })
      await refreshUser()
    } catch (err) {
      setPersonaError(err instanceof Error ? err.message : 'Failed to update dashboard type.')
    } finally {
      setSavingPersona(false)
    }
  }

  return (
    <div className="member-dashboard">
      <div className="member-dashboard-inner">
        <header className="member-dashboard-header">
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase text-mh-red font-bold">
              Network home
              {mode === 'supabase' && (
                <span className="ml-2 text-muted font-normal">· live cloud</span>
              )}
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold uppercase mt-1">
              Your dashboard
            </h1>
            <p className="text-muted text-sm mt-2 max-w-xl">
              You&apos;re signed in as a <strong className="text-signal">{roleLabel(user.role)}</strong>
              {persona
                ? ` · ${PERSONA_OPTIONS.find((p) => p.id === persona)?.title ?? 'Custom workspace'} workspace active.`
                : ' — spins, scenes, collab, and gigs. Select your work type to personalize this dashboard.'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {user.name} · {user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link to={profilePath} className="ios-btn ios-btn-ghost !text-xs !py-2">
              Public profile
            </Link>
            <Link to="/community#feed" className="ios-btn ios-btn-ghost !text-xs !py-2">
              Feed
            </Link>
            <Link to="/" className="ios-btn ios-btn-ghost !text-xs !py-2">
              Site
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="ios-btn ios-btn-secondary !text-xs !py-2"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="member-dashboard-persona-picker ios-card p-6 md:p-8 mb-8">
          <p className="text-[10px] tracking-[0.2em] uppercase text-mh-red font-bold">
            Workspace roles
          </p>
          <h2 className="font-display text-2xl font-bold uppercase mt-2">
            Choose how you work
          </h2>
          <p className="text-sm text-muted mt-2 max-w-3xl">
            Har member yahin se role workspace select kar sakta hai. Artist manager ho, label ho,
            promoter ho, ya brand — dashboard usi hisaab se customize hoga.
          </p>
          <div className="member-dashboard-persona-grid mt-6">
            {PERSONA_OPTIONS.map((option) => {
              const active = persona === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`member-dashboard-persona-option ${
                    active ? 'member-dashboard-persona-option-active' : ''
                  }`}
                  onClick={() => setPersonaModal(option.id)}
                  disabled={savingPersona}
                >
                  <p className="font-display text-base font-bold uppercase flex items-center justify-between gap-2">
                    <span>{option.title}</span>
                    {active && <span className="text-[10px] tracking-widest text-mh-red">ACTIVE</span>}
                  </p>
                  <p className="text-xs text-muted mt-2">{option.subtitle}</p>
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            <button
              type="button"
              className="ios-btn ios-btn-ghost !text-xs !py-2"
              onClick={() => void savePersona(null)}
              disabled={savingPersona}
            >
              Use normal dashboard
            </button>
          </div>
          {personaError && <p className="text-mh-red text-sm mt-4">{personaError}</p>}
        </section>

        {personaPanel && (
          <section className="member-dashboard-persona-active ios-card p-6 md:p-8 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] tracking-[0.2em] uppercase text-mh-red font-bold">
                {personaPanel.badge}
              </p>
              <span className="text-xs text-muted">
                Role switcher upar se kabhi bhi workspace change kar sakte ho.
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold uppercase mt-3">
              {personaPanel.heading}
            </h2>
            <p className="text-sm text-muted mt-3 max-w-3xl">{personaPanel.summary}</p>
            <ul className="member-dashboard-persona-list mt-5">
              {personaPanel.priorities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="member-dashboard-workbench mt-6">
              <article className="member-dashboard-workbench-card">
                <h3 className="font-display text-sm font-bold uppercase">Workflow board</h3>
                <div className="member-dashboard-workflow-list mt-4">
                  {personaPanel.workflow.map((step) => (
                    <div key={step.stage} className="member-dashboard-workflow-item">
                      <p className="member-dashboard-workflow-stage">{step.stage}</p>
                      <p className="text-xs text-muted mt-1">{step.objective}</p>
                    </div>
                  ))}
                </div>
              </article>
              <article className="member-dashboard-workbench-card">
                <h3 className="font-display text-sm font-bold uppercase">Toolkit focus</h3>
                <ul className="member-dashboard-toolkit-list mt-4">
                  {personaPanel.toolkit.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {personaPanel.actions.map((action) => (
                <Link
                  key={action.to + action.label}
                  to={action.to}
                  className={
                    action.primary
                      ? 'ios-btn ios-btn-primary !text-xs'
                      : 'ios-btn ios-btn-secondary !text-xs'
                  }
                >
                  {action.label} →
                </Link>
              ))}
            </div>
            {personaError && <p className="text-mh-red text-sm mt-4">{personaError}</p>}
          </section>
        )}

        {!showOnlyRoleDashboard && <MemberTrustPanel user={user} persona={persona} />}

        {!showOnlyRoleDashboard && (
          <>
            <div className="member-dashboard-paths">
              <article className="member-dashboard-path-card member-dashboard-path-card--artist">
                <p className="text-[10px] tracking-[0.2em] uppercase text-mh-red font-bold">
                  Artist path
                </p>
                <h2 className="font-display text-xl font-bold uppercase mt-2">
                  Upgrade to artist page
                </h2>
                <p className="text-sm text-muted mt-2">
                  Launch My Studio — public band page, releases, merch, and editor submissions.
                </p>
                <Link to="/member/upgrade" className="ios-btn ios-btn-primary !text-xs mt-6 inline-flex">
                  Start artist page →
                </Link>
              </article>

              <article className="member-dashboard-path-card member-dashboard-path-card--editor">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted font-bold">
                  Editorial path
                </p>
                <h2 className="font-display text-xl font-bold uppercase mt-2">
                  Become an editor
                </h2>
                <p className="text-sm text-muted mt-2">
                  Apply to write features, review submissions, and curate the magazine desk.
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  <Link to="/editor/apply" className="ios-btn ios-btn-secondary !text-xs">
                    Apply as editor →
                  </Link>
                  <Link to="/editor/join" className="ios-btn ios-btn-ghost !text-xs">
                    Programme info
                  </Link>
                </div>
              </article>
            </div>

            <section className="member-dashboard-explore">
              <h2 className="font-display text-lg font-bold uppercase mb-4">Explore</h2>
              <div className="member-dashboard-explore-grid">
                <Link to="/scenes" className="ios-card p-5 hover:border-mh-red/40 transition-colors">
                  <span className="text-[10px] uppercase tracking-widest text-mh-red">Discovery</span>
                  <p className="font-display font-bold mt-1">Scenes</p>
                  <p className="text-xs text-muted mt-1">City × genre hubs</p>
                </Link>
                <Link to="/events" className="ios-card p-5 hover:border-mh-red/40 transition-colors">
                  <span className="text-[10px] uppercase tracking-widest text-mh-red">Live</span>
                  <p className="font-display font-bold mt-1">Events</p>
                  <p className="text-xs text-muted mt-1">Gigs &amp; RSVP</p>
                </Link>
                <Link to="/collab" className="ios-card p-5 hover:border-mh-red/40 transition-colors">
                  <span className="text-[10px] uppercase tracking-widest text-mh-red">Network</span>
                  <p className="font-display font-bold mt-1">Collab</p>
                  <p className="text-xs text-muted mt-1">Need / offer board</p>
                </Link>
                <Link to="/discover" className="ios-card p-5 hover:border-mh-red/40 transition-colors">
                  <span className="text-[10px] uppercase tracking-widest text-mh-red">Magazine</span>
                  <p className="font-display font-bold mt-1">Discover</p>
                  <p className="text-xs text-muted mt-1">Artists &amp; releases</p>
                </Link>
              </div>
            </section>

            <DashboardCommunityHub />
          </>
        )}
      </div>

      {personaModal && (
        <div className="member-role-modal-backdrop" role="dialog" aria-modal="true">
          <div className="member-role-modal ios-card">
            <p className="text-[10px] tracking-widest uppercase text-mh-red">
              Role information
            </p>
            <h3 className="font-display text-2xl font-bold uppercase mt-2">
              {PERSONA_OPTIONS.find((p) => p.id === personaModal)?.title}
            </h3>
            <p className="text-sm text-muted mt-2">
              {PERSONA_ROLE_INFO[personaModal].roleSummary}
            </p>
            <p className="text-xs uppercase tracking-widest text-muted mt-4">What you can do</p>
            <ul className="member-dashboard-persona-list mt-2">
              {PERSONA_ROLE_INFO[personaModal].canDo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 mt-6">
              <button
                type="button"
                className="ios-btn ios-btn-primary !text-xs"
                disabled={savingPersona}
                onClick={async () => {
                  await savePersona(personaModal)
                  setPersonaModal(null)
                }}
              >
                {savingPersona ? 'Applying…' : 'Apply role dashboard'}
              </button>
              <button
                type="button"
                className="ios-btn ios-btn-ghost !text-xs"
                onClick={() => setPersonaModal(null)}
                disabled={savingPersona}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
