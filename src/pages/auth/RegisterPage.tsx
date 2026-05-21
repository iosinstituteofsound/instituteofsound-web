import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { editorDashboardPath } from '@/lib/auth/roles'
import type { UserRole } from '@/lib/auth/types'
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
    return (
      <Navigate
        to={editorDashboardPath(user.role)}
        replace
      />
    )
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
      <div className="max-w-md mx-auto">
        <p className="text-[11px] tracking-[0.25em] uppercase text-mh-red font-semibold">
          Join the Institute
        </p>
        <h1 className="font-serif text-4xl font-bold mt-2">Create Account</h1>

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
            <p className="text-[10px] tracking-widest uppercase text-muted mb-3">
              I am a...
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(['artist', 'editor'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={clsx(
                    'py-3 text-xs tracking-widest uppercase font-bold border transition-colors',
                    role === r
                      ? r === 'editor'
                        ? 'bg-rs-red border-rs-red text-white'
                        : 'bg-mh-red border-mh-red text-white'
                      : 'border-border text-muted hover:border-signal/40'
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
            <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
              {role === 'artist' ? 'Artist / Project Name' : 'Full Name'}
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface border border-border px-4 py-3 text-sm focus:outline-none focus:border-rs-red"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-border px-4 py-3 text-sm focus:outline-none focus:border-rs-red"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted block mb-2">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-border px-4 py-3 text-sm focus:outline-none focus:border-rs-red"
            />
          </div>

          {error && <p className="text-mh-red text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={clsx(
              'w-full py-3 text-xs tracking-[0.2em] uppercase font-bold text-white transition-colors disabled:opacity-50',
              role === 'editor' ? 'bg-rs-red hover:bg-mh-red' : 'bg-mh-red hover:bg-rs-red'
            )}
          >
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-rs-red hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
