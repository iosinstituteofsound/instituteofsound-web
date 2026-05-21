import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { editorDashboardPath } from '@/lib/auth/roles'
import { MetalButton } from '@/components/ui/MetalButton'
import { MetalInput } from '@/components/ui/MetalInput'

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
    <div className="section-padding pt-32 min-h-screen metal-section">
      <div className="max-w-md mx-auto metal-card p-8 md:p-10">
        <div className="metal-rule-stack mb-4">
          <span />
          <span />
          <span />
        </div>
        <p className="metal-kicker text-rs-red">Portal Access</p>
        <h1 className="font-metal text-4xl text-signal mt-2">Sign In</h1>
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
            <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
              Email
            </label>
            <MetalInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@band.com"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
              Password
            </label>
            <MetalInput
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-mh-red text-sm">{error}</p>}

          <MetalButton type="submit" variant="rs" disabled={submitting} className="w-full">
            <span className="metal-btn-inner w-full justify-center">
              {submitting ? 'Signing in...' : 'Sign In'}
            </span>
          </MetalButton>
        </form>

        {mode === 'local' && (
        <div className="mt-8 p-4 border border-border bg-paper text-sm">
          <p className="text-muted text-[10px] tracking-widest uppercase mb-3">
            Demo accounts (local only)
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemo('editor')}
              className="text-xs border border-rs-red text-rs-red px-3 py-1.5 hover:bg-rs-red hover:text-white transition-colors"
            >
              Editor demo
            </button>
            <button
              type="button"
              onClick={() => fillDemo('artist')}
              className="text-xs border border-mh-red text-mh-red px-3 py-1.5 hover:bg-mh-red hover:text-white transition-colors"
            >
              Artist demo
            </button>
          </div>
          <p className="text-muted text-xs mt-3">
            editor@ios.test / editor123 · artist@ios.test / artist123
          </p>
        </div>
        )}

        <p className="text-center text-sm text-muted mt-8">
          No account?{' '}
          <Link to="/register" className="text-rs-red hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
