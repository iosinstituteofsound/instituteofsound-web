import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Home } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ReleaseListenerCard } from '@/modules/explore/components/release-listener-card'
import { getReleaseDetail, getReleaseListeners } from '@/modules/music/api/music.api'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { Loader } from '@/shared/components/feedback/loader'
import { useBreadcrumbHomeHref } from '@/shared/hooks/use-breadcrumb-home'
import '@/modules/explore/styles/release-analytics.css'

export function ReleaseListenersPage() {
  const { id = '' } = useParams()
  const homeHref = useBreadcrumbHomeHref()
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('listenTime')

  const { data: release } = useQuery({
    queryKey: ['release-detail', id],
    queryFn: () => getReleaseDetail(id),
    enabled: Boolean(id),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['release-listeners', id, page, sort, q],
    queryFn: () => getReleaseListeners(id, { page, pageSize: 20, sort, q: q || undefined }),
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
          { label: 'Listeners' },
        ]}
      />
      <h1 className="text-2xl font-bold">Listeners</h1>
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
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value)
            setPage(1)
          }}
        >
          <option value="listenTime">Listen time</option>
          <option value="plays">Plays</option>
          <option value="recent">Recent</option>
        </select>
      </div>

      {isLoading ? <Loader /> : null}

      <div className="ios-release-directory__grid">
        {data?.items.map((listener) => (
          <ReleaseListenerCard key={listener.userId} listener={listener} />
        ))}
        {!isLoading && !data?.items.length ? (
          <p className="ios-release-analytics__empty">No listeners yet — be the first.</p>
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
