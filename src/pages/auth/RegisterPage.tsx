import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { editorDashboardPath } from '@/lib/auth/roles'
import type { UserRole } from '@/lib/auth/types'
import { Button } from '@/components/ui/Button'
import { Input, FieldLabel } from '@/components/ui/Input'
import clsx from 'clsx'

export default function RegisterPage() {
  const { user, register, mode, configHint } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('artist')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={editorDashboardPath(user.role)} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const created = await register({ name, email, password, role })
      navigate(editorDashboardPath(created.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="section-padding pt-32 min-h-screen">
      <div className="max-w-md mx-auto ios-panel ios-panel-accent">
        <p className="ios-kicker">Join the Institute</p>
        <h1 className="font-serif text-4xl font-bold mt-3">Create Account</h1>

        {configHint ? (
          <p className="mt-4 text-xs px-3 py-2 border border-amber-500/50 text-amber-400">
            {configHint}
          </p>
        ) : mode === 'supabase' ? (
          <p className="mt-4 text-xs px-3 py-2 border border-emerald-500/40 text-emerald-400">
            Connected to Supabase.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <FieldLabel>I am a...</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {(['artist', 'editor'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={clsx(
                    'ios-btn !w-full',
                    role === r
                      ? r === 'editor'
                        ? 'ios-btn-primary'
                        : 'ios-btn-metal'
                      : 'ios-btn-ghost'
                  )}
                >
                  {r === 'editor' ? 'Editor' : 'Artist'}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">
              {role === 'artist'
                ? 'Submit tracks for editorial review.'
                : 'Review submissions and write for the magazine.'}
            </p>
          </div>

          <div>
            <FieldLabel>{role === 'artist' ? 'Artist / Project Name' : 'Full Name'}</FieldLabel>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-mh-red text-sm">{error}</p>}

          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? 'Creating...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-8">
          Already have an account?{' '}
          <Link to="/login" className="ios-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
