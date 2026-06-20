import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Disc3, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { getArtistProfile } from '@/modules/music/api/music.api'
import { ReleaseTrackManifestList } from '@/modules/music/components/release-track-manifest-list'
import { normalizeMediaUrl } from '@/modules/editor/lib/normalize-media-url'
import type { QueuedUpload } from '@/modules/music/types/release-builder.types'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

interface ReleaseDetailsStepProps {
  queue: QueuedUpload[]
  releaseTitle: string
  onReleaseTitleChange: (value: string) => void
  genre: string
  onGenreChange: (value: string) => void
  secondaryGenre: string
  onSecondaryGenreChange: (value: string) => void
  language: string
  onLanguageChange: (value: string) => void
  coverImageSrc: string
  onCoverUrlChange: (value: string) => void
  onCoverPreviewChange: (value: string) => void
  releaseType: 'single' | 'ep' | 'album'
  onReleaseTypeChange: (value: 'single' | 'ep' | 'album') => void
  onTrackTitleChange: (id: string, title: string) => void
  onTrackReorder: (activeId: string, overId: string) => void
}

export function ReleaseDetailsStep({
  queue,
  releaseTitle,
  onReleaseTitleChange,
  genre,
  onGenreChange,
  secondaryGenre,
  onSecondaryGenreChange,
  language,
  onLanguageChange,
  coverImageSrc,
  onCoverUrlChange,
  onCoverPreviewChange,
  releaseType,
  onReleaseTypeChange,
  onTrackTitleChange,
  onTrackReorder,
}: ReleaseDetailsStepProps) {
  const [coverFileName, setCoverFileName] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['artist-profile'],
    queryFn: getArtistProfile,
  })

  const readyTracks = queue.filter((item) => item.status === 'ready')
  const isMultiTrack = readyTracks.length > 1

  const handleCoverUpload = async (file: File) => {
    setCoverFileName(file.name)
    onCoverPreviewChange(URL.createObjectURL(file))
    setCoverUploading(true)
    try {
      const result = await uploadMediaFile(file, file.name)
      const uploadedUrl = normalizeMediaUrl(result.absoluteUrl ?? result.url)
      if (!uploadedUrl) throw new Error('Upload returned no URL')
      onCoverUrlChange(uploadedUrl)
    } catch {
      toast.error('Cover upload failed — try again before publishing')
      onCoverUrlChange('')
    } finally {
      setCoverUploading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-8">
        <header className="rbl-section-head">
          <p className="rbl-section-head__kicker">Phase 02 · Metadata matrix</p>
          <h2 className="rbl-section-head__title">Release Details</h2>
          <p className="rbl-section-head__desc">
            Encode your release identity. Single transmissions auto-classify as Singles; multi-track payloads unlock EP
            or Album designation.
          </p>
        </header>

        <section className="rbl-panel">
          <div className="rbl-panel__header">
            <h3 className="rbl-panel__title">Core identifiers</h3>
          </div>
          <div className="rbl-panel__body space-y-5">
            <div className="rbl-field">
              <label htmlFor="release-title">Release title</label>
              <Input
                id="release-title"
                placeholder="Enter release designation"
                value={releaseTitle}
                onChange={(e) => onReleaseTitleChange(e.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rbl-field">
                <label htmlFor="primary-genre">Primary genre</label>
                <Input
                  id="primary-genre"
                  placeholder="e.g. Electronic"
                  value={genre}
                  onChange={(e) => onGenreChange(e.target.value)}
                />
              </div>
              <div className="rbl-field">
                <label htmlFor="secondary-genre">Secondary genre</label>
                <Input
                  id="secondary-genre"
                  placeholder="Optional"
                  value={secondaryGenre}
                  onChange={(e) => onSecondaryGenreChange(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rbl-field">
                <span className="rbl-field__label">Language</span>
                <Select value={language} onValueChange={onLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Instrumental">Instrumental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rbl-field">
                <span className="rbl-field__label">Release type</span>
                {isMultiTrack ? (
                  <Select value={releaseType} onValueChange={(v) => onReleaseTypeChange(v as 'ep' | 'album')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ep">EP</SelectItem>
                      <SelectItem value="album">Album</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="rbl-readout">Single</div>
                )}
              </div>
            </div>

            <div className="rbl-field">
              <span className="rbl-field__label">Cover artwork</span>
              <label
                htmlFor="cover-art"
                className={`rbl-cover-drop${coverImageSrc ? ' rbl-cover-drop--filled' : ''}${coverUploading ? ' rbl-cover-drop--busy' : ''}`}
              >
                {coverImageSrc ? (
                  <img src={coverImageSrc} alt={releaseTitle || 'Cover preview'} className="rbl-cover-drop__preview" />
                ) : (
                  <div className="rbl-cover-drop__empty">
                    <Disc3 className="size-8" />
                    <p className="rbl-cover-drop__title">Drop cover art here</p>
                    <p className="rbl-cover-drop__hint">PNG or JPG · square recommended</p>
                  </div>
                )}
                <span className="rbl-cover-drop__action">
                  {coverUploading ? 'Uploading…' : coverImageSrc ? 'Replace artwork' : 'Choose file'}
                </span>
              </label>
              <Input
                id="cover-art"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleCoverUpload(file)
                  e.target.value = ''
                }}
              />
              {coverFileName ? (
                <p className="rbl-field__hint">
                  {coverUploading ? `Uploading ${coverFileName}…` : `${coverFileName} synced`}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rbl-panel">
          <div className="rbl-panel__header">
            <h3 className="rbl-panel__title">Track manifest</h3>
            <p className="rbl-panel__meta">
              {readyTracks.length} signal{readyTracks.length === 1 ? '' : 's'}
              {readyTracks.length > 1 ? ' · drag to reorder' : ''}
            </p>
          </div>
          <div className="rbl-panel__body">
            <ReleaseTrackManifestList
              tracks={readyTracks}
              onTrackTitleChange={onTrackTitleChange}
              onReorder={onTrackReorder}
            />
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rbl-holo">
          <p className="rbl-holo__kicker">
            <Sparkles className="mr-1 inline size-3" />
            Holographic preview
          </p>
          <div className="rbl-holo__frame">
            {coverImageSrc ? (
              <img src={coverImageSrc} alt={releaseTitle || 'Release cover preview'} />
            ) : (
              <div className="rbl-holo__placeholder">
                <Disc3 className="size-14" />
              </div>
            )}
          </div>
          <p className="rbl-holo__title">{releaseTitle || 'Untitled Transmission'}</p>
          <p className="rbl-holo__artist">{profile?.displayName ?? 'Unknown artist'}</p>
          <span className="rbl-holo__type">{releaseType}</span>
        </div>
      </aside>
    </div>
  )
}
