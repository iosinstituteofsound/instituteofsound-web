import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AudioUploadWizard } from '@/modules/music/components/audio-upload-wizard'
import {
  createRelease,
  listArtistTracks,
} from '@/modules/music/api/music.api'
import { Page, PageHeader, PageTitle, PageSection } from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

export function MusicUploadPage() {
  const queryClient = useQueryClient()
  const [readyTrackId, setReadyTrackId] = useState<string | null>(null)
  const [releaseTitle, setReleaseTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [releaseType, setReleaseType] = useState<'single' | 'ep' | 'album'>('single')

  const { data: tracks } = useQuery({
    queryKey: ['artist-tracks'],
    queryFn: listArtistTracks,
  })

  const publishMutation = useMutation({
    mutationFn: () =>
      createRelease({
        title: releaseTitle,
        type: releaseType,
        genre: genre || undefined,
        trackIds: readyTrackId ? [readyTrackId] : undefined,
      }),
    onSuccess: () => {
      toast.success('Release published')
      void queryClient.invalidateQueries({ queryKey: ['artist-releases'] })
      setReadyTrackId(null)
      setReleaseTitle('')
    },
    onError: () => toast.error('Publish failed'),
  })

  const readyTrack = tracks?.find((t) => t.id === readyTrackId)

  return (
    <Page>
      <PageHeader>
        <PageTitle>Upload Music</PageTitle>
      </PageHeader>
      <PageSection className="max-w-xl space-y-8">
        <AudioUploadWizard
          onComplete={(trackId) => {
            setReadyTrackId(trackId)
            const track = tracks?.find((t) => t.id === trackId)
            if (!releaseTitle && track) setReleaseTitle(track.title)
          }}
        />

        {readyTrackId ? (
          <div className="space-y-4 rounded-lg border p-4">
            <h2 className="font-semibold">Publish Release</h2>
            <p className="text-sm text-muted-foreground">
              Track ready: {readyTrack?.title ?? readyTrackId}
            </p>
            <Input
              placeholder="Release title"
              value={releaseTitle}
              onChange={(e) => setReleaseTitle(e.target.value)}
            />
            <Input placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={releaseType}
              onChange={(e) => setReleaseType(e.target.value as 'single' | 'ep' | 'album')}
            >
              <option value="single">Single</option>
              <option value="ep">EP</option>
              <option value="album">Album</option>
            </select>
            <Button
              onClick={() => publishMutation.mutate()}
              disabled={!releaseTitle || publishMutation.isPending}
            >
              Publish Now
            </Button>
          </div>
        ) : null}

        <Button variant="outline" asChild>
          <Link to="/artist/releases">Manage releases</Link>
        </Button>
      </PageSection>
    </Page>
  )
}
