import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Disc3 } from 'lucide-react'
import { toast } from 'sonner'
import { invalidateArtistSurfaceQueries } from '@/modules/explore/lib/invalidate-artist-surface'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { normalizeMediaUrl } from '@/modules/editor/lib/normalize-media-url'
import { listArtistReleases, listArtistTracks, updateRelease } from '@/modules/music/api/music.api'
import { ReleaseDatePicker } from '@/modules/music/components/release-date-picker'
import { Page, PageHeader, PageSection, PageTitle } from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Loader } from '@/shared/components/feedback/loader'
import '@/modules/music/styles/release-builder.css'

async function resolveCoverUrl(coverUrl: string, coverPreviewUrl: string): Promise<string | undefined> {
  const normalizedExisting = normalizeMediaUrl(coverUrl)
  if (normalizedExisting) return normalizedExisting

  if (!coverPreviewUrl.startsWith('blob:')) {
    return normalizeMediaUrl(coverPreviewUrl)
  }

  const response = await fetch(coverPreviewUrl)
  const blob = await response.blob()
  const extension = blob.type.split('/')[1] || 'jpg'
  const result = await uploadMediaFile(blob, `cover-${Date.now()}.${extension}`)
  return normalizeMediaUrl(result.absoluteUrl ?? result.url)
}

export function MusicReleaseEditPage() {
  const { releaseId } = useParams<{ releaseId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: releases, isLoading: releasesLoading } = useQuery({
    queryKey: ['artist-releases'],
    queryFn: listArtistReleases,
  })
  const { data: tracks } = useQuery({
    queryKey: ['artist-tracks'],
    queryFn: listArtistTracks,
  })

  const release = useMemo(
    () => (releases ?? []).find((item) => item.id === releaseId),
    [releases, releaseId],
  )

  const [title, setTitle] = useState('')
  const [type, setType] = useState<'single' | 'ep' | 'album'>('single')
  const [genre, setGenre] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('')
  const [coverFileName, setCoverFileName] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!release || initialized) return
    setTitle(release.title)
    setType(release.type)
    setGenre(release.genre ?? '')
    setReleaseDate(release.releaseDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
    setCoverUrl(release.coverUrl ?? '')
    setSelectedTrackIds(release.tracks.map((track) => track.id))
    setInitialized(true)
  }, [release, initialized])

  useEffect(
    () => () => {
      if (coverPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(coverPreviewUrl)
    },
    [coverPreviewUrl],
  )

  const coverImageSrc = coverUrl || coverPreviewUrl
  const today = new Date().toISOString().slice(0, 10)

  const availableTracks = useMemo(() => {
    return (tracks ?? []).filter(
      (track) => track.status === 'ready' && (!track.releaseId || track.releaseId === releaseId),
    )
  }, [tracks, releaseId])

  const handleCoverUpload = async (file: File) => {
    setCoverFileName(file.name)
    if (coverPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(coverPreviewUrl)
    setCoverPreviewUrl(URL.createObjectURL(file))
    setCoverUploading(true)
    try {
      const result = await uploadMediaFile(file, file.name)
      const uploadedUrl = normalizeMediaUrl(result.absoluteUrl ?? result.url)
      if (!uploadedUrl) throw new Error('Upload returned no URL')
      setCoverUrl(uploadedUrl)
    } catch {
      toast.error('Cover upload failed — try again before saving')
      setCoverUrl('')
    } finally {
      setCoverUploading(false)
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!releaseId) throw new Error('Missing release id')
      const resolvedCoverUrl = await resolveCoverUrl(coverUrl, coverPreviewUrl)
      return updateRelease(releaseId, {
        title: title.trim(),
        type,
        genre: genre.trim() || undefined,
        coverUrl: resolvedCoverUrl,
        releaseDate: new Date(`${releaseDate}T12:00:00`).toISOString(),
        trackIds: selectedTrackIds,
      })
    },
    onSuccess: () => {
      toast.success('Release updated')
      void queryClient.invalidateQueries({ queryKey: ['artist-releases'] })
      invalidateArtistSurfaceQueries(queryClient)
      navigate('/artist/releases')
    },
    onError: () => toast.error('Could not update release'),
  })

  const toggleTrack = (id: string) => {
    setSelectedTrackIds((prev) => (prev.includes(id) ? prev.filter((trackId) => trackId !== id) : [...prev, id]))
  }

  if (releasesLoading) {
    return (
      <Page>
        <Loader />
      </Page>
    )
  }

  if (!release) {
    return (
      <Page>
        <PageSection className="space-y-4">
          <p className="text-muted-foreground">Release not found.</p>
          <Button variant="outline" asChild>
            <Link to="/artist/releases">Back to releases</Link>
          </Button>
        </PageSection>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader>
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
            <Link to="/artist/releases">
              <ArrowLeft className="size-4" />
              Back to releases
            </Link>
          </Button>
          <PageTitle>Edit Release</PageTitle>
        </div>
      </PageHeader>

      <PageSection className="rbl-scene mx-0 max-w-3xl space-y-6 border-0 bg-transparent p-0">
        <div className="rbl-panel">
          <div className="rbl-panel__header">
            <h3 className="rbl-panel__title">Release details</h3>
          </div>
          <div className="rbl-panel__body space-y-5">
            <div className="rbl-field">
              <label htmlFor="edit-release-title">Release title</label>
              <Input
                id="edit-release-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rbl-field">
                <label htmlFor="edit-release-genre">Primary genre</label>
                <Input
                  id="edit-release-genre"
                  placeholder="e.g. Rock"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                />
              </div>
              <div className="rbl-field">
                <span className="rbl-field__label">Release type</span>
                <select
                  className="rbl-readout w-full capitalize"
                  value={type}
                  aria-label="Release type"
                  onChange={(e) => setType(e.target.value as 'single' | 'ep' | 'album')}
                >
                  <option value="single">Single</option>
                  <option value="ep">EP</option>
                  <option value="album">Album</option>
                </select>
              </div>
            </div>

            <div className="rbl-field">
              <span className="rbl-field__label">Cover artwork</span>
              <label
                htmlFor="edit-cover-art"
                className={`rbl-cover-drop${coverImageSrc ? ' rbl-cover-drop--filled' : ''}${coverUploading ? ' rbl-cover-drop--busy' : ''}`}
              >
                {coverImageSrc ? (
                  <img src={coverImageSrc} alt={title || 'Cover preview'} className="rbl-cover-drop__preview" />
                ) : (
                  <div className="rbl-cover-drop__empty">
                    <Disc3 className="size-8" />
                    <p className="rbl-cover-drop__title">Add cover art</p>
                    <p className="rbl-cover-drop__hint">PNG or JPG · square recommended</p>
                  </div>
                )}
                <span className="rbl-cover-drop__action">
                  {coverUploading ? 'Uploading…' : coverImageSrc ? 'Replace artwork' : 'Choose file'}
                </span>
              </label>
              <Input
                id="edit-cover-art"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleCoverUpload(file)
                  e.target.value = ''
                }}
              />
              {coverFileName ? <p className="rbl-field__hint">{coverFileName}</p> : null}
            </div>
          </div>
        </div>

        <div className="rbl-panel">
          <div className="rbl-panel__header">
            <h3 className="rbl-panel__title">Launch window</h3>
          </div>
          <div className="rbl-panel__body">
            <ReleaseDatePicker value={releaseDate} onChange={setReleaseDate} minDate={today} />
          </div>
        </div>

        <div className="rbl-panel">
          <div className="rbl-panel__header">
            <h3 className="rbl-panel__title">Tracks</h3>
            <p className="rbl-panel__meta">{selectedTrackIds.length} selected</p>
          </div>
          <div className="rbl-panel__body space-y-2">
            {availableTracks.length === 0 ? (
              <p className="rbl-text-muted text-sm">No ready tracks available.</p>
            ) : (
              availableTracks.map((track) => (
                <label key={track.id} className="rbl-track-row cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTrackIds.includes(track.id)}
                    onChange={() => toggleTrack(track.id)}
                    className="size-4 accent-[var(--primary)]"
                  />
                  <span className="font-medium">{track.title}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!title.trim() || !selectedTrackIds.length || saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/artist/releases">Cancel</Link>
          </Button>
        </div>
      </PageSection>
    </Page>
  )
}
