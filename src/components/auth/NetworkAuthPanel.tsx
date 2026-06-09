import { Link } from 'react-router-dom'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

interface NetworkAuthPanelProps {
  title?: string
  subtitle?: string
}

/** Google sign-in for network members (default signup) */
export function NetworkAuthPanel({
  title = 'Join the network',
  subtitle =
    'One tap with Google. Start as a member — post on the feed, join scenes and collabs. Upgrade to an artist page or apply as an editor anytime from your dashboard.',
}: NetworkAuthPanelProps) {
  return (
    <div className="auth-full-page section-padding">
      <div className="max-w-md mx-auto ios-panel ios-panel-accent">
        <p className="ios-kicker">Institute of Sound</p>
        <h1 className="font-serif text-4xl font-bold mt-3">{title}</h1>
        <p className="text-muted mt-2 text-sm leading-relaxed">{subtitle}</p>

        <div className="mt-10">
          <GoogleSignInButton intent="member" label="Continue with Google" />
        </div>

        <p className="text-sm text-muted mt-8 leading-relaxed">
          Already have an artist studio?{' '}
          <Link to="/login" className="ios-link">
            Sign in
          </Link>
          {' · '}
          <Link to="/editor/join" className="ios-link">
            Editor programme
          </Link>
        </p>

        <p className="text-center text-[10px] tracking-widest uppercase text-muted mt-8">
          Members · Artists · Editors
        </p>
      </div>
    </div>
  )
}
