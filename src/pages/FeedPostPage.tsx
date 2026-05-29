import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CommunityFeedCard } from '@/components/community/CommunityFeedCard'
import { CommunityFeedComments } from '@/components/community/CommunityFeedComments'
import { fetchCommunityPostById } from '@/lib/community/feedService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'

export default function FeedPostPage() {
  const { postId } = useParams<{ postId: string }>()
  const { user } = useAuth()
  const [post, setPost] = useState<CommunityFeedPost | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!postId) {
      setPost(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const found = await fetchCommunityPostById(postId)
    setPost(found)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [postId])

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-3 py-8 lg:px-4">
        <p className="text-sm text-muted text-center">Loading post…</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-2xl px-3 py-8 lg:px-4 text-center">
        <p className="font-display font-bold">Post not found</p>
        <p className="text-sm text-muted mt-2">It may have been removed from the wire.</p>
        <Link to="/feed" className="ios-btn ios-btn-metal inline-block mt-6">
          Back to feed →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-3 py-5 lg:px-4 lg:py-8">
      <Link to="/feed" className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-foreground">
        ← Back to feed
      </Link>

      <div className="mt-4">
        <CommunityFeedCard
          post={post}
          isYou={user?.id === post.userId}
          variant="detail"
          onHidden={() => void load()}
          onReactionChange={() => void load()}
        />
      </div>

      <section className="mt-4 ios-card community-feed-post-comments-panel" aria-label="Comments">
        <h2 className="font-display text-lg font-bold mb-4">
          Comments
          {(post.commentCount ?? 0) > 0 && (
            <span className="text-muted font-normal text-base ml-2">({post.commentCount})</span>
          )}
        </h2>
        <CommunityFeedComments
          postId={post.id}
          postOwnerUserId={post.userId}
          onChanged={() => void load()}
        />
      </section>
    </div>
  )
}
