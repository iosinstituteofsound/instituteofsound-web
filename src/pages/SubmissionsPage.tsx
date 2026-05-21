import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isEditorStaff } from '@/lib/auth/roles'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'

export default function SubmissionsPage() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user?.role === 'artist') {
    return <Navigate to="/artist/dashboard" replace />
  }

  if (user && isEditorStaff(user.role)) {
    return <Navigate to="/editor/dashboard" replace />
  }

  return (
    <div className="section-padding pt-32 min-h-screen">
      <div className="max-w-2xl mx-auto text-center">
        <MagazineSectionHeading
          variant="metal-hammer"
          kicker="Artist Portal"
          title="Submit Your Music"
          subtitle="Create an artist account to submit tracks. Editors review everything in their dashboard."
        />

        <div className="grid sm:grid-cols-2 gap-4 mt-12 text-left">
          <div className="border border-mh-red p-6">
            <h3 className="font-display text-lg font-bold uppercase text-mh-red">
              Artists
            </h3>
            <p className="text-sm text-muted mt-2">
              Login, submit tracks with stream links. Track status: pending → in
              review → approved / rejected.
            </p>
            <Link
              to="/register"
              className="inline-block mt-4 bg-mh-red text-white px-6 py-2 text-xs tracking-widest uppercase font-bold"
            >
              Register as Artist →
            </Link>
          </div>
          <div className="border border-rs-red p-6">
            <h3 className="font-serif text-lg font-bold text-rs-red">Editors</h3>
            <p className="text-sm text-muted mt-2">
              Review the submission queue, approve bands, write reviews and features.
            </p>
            <Link
              to="/register"
              className="inline-block mt-4 border-2 border-rs-red text-rs-red px-6 py-2 text-xs tracking-widest uppercase font-bold hover:bg-rs-red hover:text-white transition-colors"
            >
              Register as Editor →
            </Link>
          </div>
        </div>

        <p className="text-sm text-muted mt-10">
          Already registered?{' '}
          <Link to="/login" className="text-rs-red hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
