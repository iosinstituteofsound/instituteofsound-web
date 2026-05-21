import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { editorDashboardPath } from '@/lib/auth/roles'
import { MetalButton } from '@/components/ui/MetalButton'
import { MetalInput } from '@/components/ui/MetalInput'
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
    <div className="section-padding pt-32 min-h-screen metal-section">
      <div className="max-w-md mx-auto metal-card p-8 md:p-10">
        <div className="metal-rule-stack mb-4">
          <span />
          <span />
          <span />
        </div>
        <p className="metal-kicker">Join the Institute</p>
        <h1 className="font-metal text-4xl text-signal mt-2">Create Account</h1>

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
            <p className="metal-kicker text-[9px] mb-3">I am a...</p>
            <div className="grid grid-cols-2 gap-3">
              {(['artist', 'editor'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={clsx(
                    'py-3 text-[10px] tracking-[0.2em] uppercase font-bold border transition-colors',
                    role === r
                      ? r === 'editor'
                        ? 'bg-rs-red border-rs-red text-white metal-btn'
                        : 'bg-mh-red border-mh-red text-white'
                      : 'border-border text-muted hover:border-mh-red/40'
                  )}
                  style={
                    role === r
                      ? { clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }
                      : undefined
                  }
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
            <label className="metal-kicker text-[9px] block mb-2">
              {role === 'artist' ? 'Artist / Project Name' : 'Full Name'}
            </label>
            <MetalInput required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="metal-kicker text-[9px] block mb-2">Email</label>
            <MetalInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="metal-kicker text-[9px] block mb-2">Password</label>
            <MetalInput
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-mh-red text-sm">{error}</p>}

          <MetalButton
            type="submit"
            variant={role === 'editor' ? 'rs' : 'primary'}
            disabled={submitting}
            className="w-full"
          >
            <span className="metal-btn-inner w-full justify-center">
              {submitting ? 'Creating...' : 'Create Account'}
            </span>
          </MetalButton>
        </form>

        <p className="text-center text-sm text-muted mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-mh-red hover:text-rs-red font-medium uppercase text-xs tracking-wider">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
