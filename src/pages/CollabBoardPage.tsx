import { useEffect, useMemo, useState } from 'react'
import { fetchCollabPost } from '@/lib/collab/service'
import type { CollabBoardPost } from '@/lib/collab/types'
import { Link, useSearchParams } from 'react-router-dom'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CollabBoardFilters } from '@/components/collab/CollabBoardFilters'
import { CollabPostComposer } from '@/components/collab/CollabPostComposer'
import { CollabPostCard } from '@/components/collab/CollabPostCard'
import { useCollabBoard } from '@/hooks/useCollabBoard'
import type { CollabBoardFilters as Filters } from '@/lib/collab/types'
import { useSeo } from '@/hooks/useSeo'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'

export default function CollabBoardPage() {
  const [searchParams] = useSearchParams()
  const highlightPostId = searchParams.get('post')

  const [filters, setFilters] = useState<Filters>({})
  const { posts, loading, refresh } = useCollabBoard(filters)
  const [extraPost, setExtraPost] = useState<CollabBoardPost | null>(null)

  useEffect(() => {
    if (!highlightPostId) {
      setExtraPost(null)
      return
    }
    if (posts.some((p) => p.id === highlightPostId)) {
      setExtraPost(null)
      return
    }
    void fetchCollabPost(highlightPostId).then(setExtraPost)
  }, [highlightPostId, posts])

  useSeo({
    title: 'Collab Board',
    description:
      'Post what you need. Find who is building — open calls by city, genre, and skill. India-first underground collab network.',
    canonicalPath: '/collab',
    jsonLd: breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Community', path: '/community' },
      { name: 'Collab', path: '/collab' },
    ]),
  })

  const sortedPosts = useMemo(() => {
    const base = extraPost ? [extraPost, ...posts.filter((p) => p.id !== extraPost.id)] : posts
    if (!highlightPostId) return base
    const highlighted = base.find((p) => p.id === highlightPostId)
    if (!highlighted) return base
    return [highlighted, ...base.filter((p) => p.id !== highlightPostId)]
  }, [posts, extraPost, highlightPostId])

  return (
    <div className="section-padding pt-32 pb-20">
      <div className="max-w-3xl mx-auto">
        <SectionHeading
          label="Phase 15 · Network"
          title="Collab board"
          subtitle="Post what you need. Find who is building. Replies stay on the board — no public DMs in v1."
          titleAs="h1"
        />

        <p className="discovery-anti-algo text-sm text-muted max-w-2xl mb-8 border-l-2 border-mh-red pl-4">
          Trust = completed collabs both sides confirm — not dB alone.
        </p>

        <CollabPostComposer onPosted={() => void refresh()} />

        <div className="mt-10">
          <CollabBoardFilters value={filters} onChange={setFilters} />
        </div>

        <div className="collab-board-list mt-8 space-y-6">
          {loading && posts.length === 0 && (
            <p className="text-sm text-muted text-center py-8">Loading board…</p>
          )}
          {!loading && posts.length === 0 && (
            <div className="ios-card p-6 text-center">
              <p className="font-display font-bold">No open calls match these filters</p>
              <p className="text-sm text-muted mt-2">Post a need or offer — Delhi, Mumbai, Bangalore crews are warming up.</p>
            </div>
          )}
          {sortedPosts.map((post) => (
            <CollabPostCard
              key={post.id}
              post={post}
              expanded={post.id === highlightPostId}
              onChange={() => void refresh()}
            />
          ))}
        </div>

        <p className="text-sm text-muted mt-12 text-center">
          <Link to="/community" className="text-mh-red">
            ← Back to the network
          </Link>
          {' · '}
          <Link to="/scenes" className="text-mh-red">
            India scenes
          </Link>
        </p>
      </div>
    </div>
  )
}
