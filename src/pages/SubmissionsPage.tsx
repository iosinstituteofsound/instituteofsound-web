import { Navigate } from 'react-router-dom'
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

  if (user && isSuperEditor(user.role)) {
    return <Navigate to="/editor/dashboard" replace />
  }

  return (
    <div className="section-padding pt-32 min-h-screen">
      <div className="max-w-xl mx-auto text-center">
        <MagazineSectionHeading
          variant="metal-hammer"
          kicker="Artist Portal"
          title="Register & Submit"
          subtitle="Bands and solo artists — create your account, build your public profile, and send tracks for editorial review."
        />

        <div className="ios-panel ios-panel-accent text-left p-8 mt-12 space-y-8">
          <div>
            <h3 className="font-display text-lg font-bold uppercase text-mh-red">Step 1 — Register</h3>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Free artist account only. Choose your band name, email, and password. No credit card.
            </p>
            <Button to="/register" variant="primary" className="mt-4">
              Create Artist Account →
            </Button>
          </div>
          <div className="border-t border-border pt-8">
            <h3 className="font-display text-lg font-bold uppercase text-mh-red">Step 2 — Build profile</h3>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              In <strong className="text-signal">My Studio</strong>: avatar, banner, genres, Spotify / YouTube /
              Instagram links, tracks, albums, singles, and videos — your public page at{' '}
              <span className="font-mono text-xs">/artist/your-band</span>.
            </p>
          </div>
          <div className="border-t border-border pt-8">
            <h3 className="font-display text-lg font-bold uppercase text-mh-red">Step 3 — Submit tracks</h3>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              Send music to the desk: pending → in review → approved or rejected with editor notes.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button to="/login" variant="secondary">
                Artist Login →
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted mt-8 max-w-md mx-auto">
          Magazine posts and reviews are published by Institute editorial staff only. Editor
          accounts are not open for public registration.
        </p>
      </div>
    </div>
  )
}
