import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { buildToolDropBody, queueToolDropDraft } from '@/lib/academy/academyLoop'

interface ToolDropCtaProps {
  toolName: string
  detail: string
}

export function ToolDropCta({ toolName, detail }: ToolDropCtaProps) {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="tool-drop-cta">
        <p className="text-sm text-muted">
          <Link to="/login" className="text-rs-red hover:underline">
            Sign in
          </Link>{' '}
          to share this result as a Drop on the network (+5 dB).
        </p>
      </div>
    )
  }

  return (
    <div className="tool-drop-cta ios-card">
      <p className="ios-kicker">Share on the wire</p>
      <p className="text-sm mt-1">Turn this toolkit result into a community Drop.</p>
      <Link
        to="/community#feed"
        className="ios-btn ios-btn-metal mt-3 inline-block"
        onClick={() => queueToolDropDraft(buildToolDropBody(toolName, detail))}
      >
        Post as Drop →
      </Link>
    </div>
  )
}
