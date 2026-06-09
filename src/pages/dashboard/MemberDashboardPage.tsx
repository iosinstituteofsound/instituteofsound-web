import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { updateUserProfile } from '@/lib/auth/profile'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { MyFandomPanel } from '@/components/dashboard/MyFandomPanel'
import { MemberFeedActivity } from '@/components/dashboard/MemberFeedActivity'
import { MemberUpgradePathsHome } from '@/components/dashboard/MemberUpgradePathsHome'
import { MemberTrustPanel } from '@/components/dashboard/MemberTrustPanel'
import { syncMemberVerificationNotifications } from '@/lib/verification/notifyEditors'
import { syncApprovedVerificationPersona } from '@/lib/verification/service'
import { RoleDeskLayout } from '@/components/dashboard/RoleDeskLayout'
import { MemberExploreHome } from '@/components/dashboard/MemberExploreHome'
import { MemberWorkspaceHome } from '@/components/dashboard/MemberWorkspaceHome'
import { MetalBadge } from '@/components/ui/MetalBadge'
import type { DashboardPersona } from '@/lib/auth/types'
import { VerificationRequirementsList } from '@/components/dashboard/VerificationRequirementsList'
import {
  ARTIST_PATH_REQUIREMENTS,
  EDITOR_PATH_REQUIREMENTS,
  getRoleVerificationRequirements,
  PLAYLIST_CURATOR_REQUIREMENTS,
  type PathVerificationInfo,
} from '@/lib/verification/requirements'

type MemberTab = 'workspace' | 'explore' | 'network' | 'fandom' | 'grow'

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

type GrowPathCard =
  | {
      id: string
      variant: 'artist' | 'editor' | 'curator'
      kicker: string
      heading: string
      lede: string
      primary: { to: string; label: string }
      secondary?: { to: string; label: string }[]
      verification: PathVerificationInfo
    }
  | {
      id: string
      variant: 'persona'
      kicker: string
      heading: string
      lede: string
      persona: DashboardPersona
      primaryLabel: string
    }

const GROW_PATHS: GrowPathCard[] = [
  {
    id: 'artist',
    variant: 'artist',
    kicker: 'Artist path',
    heading: 'Upgrade to artist page',
    lede: 'Launch My Studio — public band page, releases, merch, and editor submissions.',
    primary: { to: '/member/upgrade', label: 'Start artist page' },
    verification: ARTIST_PATH_REQUIREMENTS,
  },
  {
    id: 'artist_manager',
    variant: 'persona',
    kicker: 'Manager path',
    heading: 'Upgrade to Artist Manager',
    lede: 'Coordinate releases, roster moves, and artist growth — verified manager workspace on your desk.',
    persona: 'artist_manager',
    primaryLabel: 'Apply as artist manager',
  },
  {
    id: 'brand',
    variant: 'persona',
    kicker: 'Brand path',
    heading: 'Apply as Brand',
    lede: 'Run music-led campaigns with scenes, events, and creator partnerships across the network.',
    persona: 'brand',
    primaryLabel: 'Apply as brand',
  },
  {
    id: 'label',
    variant: 'persona',
    kicker: 'Label path',
    heading: 'Apply as Label',
    lede: 'Operate roster planning, release calendars, and scene-aware promotion from one workspace.',
    persona: 'label',
    primaryLabel: 'Apply as label',
  },
  {
    id: 'event_promoter',
    variant: 'persona',
    kicker: 'Promoter path',
    heading: 'Upgrade to Event Promoter',
    lede: 'Publish gigs, push RSVPs, and activate local scenes with promoter tools and verification.',
    persona: 'event_promoter',
    primaryLabel: 'Upgrade to event promoter',
  },
  {
    id: 'playlist_curator',
    variant: 'curator',
    kicker: 'Curation path',
    heading: 'Apply for Playlist Curator',
    lede: 'Submit your public playlist links and a note — IOS Support reviews every link before approval.',
    primary: { to: '/member/playlist-curator', label: 'Apply for playlist curator' },
    verification: PLAYLIST_CURATOR_REQUIREMENTS,
  },
  {
    id: 'editor',
    variant: 'editor',
    kicker: 'Editorial path',
    heading: 'Become an editor',
    lede: 'Apply to write features, review submissions, and curate the magazine desk.',
    primary: { to: '/editor/apply', label: 'Apply as editor' },
    secondary: [{ to: '/editor/join', label: 'Programme info' }],
    verification: EDITOR_PATH_REQUIREMENTS,
  },
]

export default function MemberDashboardPage() {
  const { user, logout, mode, refreshUser } = useAuth()
  const [savingPersona, setSavingPersona] = useState(false)
  const [personaError, setPersonaError] = useState('')
  const [personaModal, setPersonaModal] = useState<DashboardPersona | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [tab, setTab] = useState<MemberTab>('workspace')

  const openUpgradePaths = () => setTab('grow')

  useEffect(() => {
    if (!user?.id) return
    void (async () => {
      if (!user.dashboardPersona) {
        const applied = await syncApprovedVerificationPersona(user.id)
        if (applied) await refreshUser()
      }
      await syncMemberVerificationNotifications(user.id)
    })()
  }, [user?.id, user?.dashboardPersona, refreshUser])

  if (!user) return null

  const handle = memberHandleFromUser(user)
  const profilePath = `/network/${handle}`
  const persona = user.dashboardPersona
  const personaPanel = persona ? PERSONA_CONTENT[persona] : null

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

  const personaTitle = persona
    ? (PERSONA_OPTIONS.find((p) => p.id === persona)?.title ?? 'Workspace')
    : 'Not set'

  return (
    <>
      <RoleDeskLayout
        user={user}
        mode={mode}
        kicker="Network home"
        title="Member desk"
        summary={
          persona
            ? `${personaTitle} workspace is active — spins, scenes, collab, and gigs in one shell.`
            : 'Your network home — open upgrade paths when you are ready to grow into artist, curator, or desk roles.'
        }
        badge={
          <MetalBadge variant="red" className="shrink-0">
            Member
          </MetalBadge>
        }
        tab={tab}
        onTabChange={setTab}
        navGroups={[
          {
            title: 'Your workspace',
            items: [
              { id: 'workspace', label: 'Workspace home' },
              { id: 'grow', label: 'Upgrade paths', badge: persona ? 0 : GROW_PATHS.length },
            ],
          },
          {
            title: 'Network',
            items: [
              { id: 'network', label: 'Feed & activity' },
              { id: 'fandom', label: 'My Fandom' },
              { id: 'explore', label: 'Explore IOS' },
            ],
          },
        ]}
        quickTiles={[
          {
            label: 'Workspace',
            value: persona ? 'Live' : 'Setup',
            accent: Boolean(persona),
            onClick: () => setTab('workspace'),
          },
          {
            label: 'Role',
            value: persona ? personaTitle : 'Upgrade paths',
            onClick: () => (persona ? setTab('workspace') : openUpgradePaths()),
          },
          {
            label: 'Explore',
            value: 'IOS',
            onClick: () => setTab('explore'),
          },
          {
            label: 'Feed',
            value: 'Open',
            onClick: () => setTab('network'),
          },
        ]}
        headerExtra={
          <Link to={profilePath} className="ios-btn ios-btn-ghost !text-xs !py-2">
            Public profile
          </Link>
        }
        onLogout={() => logout()}
        rootClassName="member-desk"
        shellless
        compactHeader
      >
        {tab === 'workspace' && (
          <MemberWorkspaceHome
            user={user}
            persona={persona}
            personaTitle={personaTitle}
            personaPanel={personaPanel}
            onOpenUpgradePaths={openUpgradePaths}
            onResetPersona={() => setShowResetConfirm(true)}
            savingPersona={savingPersona}
            personaError={personaError}
          />
        )}

        {tab === 'grow' && (
          <MemberUpgradePathsHome persona={persona}>
          <div className="member-dashboard-paths">
            <section className="member-desk-panel member-dashboard-paths-intro">
              <p className="member-desk-kicker">Growth</p>
              <h2 className="member-desk-heading">Upgrade &amp; apply</h2>
              <p className="member-desk-lede">
                Pick a path below — artist, editor, manager, label, brand, promoter, and playlist
                curator. Manager, label, brand, and promoter unlock your workspace after desk review.
              </p>
            </section>

            {GROW_PATHS.map((path) => {
              if (path.variant === 'persona') {
                const active = persona === path.persona
                return (
                  <article
                    key={path.id}
                    className={clsx(
                      'member-desk-panel member-dashboard-path-card member-dashboard-path-card--persona',
                      active && 'member-dashboard-path-card--active',
                    )}
                  >
                    <p className="member-desk-kicker">{path.kicker}</p>
                    <h2 className="member-desk-heading">{path.heading}</h2>
                    <p className="member-desk-lede">{path.lede}</p>
                    <VerificationRequirementsList
                      info={getRoleVerificationRequirements(path.persona)}
                      className="mt-4"
                    />
                    <div className="member-desk-actions">
                      {active ? (
                        <button
                          type="button"
                          className="ios-btn ios-btn-primary"
                          onClick={() => setTab('workspace')}
                        >
                          Open workspace →
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="ios-btn ios-btn-primary"
                          onClick={() => setPersonaModal(path.persona)}
                        >
                          {path.primaryLabel} →
                        </button>
                      )}
                      <button
                        type="button"
                        className="ios-btn ios-btn-ghost"
                        onClick={() => {
                          document
                            .querySelector('.member-desk-trust-wrap')
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                      >
                        Verification proofs
                      </button>
                    </div>
                  </article>
                )
              }

              const cardClass =
                path.variant === 'artist'
                  ? 'member-dashboard-path-card--artist'
                  : path.variant === 'curator'
                    ? 'member-dashboard-path-card--curator'
                    : 'member-dashboard-path-card--editor'

              return (
                <article
                  key={path.id}
                  className={clsx(
                    'member-desk-panel member-dashboard-path-card',
                    cardClass,
                  )}
                >
                  <p className="member-desk-kicker">{path.kicker}</p>
                  <h2 className="member-desk-heading">{path.heading}</h2>
                  <p className="member-desk-lede">{path.lede}</p>
                  <VerificationRequirementsList info={path.verification} className="mt-4" />
                  {path.secondary?.length ? (
                    <div className="member-desk-actions">
                      <Link to={path.primary.to} className="ios-btn ios-btn-secondary">
                        {path.primary.label} →
                      </Link>
                      {path.secondary.map((link) => (
                        <Link key={link.to} to={link.to} className="ios-btn ios-btn-ghost">
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link to={path.primary.to} className="ios-btn ios-btn-primary mt-6 inline-flex">
                      {path.primary.label} →
                    </Link>
                  )}
                </article>
              )
            })}

            {persona && (
              <section className="member-desk-panel member-desk-trust-wrap">
                <MemberTrustPanel user={user} persona={persona} className="member-desk-trust" />
              </section>
            )}
          </div>
          </MemberUpgradePathsHome>
        )}

        {tab === 'explore' && <MemberExploreHome />}

        {tab === 'network' && <MemberFeedActivity />}

        {tab === 'fandom' && <MyFandomPanel />}
      </RoleDeskLayout>

      {personaModal && (
        <div
          className="member-role-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => !savingPersona && setPersonaModal(null)}
        >
          <div className="member-role-modal ios-card" onClick={(event) => event.stopPropagation()}>
            <div className="member-role-modal-header">
              <div>
                <p className="member-role-modal-eyebrow">Role information</p>
                <h3 className="member-role-modal-title">
                  {PERSONA_OPTIONS.find((p) => p.id === personaModal)?.title}
                </h3>
              </div>
              <button
                type="button"
                className="member-role-modal-close"
                onClick={() => setPersonaModal(null)}
                disabled={savingPersona}
                aria-label="Close role information popup"
              >
                ×
              </button>
            </div>

            <p className="member-role-modal-summary">{PERSONA_ROLE_INFO[personaModal].roleSummary}</p>
            <div className="member-role-modal-capabilities">
              <p className="member-role-modal-capabilities-title">What you can do</p>
              <ul className="member-role-modal-capabilities-list">
                {PERSONA_ROLE_INFO[personaModal].canDo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <VerificationRequirementsList
              info={getRoleVerificationRequirements(personaModal)}
              className="member-verification-reqs member-verification-reqs--modal"
            />

            <div className="member-role-modal-actions">
              <button
                type="button"
                className="ios-btn ios-btn-primary !text-xs"
                disabled={savingPersona}
                onClick={async () => {
                  await savePersona(personaModal)
                  setPersonaModal(null)
                  setTab('grow')
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

      {showResetConfirm && (
        <div
          className="member-role-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => !savingPersona && setShowResetConfirm(false)}
        >
          <div className="member-role-modal ios-card" onClick={(event) => event.stopPropagation()}>
            <div className="member-role-modal-header">
              <div>
                <p className="member-role-modal-eyebrow">Reset workspace</p>
                <h3 className="member-role-modal-title">Reset your selected role dashboard?</h3>
              </div>
            </div>
            <p className="member-role-modal-summary">
              This action removes your current workspace selection and returns this account to the
              default member role chooser. Continue only if you want to start over.
            </p>
            <div className="member-role-modal-actions">
              <button
                type="button"
                className="ios-btn ios-btn-primary !text-xs"
                disabled={savingPersona}
                onClick={async () => {
                  await savePersona(null)
                  setShowResetConfirm(false)
                }}
              >
                {savingPersona ? 'Resetting…' : 'Confirm reset'}
              </button>
              <button
                type="button"
                className="ios-btn ios-btn-ghost !text-xs"
                onClick={() => setShowResetConfirm(false)}
                disabled={savingPersona}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
