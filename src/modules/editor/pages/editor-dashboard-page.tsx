import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  deleteEditorArticle,
  listEditorArticles,
  publishEditorArticle,
} from '@/modules/explore/api/explore.api'
import { EditorDeskGrid } from '@/modules/editor/components/editor-desk-grid'
import { EditorSubmissionsEditor } from '@/shared/components/editor-submissions'
import { EditorEventsEditor } from '@/shared/components/editor-events'
import { WirePicksEditor } from '@/shared/components/wire-picks'
import { Page, PageHeader, PageTitle, PageDescription, PageSection } from '@/shared/components/layout/page-shell'
import { Loader } from '@/shared/components/feedback/loader'

type EditorTab = 'write' | 'published' | 'wire' | 'submissions' | 'events'

function resolveTab(pathname: string): EditorTab {
  if (pathname.includes('/published')) return 'published'
  if (pathname.includes('/wire')) return 'wire'
  if (pathname.includes('/submissions')) return 'submissions'
  if (pathname.includes('/events')) return 'events'
  return 'write'
}

export function EditorDashboardPage() {
  const location = useLocation()
  const tab = resolveTab(location.pathname)
  const queryClient = useQueryClient()

  const { data: drafts, isLoading: draftsLoading, refetch: refetchDrafts, isError: draftsError } = useQuery({
    queryKey: ['editor-articles', 'draft'],
    queryFn: () => listEditorArticles('draft'),
    enabled: tab === 'write',
    refetchOnMount: 'always',
  })

  const {
    data: publishedArticles,
    isLoading: publishedLoading,
    refetch: refetchPublished,
    isError: publishedError,
  } = useQuery({
    queryKey: ['editor-articles', 'published'],
    queryFn: () => listEditorArticles('published'),
    enabled: tab === 'published',
    refetchOnMount: 'always',
  })

  useEffect(() => {
    if (draftsError) {
      toast.error('Could not load drafts')
    }
  }, [draftsError])

  useEffect(() => {
    if (publishedError) {
      toast.error('Could not load published articles')
    }
  }, [publishedError])

  useEffect(() => {
    if (tab === 'write') {
      void refetchDrafts()
    }
    if (tab === 'published') {
      void refetchPublished()
    }
  }, [location.pathname, refetchDrafts, refetchPublished, tab])

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

  return (
    <Page>
      <PageHeader>
        <PageTitle>Editor Desk</PageTitle>
      </PageHeader>

      {tab === 'write' ? (
        <PageSection>
          <PageDescription>
            Start a new article or pick up where you left off. Drafts stay here on your desk.
          </PageDescription>
          {draftsLoading ? <Loader /> : null}
          <EditorDeskGrid
            articles={drafts ?? []}
            variant="desk"
            onPublish={(id) => publishMutation.mutate(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
            isPublishing={publishMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        </PageSection>
      ) : null}

      {tab === 'published' ? (
        <PageSection>
          <PageDescription>
            Your live articles on Institute of Sound. Edit anytime or open the public page.
          </PageDescription>
          {publishedLoading ? <Loader /> : null}
          {!publishedLoading && (publishedArticles ?? []).length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No published articles yet. Publish a draft from Write to see it here.
            </p>
          ) : null}
          <EditorDeskGrid
            articles={publishedArticles ?? []}
            variant="published"
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        </PageSection>
      ) : null}

      {tab === 'wire' ? (
        <PageSection>
          <WirePicksEditor enabled={tab === 'wire'} instanceId="editor-desk-wire">
            <PageDescription>
              Curate the live wire — browse trending releases, search site audio, filter by genre, and stack your lineup.
            </PageDescription>
          </WirePicksEditor>
        </PageSection>
      ) : null}

      {tab === 'submissions' ? (
        <PageSection>
          <EditorSubmissionsEditor enabled={tab === 'submissions'}>
            <PageDescription>
              Review artist submissions — listen, annotate, and move tracks through the editorial pipeline.
            </PageDescription>
          </EditorSubmissionsEditor>
        </PageSection>
      ) : null}

      {tab === 'events' ? (
        <PageSection>
          <EditorEventsEditor enabled={tab === 'events'}>
            <PageDescription>
              Schedule listening sessions, meetups, and live broadcasts — curate posters, venues, and ticket links.
            </PageDescription>
          </EditorEventsEditor>
        </PageSection>
      ) : null}
    </Page>
  )
}
