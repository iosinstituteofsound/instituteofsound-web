import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  {
    heading: string
    summary: string
    tabs: string[]
    leftRail: string[]
    rightRail: string[]
    cards: string[]
  }
> = {
  event_promoter: {
    heading: 'Event Promoter Workspace',
    summary: 'Plan lineups, promote gigs, and drive RSVPs scene-by-scene.',
    tabs: ['Pipeline', 'Calendar', 'RSVP', 'Partners'],
    leftRail: ['Upcoming events queue', 'City × genre targeting', 'Promotion checklist'],
    rightRail: ['Quick publish panel', 'Ticket/RSVP pulse', 'Crew outreach'],
    cards: ['This week events', 'Venue slots', 'Artist confirmations'],
  },
  artist_manager: {
    heading: 'Artist Manager Workspace',
    summary: 'Coordinate artist growth loops, submissions, and releases.',
    tabs: ['Roster', 'Releases', 'Media', 'Submissions'],
    leftRail: ['Artist profile readiness', 'Release run sheet', 'Editorial prep notes'],
    rightRail: ['Task board', 'Deadline tracker', 'Collab contacts'],
    cards: ['Artists in cycle', 'Submission status', 'Open dependencies'],
  },
  label: {
    heading: 'Label Workspace',
    summary: 'Run roster visibility and launch planning from one dashboard.',
    tabs: ['Roster Ops', 'Campaigns', 'Distribution', 'Reports'],
    leftRail: ['Signed artist list', 'Release calendar', 'Scene fit matrix'],
    rightRail: ['Milestone checklist', 'Rollout board', 'Editorial opportunities'],
    cards: ['Active campaigns', 'Next drops', 'Priority artists'],
  },
  brand: {
    heading: 'Brand Workspace',
    summary: 'Activate campaigns through scenes, events, and collaborators.',
    tabs: ['Campaigns', 'Partners', 'Events', 'Insights'],
    leftRail: ['Scene shortlists', 'Creator/artist opportunities', 'Activation map'],
    rightRail: ['Approvals', 'Live campaigns', 'Creative briefs'],
    cards: ['Campaign health', 'Partner replies', 'Upcoming activations'],
  },
}

function SkeletonBar({ widthClass = 'w-full' }: { widthClass?: string }) {
  return <div className={`h-2.5 bg-border/70 ${widthClass}`} aria-hidden />
}

function WorkspaceSkeleton({
  title,
  subtitle,
  tabs,
  cards,
  leftRail,
  rightRail,
  metrics,
  density,
}: {
  title: string
  subtitle: string
  tabs: string[]
  cards: string[]
  leftRail: string[]
  rightRail: string[]
  metrics: { label: string; value: string }[]
  density: 'compact' | 'full'
}) {
  const compact = density === 'compact'
  return (
    <motion.div
      key={title + density}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={compact ? 'ios-card p-4' : 'ios-card p-6'}
    >
      <p className="text-[10px] tracking-widest uppercase text-mh-red">Preview · No role change</p>
      <h3 className="font-display text-xl font-bold uppercase mt-2">{title}</h3>
      <p className="text-sm text-muted mt-2">{subtitle}</p>
      <div className="flex flex-wrap gap-2 mt-4">
        {metrics.map((metric) => (
          <span key={metric.label} className="border border-border px-2 py-1 text-xs text-muted">
            {metric.label}: <strong className="text-foreground">{metric.value}</strong>
          </span>
        ))}
      </div>

      <div className={compact ? 'mt-4 border border-border' : 'mt-5 border border-border'}>
        <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-surface">
          {tabs.map((tab) => (
            <span
              key={tab}
              className="text-[10px] tracking-widest uppercase px-2 py-1 border border-border text-muted"
            >
              {tab}
            </span>
          ))}
        </div>

        <div className={compact ? 'grid xl:grid-cols-[1.15fr,1fr] gap-3 p-3 bg-paper' : 'grid xl:grid-cols-[1.15fr,1fr] gap-4 p-4 bg-paper'}>
          <article className="border border-border p-4 space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted">Primary Panel</p>
            <SkeletonBar widthClass="w-3/4" />
            <SkeletonBar widthClass="w-[94%]" />
            <SkeletonBar widthClass="w-[88%]" />
            <div className={compact ? 'grid md:grid-cols-3 gap-2 pt-1' : 'grid md:grid-cols-3 gap-2 pt-2'}>
              {cards.map((card) => (
                <div key={card} className="border border-border p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted mb-2">{card}</p>
                  <SkeletonBar widthClass="w-3/4" />
                  <div className="mt-2">
                    <SkeletonBar widthClass="w-[55%]" />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="space-y-4">
            <article className="border border-border p-4">
              <p className="text-xs uppercase tracking-widest text-muted mb-2">Left Rail Modules</p>
              <ul className="space-y-2 text-sm text-muted">
                {leftRail.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </article>
            <article className="border border-border p-4">
              <p className="text-xs uppercase tracking-widest text-muted mb-2">Right Rail Modules</p>
              <ul className="space-y-2 text-sm text-muted">
                {rightRail.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MemberDefaultPreview({ density }: { density: 'compact' | 'full' }) {
  return (
    <WorkspaceSkeleton
      title="Member Default Dashboard"
      subtitle="Standard member view with upgrade cards and community entry points."
      tabs={['Overview', 'Upgrade', 'Community', 'Explore']}
      cards={['Upgrade to artist', 'Apply as editor', 'Network health']}
      leftRail={['Path cards', 'Profile shortcuts', 'Notification center']}
      rightRail={['Scenes', 'Events', 'Collab', 'Discover']}
      metrics={[
        { label: 'dB', value: '2,140' },
        { label: 'Weekly Rank', value: 'Top 12%' },
        { label: 'Open Prompts', value: '3' },
      ]}
      density={density}
    />
  )
}

function ArtistStudioPreview({ density }: { density: 'compact' | 'full' }) {
  const compact = density === 'compact'
  return (
    <motion.div
      key={`artist-${density}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={compact ? 'ios-card p-4' : 'ios-card p-6'}
    >
      <p className="text-[10px] tracking-widest uppercase text-mh-red">Preview · No role change</p>
      <h3 className="font-display text-xl font-bold uppercase mt-2">Artist Studio Dashboard</h3>
      <p className="text-sm text-muted mt-2">
        Real artist dashboard structure preview: tabs + editor + submission queue zones.
      </p>
      <div className="flex flex-wrap gap-2 mt-4">
        {[
          { label: 'Profile Completeness', value: '74%' },
          { label: 'Pending Submissions', value: '2' },
          { label: 'Published Releases', value: '5' },
        ].map((metric) => (
          <span key={metric.label} className="border border-border px-2 py-1 text-xs text-muted">
            {metric.label}: <strong className="text-foreground">{metric.value}</strong>
          </span>
        ))}
      </div>
      <div className={compact ? 'mt-4 border border-border bg-paper' : 'mt-5 border border-border bg-paper'}>
        <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-surface">
          {['Network', 'Your Page', 'Releases', 'Submit', 'History'].map((tab) => (
            <span
              key={tab}
              className="text-[10px] tracking-widest uppercase px-2 py-1 border border-border text-muted"
            >
              {tab}
            </span>
          ))}
        </div>
        <div className={compact ? 'grid xl:grid-cols-[1.2fr,1fr] gap-3 p-3' : 'grid xl:grid-cols-[1.2fr,1fr] gap-4 p-4'}>
          <article className="border border-border p-4 space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted">Profile Builder Canvas</p>
            <SkeletonBar widthClass="w-4/5" />
            <SkeletonBar widthClass="w-[92%]" />
            <SkeletonBar widthClass="w-2/3" />
            <div className="grid sm:grid-cols-2 gap-2 pt-2">
              {['Identity', 'Media', 'Social', 'Publishing'].map((card) => (
                <div key={card} className="border border-border p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted">{card}</p>
                </div>
              ))}
            </div>
          </article>
          <article className="border border-border p-4 space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted">Submission Panel</p>
            <SkeletonBar widthClass="w-[90%]" />
            <SkeletonBar widthClass="w-3/4" />
            <SkeletonBar widthClass="w-2/3" />
            <div className="pt-3 space-y-2">
              <div className="h-8 border border-border bg-surface" />
              <div className="h-8 border border-border bg-surface" />
            </div>
          </article>
        </div>
      </div>
    </motion.div>
  )
}

export function SuperEditorDashboardPreview() {
  const [mode, setMode] = useState<PreviewMode>('member_default')
  const [density, setDensity] = useState<'compact' | 'full'>('full')

  const content =
    mode === 'member_default' ? (
      <MemberDefaultPreview density={density} />
    ) : mode === 'artist' ? (
      <ArtistStudioPreview density={density} />
    ) : (
      <WorkspaceSkeleton
        {...(() => {
          const config = PERSONA_COPY[mode.replace('member_', '') as DashboardPersona]
          return {
            title: config.heading,
            subtitle: config.summary,
            tabs: config.tabs,
            cards: config.cards,
            leftRail: config.leftRail,
            rightRail: config.rightRail,
            metrics: [
              { label: 'Open Tasks', value: '12' },
              { label: 'Pending Items', value: '7' },
              { label: 'Live This Week', value: '4' },
            ],
            density,
          }
        })()}
      />
    )

  return (
    <section className="space-y-5">
      <div className="ios-card p-5">
        <p className="text-xs text-muted">
          Super Editor preview mode: dashboards ka layout dekh sakte ho bina apna role ya kisi user
          ka role change kiye.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => setDensity('full')}
            className={
              density === 'full' ? 'ios-btn ios-btn-primary !text-xs' : 'ios-btn ios-btn-ghost !text-xs'
            }
          >
            Full Layout
          </button>
          <button
            type="button"
            onClick={() => setDensity('compact')}
            className={
              density === 'compact'
                ? 'ios-btn ios-btn-primary !text-xs'
                : 'ios-btn ios-btn-ghost !text-xs'
            }
          >
            Compact Layout
          </button>
        </div>
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

      <AnimatePresence mode="wait">{content}</AnimatePresence>
    </section>
  )
}

