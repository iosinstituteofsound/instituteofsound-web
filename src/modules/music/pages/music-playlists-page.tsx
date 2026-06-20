import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  createArtistPlaylist,
  listArtistPlaylists,
  updateArtistPlaylist,
} from '@/modules/music/api/music.api'
import { ProfileImageUpload } from '@/modules/profile/components/profile-image-upload'
import { Page, PageHeader, PageTitle, PageSection } from '@/shared/components/layout/page-shell'
import { Loader } from '@/shared/components/feedback/loader'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'

export function MusicPlaylistsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: playlists, isLoading } = useQuery({
    queryKey: ['artist-playlists'],
    queryFn: listArtistPlaylists,
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCoverUrl('')
    setVisibility('public')
  }

  const createMutation = useMutation({
    mutationFn: () =>
      createArtistPlaylist({
        title,
        description: description || undefined,
        coverUrl: coverUrl || undefined,
        visibility,
      }),
    onSuccess: (playlist) => {
      toast.success('Playlist created')
      void queryClient.invalidateQueries({ queryKey: ['artist-playlists'] })
      resetForm()
      navigate(`/artist/playlists/${playlist.slug}`)
    },
  })

  const toggleVisibility = useMutation({
    mutationFn: ({ id, vis }: { id: string; vis: 'public' | 'private' }) =>
      updateArtistPlaylist(id, { visibility: vis }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['artist-playlists'] }),
  })

  return (
    <Page>
      <div className="mx-auto w-full max-w-3xl space-y-6 lg:max-w-4xl">
        <PageHeader className="justify-center sm:justify-between">
          <PageTitle className="text-center sm:text-left">Artist Playlists</PageTitle>
        </PageHeader>

        <PageSection className="space-y-6">
          <div className="rounded-lg border p-5 sm:p-6 md:p-8">
            <p className="mb-5 text-center text-sm font-medium sm:text-left">New playlist</p>

            <div className="grid gap-6 md:grid-cols-[minmax(12rem,14rem)_minmax(0,1fr)] md:items-start lg:grid-cols-[14rem_minmax(0,1fr)]">
              <div className="mx-auto w-full max-w-[14rem] text-center md:mx-0 md:max-w-none md:text-left">
                <ProfileImageUpload
                  label="Cover art"
                  description="Square · PNG or JPG"
                  size="lg"
                  value={coverUrl}
                  onChange={(url) => setCoverUrl(url ?? '')}
                />
              </div>

              <div className="flex min-h-0 flex-col gap-4 md:min-h-48 lg:min-h-52 xl:min-h-56">
                <div className="space-y-2">
                  <Label htmlFor="playlist-title">Title</Label>
                  <Input
                    id="playlist-title"
                    placeholder="Playlist title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="flex min-h-0 flex-1 flex-col space-y-2">
                  <Label htmlFor="playlist-description">Description</Label>
                  <Textarea
                    id="playlist-description"
                    placeholder="Tell listeners what this playlist is about"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[6.5rem] flex-1 resize-none sm:min-h-[7.5rem]"
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="playlist-visibility">Visibility</Label>
                    <select
                      id="playlist-visibility"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                    >
                      <option value="public">Public (discoverable)</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => createMutation.mutate()}
                    disabled={!title || createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      'Create Playlist'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? <Loader /> : null}

          {!isLoading && !(playlists ?? []).length ? (
            <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
              No playlists yet. Create your first one above.
            </p>
          ) : null}

          <div className="space-y-3">
            {(playlists ?? []).map((pl) => (
              <div
                key={pl.id}
                className="flex flex-col gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <Link
                  to={`/artist/playlists/${pl.slug}`}
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <div className="size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {pl.coverUrl ? (
                      <img src={pl.coverUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs font-semibold uppercase text-muted-foreground">
                        {pl.title.slice(0, 2)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{pl.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {pl.tracks.length} tracks · {pl.visibility}
                    </p>
                  </div>

                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>

                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                  <Badge variant={pl.visibility === 'public' ? 'default' : 'secondary'}>
                    {pl.visibility}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toggleVisibility.mutate({
                        id: pl.id,
                        vis: pl.visibility === 'public' ? 'private' : 'public',
                      })
                    }
                  >
                    Toggle visibility
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      </div>
    </Page>
  )
}
