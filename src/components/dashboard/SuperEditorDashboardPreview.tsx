import { useState } from 'react'
import type { DashboardPersona } from '@/lib/auth/types'

type PreviewMode =
  | 'member_default'
  | 'member_event_promoter'
  | 'member_artist_manager'
  | 'member_label'
  | 'member_brand'
  | 'artist'

const PREVIEW_TABS: { id: PreviewMode; label: string }[] = [
  { id: 'member_default', label: 'Member · Default' },
  { id: 'member_event_promoter', label: 'Member · Event Promoter' },
  { id: 'member_artist_manager', label: 'Member · Artist Manager' },
  { id: 'member_label', label: 'Member · Label' },
  { id: 'member_brand', label: 'Member · Brand' },
  { id: 'artist', label: 'Artist · Studio' },
]

const PERSONA_COPY: Record<
  DashboardPersona,
  { heading: string; summary: string; lanes: string[]; actions: string[] }
> = {
  event_promoter: {
    heading: 'Event Promoter Workspace',
    summary: 'Plan lineups, promote gigs, and drive RSVPs scene-by-scene.',
    lanes: ['Pre-launch', 'Hype week', 'Post-show conversion'],
    actions: ['Events board', 'Scene hubs', 'Collab sourcing'],
  },
  artist_manager: {
    heading: 'Artist Manager Workspace',
    summary: 'Coordinate artist growth loops, submissions, and releases.',
    lanes: ['Asset prep', 'Release run', 'Momentum ops'],
    actions: ['Upgrade to artist studio', 'Collab board', 'Discover monitoring'],
  },
  label: {
    heading: 'Label Workspace',
    summary: 'Run roster visibility and launch planning from one dashboard.',
    lanes: ['Roster setup', 'Campaign sync', 'Performance scaling'],
    actions: ['Artist page launch', 'Release ecosystem', 'Launch gigs'],
  },
  brand: {
    heading: 'Brand Workspace',
    summary: 'Activate campaigns through scenes, events, and collaborators.',
    lanes: ['Discovery', 'Activation', 'Scale'],
    actions: ['Scene scouting', 'Event pipeline', 'Collab sourcing'],
  },
}

function PersonaPreview({ persona }: { persona: DashboardPersona }) {
  const config = PERSONA_COPY[persona]
  return (
    <div className="ios-card p-6">
      <p className="text-[10px] tracking-widest uppercase text-mh-red">Preview · No role change</p>
      <h3 className="font-display text-xl font-bold uppercase mt-2">{config.heading}</h3>
      <p className="text-sm text-muted mt-2">{config.summary}</p>
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        <article className="border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">Workflow lanes</p>
          <ul className="text-sm text-muted space-y-1">
            {config.lanes.map((lane) => (
              <li key={lane}>- {lane}</li>
            ))}
          </ul>
        </article>
        <article className="border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">Quick actions</p>
          <ul className="text-sm text-muted space-y-1">
            {config.actions.map((action) => (
              <li key={action}>- {action}</li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  )
}

function MemberDefaultPreview() {
  return (
    <div className="ios-card p-6">
      <p className="text-[10px] tracking-widest uppercase text-mh-red">Preview · No role change</p>
      <h3 className="font-display text-xl font-bold uppercase mt-2">Member Default Dashboard</h3>
      <p className="text-sm text-muted mt-2">
        Standard member view with upgrade paths and network exploration.
      </p>
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        <article className="border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">Path cards</p>
          <ul className="text-sm text-muted space-y-1">
            <li>- Upgrade to artist page</li>
            <li>- Become an editor (application only)</li>
          </ul>
        </article>
        <article className="border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">Explore blocks</p>
          <ul className="text-sm text-muted space-y-1">
            <li>- Scenes</li>
            <li>- Events</li>
            <li>- Collab</li>
            <li>- Discover</li>
          </ul>
        </article>
      </div>
    </div>
  )
}

function ArtistStudioPreview() {
  return (
    <div className="ios-card p-6">
      <p className="text-[10px] tracking-widest uppercase text-mh-red">Preview · No role change</p>
      <h3 className="font-display text-xl font-bold uppercase mt-2">Artist Studio Dashboard</h3>
      <p className="text-sm text-muted mt-2">
        Artist workflow for public page setup, releases, and editorial submissions.
      </p>
      <div className="grid md:grid-cols-3 gap-4 mt-5">
        {['Profile setup', 'Releases & media', 'Submit to editors'].map((block) => (
          <article key={block} className="border border-border p-4">
            <p className="text-xs uppercase tracking-widest text-muted">{block}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

export function SuperEditorDashboardPreview() {
  const [mode, setMode] = useState<PreviewMode>('member_default')

  const content =
    mode === 'member_default' ? (
      <MemberDefaultPreview />
    ) : mode === 'artist' ? (
      <ArtistStudioPreview />
    ) : (
      <PersonaPreview persona={mode.replace('member_', '') as DashboardPersona} />
    )

  return (
    <section className="space-y-5">
      <div className="ios-card p-5">
        <p className="text-xs text-muted">
          Super Editor preview mode: dashboards ka layout dekh sakte ho bina apna role ya kisi user
          ka role change kiye.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PREVIEW_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={
              mode === tab.id
                ? 'ios-btn ios-btn-primary !text-xs'
                : 'ios-btn ios-btn-ghost !text-xs'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {content}
    </section>
  )
}

