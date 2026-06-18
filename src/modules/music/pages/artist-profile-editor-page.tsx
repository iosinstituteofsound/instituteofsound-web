import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getArtistProfile, updateArtistProfile } from '@/modules/music/api/music.api'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { Page, PageHeader, PageTitle, PageSection } from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Loader } from '@/shared/components/feedback/loader'

export function ArtistProfileEditorPage() {
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useQuery({
    queryKey: ['artist-profile'],
    queryFn: getArtistProfile,
  })

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [genres, setGenres] = useState('')

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName)
      setBio(profile.bio ?? '')
      setAvatarUrl(profile.avatarUrl ?? '')
      setCoverUrl(profile.coverUrl ?? '')
      setGenres(profile.genres.join(', '))
    }
  }, [profile])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateArtistProfile({
        displayName,
        bio,
        avatarUrl: avatarUrl || undefined,
        coverUrl: coverUrl || undefined,
        genres: genres.split(',').map((g) => g.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      toast.success('Artist profile saved')
      void queryClient.invalidateQueries({ queryKey: ['artist-profile'] })
    },
  })

  const handleImageUpload = async (file: File, target: 'avatar' | 'cover') => {
    const result = await uploadMediaFile(file, file.name)
    const url = result.absoluteUrl ?? result.url
    if (target === 'avatar') setAvatarUrl(url)
    else setCoverUrl(url)
  }

  if (isLoading) return <Loader />

  return (
    <Page>
      <PageHeader>
        <PageTitle>Artist Profile</PageTitle>
      </PageHeader>
      <PageSection className="max-w-lg space-y-4">
        <Input placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <Textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <Input placeholder="Genres (comma separated)" value={genres} onChange={(e) => setGenres(e.target.value)} />
        <div className="space-y-2">
          <label className="text-sm font-medium">Avatar</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleImageUpload(f, 'avatar')
            }}
          />
          {avatarUrl ? <img src={avatarUrl} alt="" className="size-16 rounded-full object-cover" /> : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Cover</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleImageUpload(f, 'cover')
            }}
          />
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          Save Profile
        </Button>
      </PageSection>
    </Page>
  )
}
