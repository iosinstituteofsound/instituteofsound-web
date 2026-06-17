import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  createEditorEvent,
  deleteEditorArticle,
  getWireCandidates,
  getWirePicks,
  listEditorArticles,
  listEditorEvents,
  listEditorSubmissions,
  publishEditorArticle,
  reviewSubmission,
  saveWirePicks,
} from '@/modules/explore/api/explore.api'
import type { WirePickItem } from '@/modules/explore/types/explore.types'
import { EditorDeskGrid } from '@/modules/editor/components/editor-desk-grid'
import { WirePicksBuilder } from '@/modules/editor/components/wire-picks-builder'
import { Page, PageHeader, PageTitle, PageDescription, PageSection } from '@/shared/components/layout/page-shell'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { Loader } from '@/shared/components/feedback/loader'
import { cn } from '@/shared/lib/cn'

type EditorTab = 'write' | 'drafts' | 'wire' | 'submissions' | 'events'

function resolveTab(pathname: string): EditorTab {
  if (pathname.includes('/drafts')) return 'drafts'
  if (pathname.includes('/wire')) return 'wire'
  if (pathname.includes('/submissions')) return 'submissions'
  if (pathname.includes('/events')) return 'events'
  return 'write'
}

export function EditorDashboardPage() {
  const location = useLocation()
  const tab = resolveTab(location.pathname)
  const queryClient = useQueryClient()

  const [submissionFilter, setSubmissionFilter] = useState('all')
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)
  const [editorNotes, setEditorNotes] = useState('')
  const [wireItems, setWireItems] = useState<WirePickItem[]>([])

  const { data: drafts, isLoading: draftsLoading, refetch: refetchDrafts, isError: draftsError } = useQuery({
    queryKey: ['editor-articles', 'draft'],
    queryFn: () => listEditorArticles('draft'),
    enabled: tab === 'drafts' || tab === 'write',
    refetchOnMount: 'always',
  })

  useEffect(() => {
    if (draftsError) {
      toast.error('Could not load drafts')
    }
  }, [draftsError])

  useEffect(() => {
    if (tab === 'write' || tab === 'drafts') {
      void refetchDrafts()
    }
  }, [location.pathname, refetchDrafts, tab])

  const { data: submissions, isLoading: subsLoading } = useQuery({
    queryKey: ['editor-submissions', submissionFilter],
    queryFn: () => listEditorSubmissions(submissionFilter === 'all' ? undefined : submissionFilter),
    enabled: tab === 'submissions',
  })

  const { data: wirePicks } = useQuery({
    queryKey: ['wire-picks'],
    queryFn: getWirePicks,
    enabled: tab === 'wire',
  })

  const { data: wireCandidates } = useQuery({
    queryKey: ['wire-candidates'],
    queryFn: getWireCandidates,
    enabled: tab === 'wire',
  })

  const { data: events } = useQuery({
    queryKey: ['editor-events'],
    queryFn: listEditorEvents,
    enabled: tab === 'events',
  })

  useEffect(() => {
    if (wirePicks) setWireItems(wirePicks)
  }, [wirePicks])

  const publishMutation = useMutation({
    mutationFn: publishEditorArticle,
    onSuccess: () => {
      toast.success('Published')
      void queryClient.invalidateQueries({ queryKey: ['editor-articles'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEditorArticle,
    onSuccess: () => {
      toast.success('Deleted')
      void queryClient.invalidateQueries({ queryKey: ['editor-articles'] })
    },
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      reviewSubmission(id, { status, editorNotes }),
    onSuccess: () => {
      toast.success('Submission updated')
      void queryClient.invalidateQueries({ queryKey: ['editor-submissions'] })
      setSelectedSubmissionId(null)
      setEditorNotes('')
    },
  })

  const saveWireMutation = useMutation({
    mutationFn: () => saveWirePicks(wireItems),
    onSuccess: () => toast.success('Wire picks saved'),
  })

  const selectedSubmission = submissions?.find((s) => s.id === selectedSubmissionId)

  return (
    <Page>
      <PageHeader>
        <PageTitle>Editor Desk</PageTitle>
      </PageHeader>

      {tab === 'write' || tab === 'drafts' ? (
        <PageSection>
          <PageDescription>
            Start a new article or pick up where you left off. Drafts stay here on your desk.
          </PageDescription>
          {draftsLoading ? <Loader /> : null}
          <EditorDeskGrid
            drafts={drafts ?? []}
            onPublish={(id) => publishMutation.mutate(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
            isPublishing={publishMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        </PageSection>
      ) : null}

      {tab === 'wire' ? (
        <PageSection>
          <WirePicksBuilder items={wireItems} candidates={wireCandidates} onChange={setWireItems} />
          <Button className="mt-4" onClick={() => saveWireMutation.mutate()} disabled={saveWireMutation.isPending}>
            Save wire picks
          </Button>
        </PageSection>
      ) : null}

      {tab === 'submissions' ? (
        <PageSection>
          <div className="mb-4 flex flex-wrap gap-2">
            {(['all', 'pending', 'in_review', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={cn(
                  'rounded border px-3 py-1 text-xs uppercase tracking-wider',
                  submissionFilter === f && 'border-primary text-primary',
                )}
                onClick={() => setSubmissionFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          {subsLoading ? <Loader /> : null}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              {(submissions ?? []).map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  className={cn(
                    'w-full rounded-lg border p-4 text-left',
                    selectedSubmissionId === sub.id && 'border-primary',
                  )}
                  onClick={() => setSelectedSubmissionId(sub.id)}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{sub.trackTitle}</p>
                    <Badge variant="outline">{sub.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{sub.projectName} · {sub.genre}</p>
                </button>
              ))}
            </div>
            {selectedSubmission ? (
              <div className="space-y-4 rounded-lg border p-4">
                <p className="font-bold">{selectedSubmission.trackTitle}</p>
                <p className="text-sm">{selectedSubmission.description}</p>
                <audio controls src={selectedSubmission.streamUrl} className="w-full" />
                <Textarea
                  placeholder="Editor notes"
                  value={editorNotes}
                  onChange={(e) => setEditorNotes(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => reviewMutation.mutate({ id: selectedSubmission.id, status: 'in_review' })}>
                    In review
                  </Button>
                  <Button size="sm" onClick={() => reviewMutation.mutate({ id: selectedSubmission.id, status: 'approved' })}>
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => reviewMutation.mutate({ id: selectedSubmission.id, status: 'rejected' })}>
                    Reject
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </PageSection>
      ) : null}

      {tab === 'events' ? (
        <PageSection className="space-y-4">
          {(events ?? []).map((event) => {
            const e = event as { id: string; title: string; venue: string; startsAt: string }
            return (
              <div key={e.id} className="rounded-lg border p-4">
                <p className="font-semibold">{e.title}</p>
                <p className="text-sm text-muted-foreground">{e.venue} · {new Date(e.startsAt).toLocaleString()}</p>
              </div>
            )
          })}
          <Button
            onClick={() =>
              createEditorEvent({
                title: 'New IOS Event',
                slug: `event-${Date.now()}`,
                startsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
                venue: 'TBA',
              }).then(() => queryClient.invalidateQueries({ queryKey: ['editor-events'] }))
            }
          >
            Quick add event
          </Button>
        </PageSection>
      ) : null}
    </Page>
  )
}
