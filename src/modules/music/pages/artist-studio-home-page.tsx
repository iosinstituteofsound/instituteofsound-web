import { Link } from 'react-router-dom'
import { Disc3, ListMusic, Upload, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { listArtistReleases, listArtistTracks } from '@/modules/music/api/music.api'
import { Page, PageHeader, PageTitle, PageSection } from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'
import { Loader } from '@/shared/components/feedback/loader'

export function ArtistStudioHomePage() {
  const { data: releases, isLoading: releasesLoading } = useQuery({
    queryKey: ['artist-releases'],
    queryFn: listArtistReleases,
  })
  const { data: tracks, isLoading: tracksLoading } = useQuery({
    queryKey: ['artist-tracks'],
    queryFn: listArtistTracks,
  })

  return (
    <Page>
      <PageHeader>
        <PageTitle>Artist Studio</PageTitle>
      </PageHeader>
      <PageSection className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button asChild className="h-auto flex-col gap-2 py-6">
            <Link to="/artist/upload">
              <Upload className="size-6" />
              Upload Track
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6">
            <Link to="/artist/releases">
              <Disc3 className="size-6" />
              Releases
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6">
            <Link to="/artist/playlists">
              <ListMusic className="size-6" />
              Playlists
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6">
            <Link to="/artist/profile">
              <User className="size-6" />
              Profile
            </Link>
          </Button>
        </div>

        {releasesLoading || tracksLoading ? <Loader /> : null}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Recent Releases</h2>
            <div className="space-y-2">
              {(releases ?? []).slice(0, 5).map((r) => (
                <div key={r.id} className="rounded-lg border p-3">
                  <p className="font-medium">{r.title}</p>
                  <p className="text-sm capitalize text-muted-foreground">
                    {r.type} · {r.tracks.length} track{r.tracks.length === 1 ? '' : 's'}
                  </p>
                </div>
              ))}
              {!releases?.length ? (
                <p className="text-sm text-muted-foreground">No releases yet. Upload a track to get started.</p>
              ) : null}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold">Track Library</h2>
            <div className="space-y-2">
              {(tracks ?? []).slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                  <p className="font-medium">{t.title}</p>
                  <span className="text-xs capitalize text-muted-foreground">{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageSection>
    </Page>
  )
}
