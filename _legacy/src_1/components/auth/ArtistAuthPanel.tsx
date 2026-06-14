import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { IosBrandLockup } from '@/components/layout/IosBrandLockup'

interface ArtistAuthPanelProps {
  title?: string
  subtitle?: string
}

/** Single Google sign-in UI — used on /login and /register */
export function ArtistAuthPanel({
  title = 'Sign in with Google',
  subtitle = 'One tap with Google — no password, no confirmation email. New artists get My Studio to build a band page and submit tracks.',
}: ArtistAuthPanelProps) {
  return (
    <div className="auth-full-page section-padding">
      <div className="max-w-md mx-auto ios-panel ios-panel-accent">
        <IosBrandLockup to="/" size="sm" className="mb-6" />
        <p className="ios-kicker">Artist Portal</p>
        <h1 className="font-serif text-4xl font-bold mt-3">{title}</h1>
        <p className="text-muted mt-2 text-sm leading-relaxed">{subtitle}</p>

        <div className="mt-10">
          <GoogleSignInButton label="Continue with Google" />
        </div>

        <p className="text-center text-[10px] tracking-widest uppercase text-muted mt-8">
          Institute of Sound · Artists only
        </p>
      </div>
    </div>
  )
}
