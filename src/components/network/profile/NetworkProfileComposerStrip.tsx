import { Link } from 'react-router-dom'
import { CommunityFeedComposer } from '@/components/community/CommunityFeedComposer'

interface NetworkProfileComposerStripProps {
  isYou: boolean
  onPosted: () => void | Promise<void>
}

export function NetworkProfileComposerStrip({ isYou, onPosted }: NetworkProfileComposerStripProps) {
  if (isYou) {
    return (
      <section className="network-profile-composer ios-card p-4 mb-5" aria-label="Create post">
        <CommunityFeedComposer onPosted={onPosted} />
      </section>
    )
  }

  return (
    <section className="network-profile-composer ios-card p-4 mb-5" aria-label="Community feed">
      <p className="text-[10px] uppercase tracking-[0.2em] text-mh-red font-bold mb-2">Feed</p>
      <Link to="/feed" className="network-profile-composer-link">
        View community feed →
      </Link>
    </section>
  )
}
