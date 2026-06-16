import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { createArtistSubmission, listArtistSubmissions } from '@/modules/explore/api/explore.api'
import { Page, PageHeader, PageTitle, PageSection } from '@/shared/components/layout/page-shell'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Loader } from '@/shared/components/feedback/loader'

export function ArtistDashboardPage() {
  const location = useLocation()
  const isSubmit = location.pathname.includes('/submit')
  const isSubmissions = location.pathname.includes('/submissions')

  const queryClient = useQueryClient()
  const [projectName, setProjectName] = useState('')
  const [genre, setGenre] = useState('')
  const [trackTitle, setTrackTitle] = useState('')
  const [description, setDescription] = useState('')
  const [streamUrl, setStreamUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['artist-submissions'],
    queryFn: listArtistSubmissions,
    enabled: isSubmissions || !isSubmit,
  })

  const submitMutation = useMutation({
    mutationFn: () =>
      createArtistSubmission({
        projectName,
        genre,
        trackTitle,
        description,
        streamUrl,
        coverUrl: coverUrl || undefined,
      }),
    onSuccess: () => {
      toast.success('Track submitted for review')
      void queryClient.invalidateQueries({ queryKey: ['artist-submissions'] })
      setProjectName('')
      setGenre('')
      setTrackTitle('')
      setDescription('')
      setStreamUrl('')
      setCoverUrl('')
    },
    onError: () => toast.error('Submission failed'),
  })

  if (isSubmit) {
    return (
      <Page>
        <PageHeader>
          <PageTitle>Submit Track</PageTitle>
        </PageHeader>
        <PageSection className="max-w-lg space-y-4">
          <Input placeholder="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          <Input placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
          <Input placeholder="Track title" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input placeholder="Stream URL (mp3)" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} />
          <Input placeholder="Cover image URL (optional)" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || !projectName || !genre || !trackTitle || !streamUrl}
          >
            Submit for review
          </Button>
        </PageSection>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>Artist Studio</PageTitle>
      </PageHeader>
      <PageSection className="space-y-4">
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/artist/submit">Submit new track</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/profile">Profile</Link>
          </Button>
        </div>
        {isSubmissions || !isSubmit ? (
          <>
            <h2 className="text-lg font-semibold">My Submissions</h2>
            {isLoading ? <Loader /> : null}
            <div className="space-y-3">
              {(submissions ?? []).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-semibold">{sub.trackTitle}</p>
                    <p className="text-sm text-muted-foreground">{sub.projectName}</p>
                  </div>
                  <Badge>{sub.status}</Badge>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </PageSection>
    </Page>
  )
}
