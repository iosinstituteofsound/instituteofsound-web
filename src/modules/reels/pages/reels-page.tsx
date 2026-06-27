import { useState } from 'react'
import type { FeedScope } from '@/modules/feed/hooks/use-feed'
import { ReelsSidebar, type ReelsTab } from '@/modules/reels/components/reels-sidebar'
import { ReelsViewer } from '@/modules/reels/components/reels-viewer'
import '@/modules/reels/styles/reels.css'

export function ReelsPage() {
  const [activeTab, setActiveTab] = useState<ReelsTab>('all')
  const scope: FeedScope = activeTab === 'following' ? 'following' : 'all'

  return (
    <div className="reels-page">
      <ReelsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'profile' ? (
        <div className="reels-viewer reels-viewer--empty">
          <p className="reels-viewer__empty-title">Your reels</p>
          <p className="reels-viewer__empty-copy">
            Open your profile to see reels you have posted.
          </p>
        </div>
      ) : (
        <ReelsViewer scope={scope} />
      )}
    </div>
  )
}
