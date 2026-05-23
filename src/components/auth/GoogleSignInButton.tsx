import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

interface GoogleSignInButtonProps {
  className?: string
  /** artist = default signup; desk = super editor; editor_apply = join / apply flow */
  intent?: 'artist' | 'desk' | 'editor_apply'
  label?: string
}

export function GoogleSignInButton({
  className,
  intent = 'artist',
  label = 'Continue with Google',
}: GoogleSignInButtonProps) {
  const { signInWithGoogle, mode, configHint } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClick = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle(intent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
      setLoading(false)
    }
  }

  if (mode === 'local') {
    return (
      <p className="text-sm text-muted border border-border px-4 py-3">
        Add Supabase keys in <code className="text-mh-red">.env</code> and enable Google in
        Supabase Auth. See SUPABASE_SETUP.md
      </p>
    )
  }

  return (
    <div className={clsx('space-y-3', className)}>
      {configHint && (
        <p className="text-xs px-3 py-2 border border-amber-500/50 text-amber-400">{configHint}</p>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || Boolean(configHint)}
        className="ios-google-btn w-full"
      >
        <GoogleIcon />
        <span>{loading ? 'Redirecting...' : label}</span>
      </button>
      {error && <p className="text-mh-red text-sm">{error}</p>}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
