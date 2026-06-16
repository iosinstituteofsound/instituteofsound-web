import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  createEditorArticle,
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
import { RichTextEditor } from '@/modules/editor/components/rich-text-editor'
import { WirePicksBuilder } from '@/modules/editor/components/wire-picks-builder'
import { Page, PageHeader, PageTitle, PageSection } from '@/shared/components/layout/page-shell'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
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

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [bodyHtml, setBodyHtml] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [submissionFilter, setSubmissionFilter] = useState('all')
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)
  const [editorNotes, setEditorNotes] = useState('')
  const [wireItems, setWireItems] = useState<WirePickItem[]>([])

  const { data: drafts, isLoading: draftsLoading } = useQuery({
    queryKey: ['editor-articles', 'draft'],
    queryFn: () => listEditorArticles('draft'),
    enabled: tab === 'drafts' || tab === 'write',
  })

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

  const createMutation = useMutation({
    mutationFn: () =>
      createEditorArticle({ title, excerpt, bodyHtml, coverUrl: coverUrl || undefined }),
    onSuccess: () => {
      toast.success('Draft saved')
      void queryClient.invalidateQueries({ queryKey: ['editor-articles'] })
      setTitle('')
      setExcerpt('')
      setBodyHtml('')
      setCoverUrl('')
    },
    onError: () => toast.error('Failed to save draft'),
  })

  const publishMutation = useMutation({
    mutationFn: publishEditorArticle,
    onSuccess: () => {
      toast.success('Published')
      void queryClient.invalidateQueries({ queryKey: ['editor-articles', 'explore'] })
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

      {tab === 'write' ? (
        <PageSection className="max-w-3xl space-y-4">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          <Input placeholder="Cover image URL" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
          <RichTextEditor value={bodyHtml} onChange={setBodyHtml} />
          <Button onClick={() => createMutation.mutate()} disabled={!title.trim() || createMutation.isPending}>
            Save draft
          </Button>
        </PageSection>
      ) : null}

      {tab === 'drafts' ? (
        <PageSection>
          {draftsLoading ? <Loader /> : null}
          <div className="space-y-3">
            {(drafts ?? []).map((draft) => (
              <div key={draft.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-semibold">{draft.title}</p>
                  <p className="text-sm text-muted-foreground">{draft.excerpt}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => publishMutation.mutate(draft.id)}>
                    Publish
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(draft.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
