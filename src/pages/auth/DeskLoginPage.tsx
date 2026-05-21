import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isSuperEditor } from '@/lib/auth/roles'
import { Button } from '@/components/ui/Button'
import { Input, FieldLabel } from '@/components/ui/Input'

/** Staff-only sign-in — not linked from public nav. Bookmark /desk */
export default function DeskLoginPage() {
  const { user, login, logout, mode, configHint } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/editor/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    if (isSuperEditor(user.role)) {
      return <Navigate to={from} replace />
    }
    return <Navigate to="/artist/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const loggedIn = await login({ email, password })
      if (!isSuperEditor(loggedIn.role)) {
        await logout()
        setError('This account does not have editorial access.')
        return
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="section-padding pt-32 min-h-screen">
      <div className="max-w-md mx-auto ios-panel">
        <p className="ios-kicker">Staff</p>
        <h1 className="font-serif text-3xl font-bold mt-3">Sign In</h1>

        {configHint && (
          <p className="mt-4 text-xs px-3 py-2 border border-amber-500/50 text-amber-400">
            {configHint}
          </p>
        )}

        {mode === 'local' && (
          <p className="mt-4 text-xs text-muted">
            Local demo has no super admin account. Use Supabase with your staff email.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <Input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-mh-red text-sm">{error}</p>}

          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
