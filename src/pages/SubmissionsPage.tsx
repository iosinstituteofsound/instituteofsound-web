import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isSuperEditor } from '@/lib/auth/roles'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'
import { Button } from '@/components/ui/Button'

export default function SubmissionsPage() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user?.role === 'artist') {
    return <Navigate to="/artist/dashboard" replace />
  }

  if (user?.role === 'member') {
    return <Navigate to="/member/upgrade" replace />
  }

  if (user && isSuperEditor(user.role)) {
    return <Navigate to="/editor/dashboard" replace />
  }

  return (
    <div className="section-padding pt-32 min-h-screen">
      <div className="max-w-xl mx-auto text-center">
        <MagazineSectionHeading
          variant="metal-hammer"
          kicker="Artist studio"
          title="My Studio & editorial submit"
          subtitle="Join the network first, then upgrade to a public artist page and send tracks to the desk."
          titleAs="h1"
        />

        <div className="ios-panel ios-panel-accent text-left p-8 mt-12 space-y-8">
          <div>
            <h3 className="font-display text-lg font-bold uppercase text-mh-red">Step 1 — Join network</h3>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Free member account with Google — feed, dB, scenes, collab, and events. No password.
            </p>
            <Button to="/register" variant="primary" className="mt-4">
              Join with Google →
            </Button>
          </div>
          <div className="border-t border-border pt-8">
            <h3 className="font-display text-lg font-bold uppercase text-mh-red">
              Step 2 — Upgrade to artist page
            </h3>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              From your dashboard, launch <strong className="text-signal">My Studio</strong>: avatar,
              banner, genres, links, tracks, albums, videos — public at{' '}
              <span className="font-mono text-xs">/artist/your-band</span>.
            </p>
          </div>
          <div className="border-t border-border pt-8">
            <h3 className="font-display text-lg font-bold uppercase text-mh-red">Step 3 — Submit tracks</h3>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Send music to editors: pending → in review → approved or rejected with notes.
            </p>
            <Button to="/register" variant="secondary" className="mt-4">
              Get started →
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted mt-8 max-w-md mx-auto">
          Want to write for the magazine?{' '}
          <Link to="/editor/join" className="ios-link">
            Apply as an editor
          </Link>
          . Desk access is approved by IOS Support only.
        </p>
      </div>
    </div>
  )
}
