import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CommunityFeedComposer } from '@/components/community/CommunityFeedComposer'
import { IOSImage } from '@/components/ui/IOSImage'

interface NetworkProfileComposerStripProps {
  isYou: boolean
  onPosted: () => void | Promise<void>
}

export function NetworkProfileComposerStrip({ isYou, onPosted }: NetworkProfileComposerStripProps) {
  const { user } = useAuth()

  if (isYou) {
    return (
      <section className="network-profile-composer" aria-label="Create post">
        <p className="network-profile-composer-kicker">Share on the wire</p>
        <CommunityFeedComposer onPosted={onPosted} />
      </section>
    )
  }

  return (
    <section className="network-profile-composer network-profile-composer--visitor" aria-label="Community">
      <div className="network-profile-composer-visitor-row">
        {user?.avatarUrl ? (
          <IOSImage src={user.avatarUrl} alt="" width={40} className="network-profile-composer-avatar" />
        ) : (
          <span className="network-profile-composer-avatar-fallback" aria-hidden>
            {(user?.name ?? 'Y').charAt(0).toUpperCase()}
          </span>
        )}
        <Link to="/feed" className="network-profile-composer-faux-input">
          Share something on the wire…
        </Link>
      </div>
      <div className="network-profile-composer-quick" aria-hidden>
        <span>Spin</span>
        <span>Drop</span>
        <span>Photo</span>
        <span>Music</span>
      </div>
      <Link to="/feed" className="network-rail-cta network-profile-composer-cta">
        Open community feed →
      </Link>
    </section>
  )
}
