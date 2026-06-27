import { useCallback, useEffect } from 'react'
import type { FeedScope } from '@/modules/feed/hooks/use-feed'
import { useActiveReelIndex } from '@/modules/reels/hooks/use-active-reel-index'
import { useReelsFeed } from '@/modules/reels/hooks/use-reels-feed'
import { ReelSlide } from '@/modules/reels/components/reel-slide'
import { ReelsNavButtons } from '@/modules/reels/components/reels-nav-buttons'
import { ErrorState } from '@/shared/components/feedback/states'
import { PageLoader } from '@/shared/components/feedback/loader'
import { Skeleton } from '@/shared/components/ui/skeleton'

interface ReelsViewerProps {
  scope: FeedScope
}

export function ReelsViewer({ scope }: ReelsViewerProps) {
  const { items, isLoading, isError, refetch, loadMore, isFetchingNextPage } = useReelsFeed(scope)

  const handleNearEnd = useCallback(() => {
    loadMore()
  }, [loadMore])

  const {
    containerRef,
    setSlideRef,
    activeIndex,
    goNext,
    goPrev,
    canGoNext,
    canGoPrev,
  } = useActiveReelIndex({
    itemCount: items.length,
    onNearEnd: handleNearEnd,
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'j') {
        event.preventDefault()
        goNext()
      }
      if (event.key === 'ArrowUp' || event.key === 'k') {
        event.preventDefault()
        goPrev()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goPrev])

  if (isLoading) {
    return (
      <div className="reels-viewer reels-viewer--loading">
        <Skeleton className="reels-viewer__skeleton" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="reels-viewer reels-viewer--empty">
        <ErrorState title="Could not load reels" onRetry={() => void refetch()} />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="reels-viewer reels-viewer--empty">
        <p className="reels-viewer__empty-title">No reels yet</p>
        <p className="reels-viewer__empty-copy">
          Video posts from the feed will appear here. Share a video to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="reels-viewer">
      <div ref={containerRef} className="reels-viewer__scroll">
        {items.map((item, index) => (
          <ReelSlide
            key={item.id}
            item={item}
            active={index === activeIndex}
            setRef={(node) => setSlideRef(index, node)}
          />
        ))}
        {isFetchingNextPage ? (
          <div className="reels-viewer__loader" aria-hidden>
            <PageLoader />
          </div>
        ) : null}
      </div>

      <ReelsNavButtons
        className="reels-viewer__nav"
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  )
}
