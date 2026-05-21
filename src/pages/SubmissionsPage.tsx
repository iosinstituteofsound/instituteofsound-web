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
          title="Submit Your Music"
          subtitle="Create a free artist account and send tracks to the Institute. Our editorial team reviews every submission."
        />

        <div className="ios-panel ios-panel-accent text-left p-8 mt-12">
          <h3 className="font-display text-lg font-bold uppercase text-mh-red">For Artists</h3>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            Login, upload artwork, add stream links, and track status: pending → in review →
            approved or rejected with editor notes.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button to="/register" variant="primary">
              Register as Artist →
            </Button>
            <Button to="/login" variant="secondary">
              Artist Login →
            </Button>
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
