import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { roleLabel } from '@/lib/auth/roles'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { DashboardCommunityHub } from '@/components/dashboard/DashboardCommunityHub'

export default function MemberDashboardPage() {
  const { user, logout, mode } = useAuth()
  if (!user) return null

  const handle = memberHandleFromUser(user)
  const profilePath = `/network/${handle}`

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
              — spins, scenes, collab, and gigs. No artist page yet unless you upgrade below.
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
      </div>
    </div>
  )
}
