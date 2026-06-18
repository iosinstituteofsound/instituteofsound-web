import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createRelease,
  deleteRelease,
  listArtistReleases,
  listArtistTracks,
} from '@/modules/music/api/music.api'
import { Page, PageHeader, PageTitle, PageSection } from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Loader } from '@/shared/components/feedback/loader'
import { Badge } from '@/shared/components/ui/badge'

export function MusicReleasesPage() {
  const queryClient = useQueryClient()
  const { data: releases, isLoading } = useQuery({
    queryKey: ['artist-releases'],
    queryFn: listArtistReleases,
  })
  const { data: tracks } = useQuery({
    queryKey: ['artist-tracks'],
    queryFn: listArtistTracks,
  })

  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'single' | 'ep' | 'album'>('album')
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([])

  const createMutation = useMutation({
    mutationFn: () =>
      createRelease({
        title,
        type,
        trackIds: selectedTrackIds,
      }),
    onSuccess: () => {
      toast.success('Release created')
      void queryClient.invalidateQueries({ queryKey: ['artist-releases'] })
      setShowCreate(false)
      setTitle('')
      setSelectedTrackIds([])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRelease,
    onSuccess: () => {
      toast.success('Release deleted')
      void queryClient.invalidateQueries({ queryKey: ['artist-releases'] })
    },
  })

  const toggleTrack = (id: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>Releases</PageTitle>
      </PageHeader>
      <PageSection className="space-y-6">
        <div className="flex gap-3">
          <Button onClick={() => setShowCreate(!showCreate)}>New Release</Button>
          <Button variant="outline" asChild>
            <Link to="/artist/upload">Upload tracks</Link>
          </Button>
        </div>

        {showCreate ? (
          <div className="space-y-4 rounded-lg border p-4">
            <Input placeholder="Release title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as 'single' | 'ep' | 'album')}
            >
              <option value="single">Single</option>
              <option value="ep">EP</option>
              <option value="album">Album</option>
            </select>
            <div className="space-y-2">
              <p className="text-sm font-medium">Attach tracks</p>
              {(tracks ?? [])
                .filter((t) => t.status === 'ready')
                .map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTrackIds.includes(t.id)}
                      onChange={() => toggleTrack(t.id)}
                    />
                    {t.title}
                  </label>
                ))}
            </div>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!title || !selectedTrackIds.length || createMutation.isPending}
            >
              Create & Publish
            </Button>
          </div>
        ) : null}

        {isLoading ? <Loader /> : null}

        <div className="space-y-3">
          {(releases ?? []).map((release) => (
            <div key={release.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="font-semibold">{release.title}</p>
                <p className="text-sm capitalize text-muted-foreground">
                  {release.type} · {release.tracks.length} tracks
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {release.tracks.map((t) => (
                    <Badge key={t.id} variant="secondary">
                      {t.trackNumber}. {t.title}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(release.id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </PageSection>
    </Page>
  )
}
