import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { editorDashboardPath } from '@/lib/auth/roles'
import { Button } from '@/components/ui/Button'
import { Input, FieldLabel } from '@/components/ui/Input'

export default function LoginPage() {
  const { user, login, mode, configHint } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={from ?? editorDashboardPath(user.role)} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    let finished = false
    const timeout = window.setTimeout(() => {
      if (!finished) {
        setError(
          'Login timed out. Run supabase/migrations/003-fix-tlssymbols-profile.sql in Supabase, then refresh.'
        )
        setSubmitting(false)
      }
    }, 20000)

    try {
      const loggedIn = await login({ email, password })
      finished = true
      window.clearTimeout(timeout)
      navigate(from ?? editorDashboardPath(loggedIn.role), { replace: true })
    } catch (err) {
      finished = true
      window.clearTimeout(timeout)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      if (!finished) window.clearTimeout(timeout)
      setSubmitting(false)
    }
  }

  const fillDemo = (role: 'editor' | 'artist') => {
    if (role === 'editor') {
      setEmail('editor@ios.test')
      setPassword('editor123')
    } else {
      setEmail('artist@ios.test')
      setPassword('artist123')
    }
  }

  return (
    <div className="section-padding pt-32 min-h-screen">
      <div className="max-w-md mx-auto ios-panel ios-panel-accent">
        <p className="ios-kicker">Portal Access</p>
        <h1 className="font-serif text-4xl font-bold mt-3">Sign In</h1>
        <p className="text-muted mt-2 text-sm">
          Editors review submissions. Artists submit tracks.
        </p>

        {configHint ? (
          <p className="mt-4 text-xs px-3 py-2 border border-amber-500/50 text-amber-400">
            {configHint}
          </p>
        ) : (
          <p
            className={`mt-4 text-xs px-3 py-2 border ${
              mode === 'supabase'
                ? 'border-emerald-500/40 text-emerald-400'
                : 'border-border text-muted'
            }`}
          >
            {mode === 'supabase'
              ? 'Connected to Supabase — accounts & submissions sync to the cloud.'
              : 'Local demo mode — add .env Supabase keys. See SUPABASE_SETUP.md'}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@band.com"
            />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-mh-red text-sm">{error}</p>}

          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {mode === 'local' && (
          <div className="mt-8 p-4 border border-border bg-void/80">
            <p className="ios-label mb-3">Demo accounts (local only)</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => fillDemo('editor')}>
                Editor demo
              </Button>
              <Button type="button" variant="metal" onClick={() => fillDemo('artist')}>
                Artist demo
              </Button>
            </div>
            <p className="text-muted text-xs mt-3">
              editor@ios.test / editor123 · artist@ios.test / artist123
            </p>
          </div>
        )}

        <p className="text-center text-sm text-muted mt-8">
          No account?{' '}
          <Link to="/register" className="ios-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
