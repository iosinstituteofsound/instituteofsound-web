import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Page, PageHeader, PageTitle, PageDescription, PageSection } from '@/shared/components/layout/page-shell'
import { Loader } from '@/shared/components/feedback/loader'
import { SubmissionsDesk } from '@/modules/submissions-desk/components/submissions-desk'
import { useReviewSubmissionTarget, useSubmissionsInbox } from '@/modules/submissions-desk/hooks/use-submissions-inbox'

export function SubmissionsDeskPage({
  title = 'Submissions',
  description = 'Review incoming submissions routed to your active role.',
}: {
  title?: string
  description?: string
}) {
  const [filter, setFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reviewerNotes, setReviewerNotes] = useState('')

  const query = useSubmissionsInbox({ status: filter, page, limit: 10 })
  const review = useReviewSubmissionTarget()

  const selectedRow = useMemo(() => {
    const items = query.data?.items ?? []
    return selectedId ? items.find((i) => i.id === selectedId) ?? null : null
  }, [query.data?.items, selectedId])

  return (
    <Page>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
        <PageDescription>{description}</PageDescription>
      </PageHeader>
      <PageSection>
        {query.isLoading ? (
          <Loader />
        ) : query.isError || !query.data ? (
          <div>Could not load submissions.</div>
        ) : (
          <SubmissionsDesk
            page={query.data}
            filter={filter}
            onFilterChange={(next) => {
              setFilter(next)
              setPage(1)
              setSelectedId(null)
            }}
            onPageChange={(p) => setPage(p)}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id)
              const row = (query.data?.items ?? []).find((i) => i.id === id)
              setReviewerNotes(row?.reviewerNotes ?? '')
            }}
            reviewerNotes={reviewerNotes}
            onReviewerNotesChange={setReviewerNotes}
            onReview={async (status) => {
              if (!selectedRow) return
              try {
                let row = selectedRow
                if (!row.targetId) {
                  const refreshed = await query.refetch()
                  row =
                    refreshed.data?.items.find((i) => i.submissionId === selectedRow.submissionId) ??
                    selectedRow
                }
                if (!row.targetId) {
                  toast.error('Submission target missing. Refresh the page and try again.')
                  return
                }
                await review.mutateAsync({
                  submissionId: row.submissionId,
                  targetId: row.targetId,
                  status,
                  reviewerNotes,
                })
                toast.success('Saved')
              } catch (e) {
                await query.refetch()
                toast.error((e as { message?: string }).message ?? 'Failed to save')
              }
            }}
            isReviewing={review.isPending}
          />
        )}
      </PageSection>
    </Page>
  )
}

