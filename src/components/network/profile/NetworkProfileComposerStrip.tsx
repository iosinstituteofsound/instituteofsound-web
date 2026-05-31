import { Link } from 'react-router-dom'
import { CommunityFeedComposer } from '@/components/community/CommunityFeedComposer'

interface NetworkProfileComposerStripProps {
  isYou: boolean
  onPosted: () => void | Promise<void>
}

export function NetworkProfileComposerStrip({ isYou, onPosted }: NetworkProfileComposerStripProps) {
  if (isYou) {
    return (
      <section className="member-profile-broadcast" aria-label="Broadcast">
        <div className="member-profile-broadcast-head">
          <p className="member-profile-kicker">Broadcast</p>
          <p className="member-profile-broadcast-hint">Spin · drop · link · photo</p>
        </div>
        <CommunityFeedComposer onPosted={onPosted} />
      </section>
    )
  }

  return (
    <section className="member-profile-broadcast member-profile-broadcast--visitor" aria-label="Join the wire">
      <p className="member-profile-kicker">The wire</p>
      <p className="member-profile-broadcast-copy">
        Sign in to broadcast from your profile, or tune into the live feed.
      </p>
      <div className="member-profile-broadcast-actions">
        <Link to="/feed" className="member-profile-btn member-profile-btn-primary">
          Open wire feed
        </Link>
        <Link to="/network/people" className="member-profile-btn member-profile-btn-ghost">
          Find operators
        </Link>
      </div>
    </section>
  )
}
