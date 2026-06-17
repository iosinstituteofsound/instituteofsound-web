import { Link2 } from 'lucide-react'
import { useState } from 'react'
import {
  audioDraftFromExternal,
  isAcceptableAudioLink,
  isCollectionLink,
  parseExternalAudioLink,
  type AudioBlockDraft,
} from '@/modules/editor/lib/external-audio-link'
import { fetchExternalAudioCollection } from '@/modules/editor/lib/resolve-audio-collection'
import { toSessionTracks } from '@/modules/editor/lib/session-audio-tracks'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

interface ArticleExternalAudioLinkPickerProps {
  onSelect: (draft: AudioBlockDraft) => void
  className?: string
}

export function ArticleExternalAudioLinkPicker({
  onSelect,
  className,
}: ArticleExternalAudioLinkPickerProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const applyLink = async () => {
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Paste an audio link first.')
      return
    }
    if (!isAcceptableAudioLink(trimmed)) {
      setError('Enter a valid http or https link.')
      return
    }
    const parsed = parseExternalAudioLink(trimmed)
    if (!parsed.valid) {
      setError('Could not read that link.')
      return
    }

    setLoading(true)
    setError(null)

    let sessionTracks = undefined
    if (isCollectionLink(parsed)) {
      const collection = await fetchExternalAudioCollection(trimmed)
      if (collection?.tracks?.length) {
        sessionTracks = toSessionTracks(collection.tracks)
      }
    }

    setLoading(false)
    onSelect(audioDraftFromExternal(parsed, sessionTracks))
  }

  return (
    <div className={cn('article-audio-external', className)}>
      <div className="article-audio-external__label">
        <Link2 className="h-3.5 w-3.5" />
        <span>Paste external audio link</span>
      </div>
      <div className="article-audio-external__row">
        <Input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              applyLink()
            }
          }}
          placeholder="Spotify, SoundCloud, YouTube, Bandcamp…"
          className="article-audio-external__input"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="article-media-external__use-btn"
          onClick={() => void applyLink()}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Use'}
        </Button>
      </div>
      {error ? <p className="article-audio-external__error">{error}</p> : null}
      <p className="article-audio-external__hint">
        Spotify, SoundCloud, YouTube, Bandcamp, Apple Music, Mixcloud, Audiomack, Deezer, Vimeo, or direct .mp3 links.
      </p>
    </div>
  )
}
