import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createArtistPlaylist,
  listArtistPlaylists,
  updateArtistPlaylist,
} from '@/modules/music/api/music.api'
import { Page, PageHeader, PageTitle, PageSection } from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Loader } from '@/shared/components/feedback/loader'
import { Badge } from '@/shared/components/ui/badge'

export function MusicPlaylistsPage() {
  const queryClient = useQueryClient()
  const { data: playlists, isLoading } = useQuery({
    queryKey: ['artist-playlists'],
    queryFn: listArtistPlaylists,
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')

  const createMutation = useMutation({
    mutationFn: () =>
      createArtistPlaylist({
        title,
        description: description || undefined,
        visibility,
      }),
    onSuccess: () => {
      toast.success('Playlist created')
      void queryClient.invalidateQueries({ queryKey: ['artist-playlists'] })
      setTitle('')
      setDescription('')
    },
  })

  const toggleVisibility = useMutation({
    mutationFn: ({ id, vis }: { id: string; vis: 'public' | 'private' }) =>
      updateArtistPlaylist(id, { visibility: vis }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['artist-playlists'] }),
  })

  return (
    <Page>
      <PageHeader>
        <PageTitle>Artist Playlists</PageTitle>
      </PageHeader>
      <PageSection className="space-y-6">
        <div className="space-y-3 rounded-lg border p-4">
          <Input placeholder="Playlist title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
          >
            <option value="public">Public (discoverable)</option>
            <option value="private">Private</option>
          </select>
          <Button onClick={() => createMutation.mutate()} disabled={!title || createMutation.isPending}>
            Create Playlist
          </Button>
        </div>

        {isLoading ? <Loader /> : null}

        <div className="space-y-3">
          {(playlists ?? []).map((pl) => (
            <div key={pl.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-semibold">{pl.title}</p>
                <p className="text-sm text-muted-foreground">
                  {pl.tracks.length} tracks · {pl.visibility}
                </p>
              </div>
              <div className="flex items-center gap-2">
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
    </Page>
  )
}
