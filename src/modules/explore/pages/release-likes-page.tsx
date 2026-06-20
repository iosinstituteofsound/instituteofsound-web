import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, Home } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getReleaseDetail, getReleaseLikes } from '@/modules/music/api/music.api'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { Loader } from '@/shared/components/feedback/loader'
import { useBreadcrumbHomeHref } from '@/shared/hooks/use-breadcrumb-home'
import '@/modules/explore/styles/release-analytics.css'

export function ReleaseLikesPage() {
  const { id = '' } = useParams()
  const homeHref = useBreadcrumbHomeHref()
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const { data: release } = useQuery({
    queryKey: ['release-detail', id],
    queryFn: () => getReleaseDetail(id),
    enabled: Boolean(id),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['release-likes', id, page, q],
    queryFn: () => getReleaseLikes(id, { page, pageSize: 20, q: q || undefined }),
    enabled: Boolean(id),
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <div className="ios-release-directory">
      <AppBreadcrumb
        items={[
          { label: 'Home', href: homeHref, icon: Home },
          { label: 'Releases', href: '/releases' },
          { label: release?.title ?? 'Release', href: `/releases/${id}` },
          { label: 'Likes' },
        ]}
      />
      <h1 className="text-2xl font-bold">Who liked</h1>
      {release ? <p className="text-muted-foreground">{release.title}</p> : null}

      <div className="ios-release-directory__toolbar">
        <input
          type="search"
          placeholder="Search by name…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {isLoading ? <Loader /> : null}

      <div className="ios-release-directory__grid">
        {data?.items.map((liker) => (
          <Link key={liker.userId} to={liker.profileHref} className="ios-release-listener-card">
            <div className="ios-release-listener-card__avatar">
              {liker.avatarUrl ? (
                <img src={liker.avatarUrl} alt="" />
              ) : (
                <span>{liker.name.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div className="ios-release-listener-card__body">
              <p className="ios-release-listener-card__name">
                {liker.name}
                {liker.isVerified ? <BadgeCheck size={14} aria-label="Verified" /> : null}
              </p>
              {liker.username ? (
                <p className="ios-release-listener-card__username">@{liker.username}</p>
              ) : null}
              <p className="ios-release-listener-card__stats">
                Liked {new Date(liker.likedAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
        {!isLoading && !data?.items.length ? (
          <p className="ios-release-analytics__empty">No likes yet — be the first.</p>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="ios-release-directory__pager">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      ) : null}

      <p className="mt-6">
        <Link to={`/releases/${id}`} className="underline">
          Back to release
        </Link>
      </p>
    </div>
  )
}
