export function CommunityFeedCardSkeleton() {
  return (
    <div className="community-feed-card-skeleton ios-card" aria-hidden>
      <div className="community-feed-card-skeleton-head">
        <div className="community-feed-card-skeleton-avatar" />
        <div className="community-feed-card-skeleton-lines">
          <div className="community-feed-card-skeleton-line community-feed-card-skeleton-line-short" />
          <div className="community-feed-card-skeleton-line community-feed-card-skeleton-line-xs" />
        </div>
      </div>
      <div className="community-feed-card-skeleton-body" />
      <div className="community-feed-card-skeleton-bar" />
    </div>
  )
}
