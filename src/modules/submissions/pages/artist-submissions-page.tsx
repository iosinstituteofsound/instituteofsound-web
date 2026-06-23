import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { listArtistSubmissions } from '@/modules/explore/api/explore.api'
import '@/modules/submissions/styles/submission-wizard.css'
import { SubmissionStatusBadge } from '@/shared/components/editor-submissions/components/submission-status-badge'
import { PageLoader } from '@/shared/components/feedback/loader'
import { Button } from '@/shared/components/ui/button'

export function ArtistSubmissionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['artist-submissions'],
    queryFn: listArtistSubmissions,
  })

  const submissions = data ?? []

  return (
    <div className="sub-list-page">
      <div className="sub-list-page__header">
        <div>
          <h1 className="sub-list-page__title">My Submissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track editorial submissions and pitch your releases for placement.
          </p>
        </div>
        <Button asChild>
          <Link to="/artist/submissions/new">
            <Plus className="size-4" />
            New Submission
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : submissions.length === 0 ? (
        <div className="sub-panel">
          <div className="sub-panel__body py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Submit your first release for editorial consideration.
            </p>
            <Button asChild className="mt-4">
              <Link to="/artist/submissions/new">Start a submission</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {submissions.map((sub) => (
            <article key={sub.id} className="sub-list-item">
              <div>
                <h2 className="sub-list-item__title">{sub.trackTitle}</h2>
                <p className="sub-list-item__meta">
                  {sub.projectName} · {sub.genre}
                </p>
                <p className="sub-list-item__meta">
                  Submitted {new Date(sub.createdAt).toLocaleDateString()}
                </p>
                {sub.status === 'rejected' && sub.editorNotes ? (
                  <p className="sub-list-item__notes">{sub.editorNotes}</p>
                ) : null}
              </div>
              <SubmissionStatusBadge status={sub.status} />
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
