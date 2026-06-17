import { Link2 } from 'lucide-react'
import { useState } from 'react'
import {
  isAcceptableVideoLink,
  parseExternalVideoLink,
  videoDraftFromExternal,
  type VideoBlockDraft,
} from '@/modules/editor/lib/external-video-link'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

interface ArticleExternalVideoLinkPickerProps {
  onSelect: (draft: VideoBlockDraft) => void
  className?: string
}

export function ArticleExternalVideoLinkPicker({
  onSelect,
  className,
}: ArticleExternalVideoLinkPickerProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const applyLink = () => {
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Paste a video link first.')
      return
    }
    if (!isAcceptableVideoLink(trimmed)) {
      setError('Enter a valid http or https link.')
      return
    }
    const parsed = parseExternalVideoLink(trimmed)
    if (!parsed.valid) {
      setError('Could not read that link.')
      return
    }
    setError(null)
    onSelect(videoDraftFromExternal(parsed))
  }

  return (
    <div className={cn('article-video-external', className)}>
      <div className="article-video-external__label">
        <Link2 className="h-3.5 w-3.5" />
        <span>Paste external video link</span>
      </div>
      <div className="article-video-external__row">
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
          placeholder="YouTube, Vimeo, TikTok…"
          className="article-video-external__input"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="article-media-external__use-btn"
          onClick={applyLink}
        >
          Use
        </Button>
      </div>
      {error ? <p className="article-video-external__error">{error}</p> : null}
      <p className="article-video-external__hint">
        YouTube, Vimeo, Dailymotion, Twitch, TikTok, Facebook, or direct .mp4 links.
      </p>
    </div>
  )
}
