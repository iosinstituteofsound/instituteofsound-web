import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  getLabelProfile,
  getLabelReleases,
  getLabelRoster,
  updateLabelProfile,
} from '@/modules/explore/api/explore.api'
import { Page, PageHeader, PageTitle, PageSection } from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Loader } from '@/shared/components/feedback/loader'

export function LabelDashboardPage() {
  const location = useLocation()
  const isRoster = location.pathname.includes('/roster')
  const isReleases = location.pathname.includes('/releases')

  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useQuery({
    queryKey: ['label-profile'],
    queryFn: getLabelProfile,
    enabled: !isRoster && !isReleases,
  })

  const { data: roster, isLoading: rosterLoading } = useQuery({
    queryKey: ['label-roster'],
    queryFn: getLabelRoster,
    enabled: isRoster,
  })

  const { data: releases, isLoading: releasesLoading } = useQuery({
    queryKey: ['label-releases'],
    queryFn: getLabelReleases,
    enabled: isReleases,
  })

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [genres, setGenres] = useState('')

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName)
      setBio(profile.bio ?? '')
      setLogoUrl(profile.logoUrl ?? '')
      setGenres(profile.genres.join(', '))
    }
  }, [profile])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateLabelProfile({
        displayName,
        bio,
        logoUrl: logoUrl || undefined,
        genres: genres.split(',').map((g) => g.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      toast.success('Label profile saved')
      void queryClient.invalidateQueries({ queryKey: ['label-profile'] })
    },
  })

  if (isRoster) {
    return (
      <Page>
        <PageHeader><PageTitle>Roster</PageTitle></PageHeader>
        <PageSection>
          {rosterLoading ? <Loader /> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {(roster as Array<{ displayName: string; slug: string; genres: string[] }> ?? []).map((artist) => (
              <div key={artist.slug} className="rounded-lg border p-4">
                <p className="font-bold">{artist.displayName}</p>
                <p className="text-sm text-muted-foreground">{artist.genres.join(' · ')}</p>
              </div>
            ))}
          </div>
        </PageSection>
      </Page>
    )
  }

  if (isReleases) {
    return (
      <Page>
        <PageHeader><PageTitle>Label Releases</PageTitle></PageHeader>
        <PageSection>
          {releasesLoading ? <Loader /> : null}
          <div className="space-y-3">
            {(releases as Array<{ title: string; artistName?: string }> ?? []).map((release, i) => (
              <div key={`${release.title}-${i}`} className="rounded-lg border p-4">
                <p className="font-semibold">{release.title}</p>
                <p className="text-sm text-muted-foreground">{release.artistName}</p>
              </div>
            ))}
          </div>
        </PageSection>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>Label Studio</PageTitle>
      </PageHeader>
      <PageSection className="max-w-lg space-y-4">
        {isLoading ? <Loader /> : null}
        <Input placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <Textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <Input placeholder="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
        <Input placeholder="Genres (comma separated)" value={genres} onChange={(e) => setGenres(e.target.value)} />
        <div className="flex gap-2">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            Save profile
          </Button>
          <Button variant="outline" asChild>
            <Link to="/profile">Profile</Link>
          </Button>
        </div>
      </PageSection>
    </Page>
  )
}
