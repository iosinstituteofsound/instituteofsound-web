import {
  Box,
  FileText,
  Globe,
  ImageIcon,
  Mic,
  MoreHorizontal,
  Music2,
  Scissors,
  Smile,
  Video,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/cn'
import { formatAttachedAudioLabel } from '@/modules/feed/lib/attached-audio-label'

export type PostAddAction =
  | 'photo-video'
  | 'audio'
  | 'model'
  | 'record-video'
  | 'record-audio'
  | 'clip'
  | 'article'
  | 'library-sound'

interface CreatePostAddBarProps {
  activeAction: PostAddAction | null
  onAction: (action: PostAddAction) => void
  onEmojiClick?: (anchor: HTMLElement) => void
  emojiActive?: boolean
  hasMedia: boolean
  canAttachSound?: boolean
  disabled?: boolean
}

export function CreatePostAddBar({
  activeAction,
  onAction,
  onEmojiClick,
  emojiActive = false,
  hasMedia,
  canAttachSound = false,
  disabled = false,
}: CreatePostAddBarProps) {
  return (
    <div className="feed-create-post__add-bar">
      <span className="feed-create-post__add-label">Add to your post</span>
      <div className="feed-create-post__add-actions">
        <button
          type="button"
          title="Photo or video"
          disabled={disabled}
          onClick={() => onAction('photo-video')}
          className={cn(
            'feed-create-post__add-btn',
            activeAction === 'photo-video' && 'is-active',
          )}
        >
          <ImageIcon className="h-6 w-6 text-emerald-500" />
        </button>

        <button
          type="button"
          title="Audio or music"
          disabled={disabled}
          onClick={() => onAction('audio')}
          className={cn('feed-create-post__add-btn', activeAction === 'audio' && 'is-active')}
        >
          <Mic className="h-6 w-6 text-red-500" />
        </button>

        <button
          type="button"
          title="3D model"
          disabled={disabled}
          onClick={() => onAction('model')}
          className={cn('feed-create-post__add-btn', activeAction === 'model' && 'is-active')}
        >
          <Box className="h-6 w-6 text-violet-500" />
        </button>

        <button
          type="button"
          data-emoji-trigger
          title="Animated emoji"
          disabled={disabled}
          onClick={(event) => onEmojiClick?.(event.currentTarget)}
          className={cn(
            'feed-create-post__add-btn hidden sm:inline-flex',
            emojiActive && 'is-active',
          )}
        >
          <Smile className="h-6 w-6 text-amber-500" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title="More options"
              disabled={disabled}
              className="feed-create-post__add-btn"
            >
              <MoreHorizontal className="h-6 w-6 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-[120] w-52">
            <DropdownMenuItem onClick={() => onAction('record-video')}>
              <Video className="mr-2 h-4 w-4 text-pink-500" />
              Record video
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('record-audio')}>
              <Mic className="mr-2 h-4 w-4 text-red-500" />
              Record audio
            </DropdownMenuItem>
            {canAttachSound ? (
              <DropdownMenuItem onClick={() => onAction('library-sound')}>
                <Music2 className="mr-2 h-4 w-4 text-amber-500" />
                Choose from library
              </DropdownMenuItem>
            ) : null}
            {hasMedia ? (
              <DropdownMenuItem onClick={() => onAction('clip')}>
                <Scissors className="mr-2 h-4 w-4" />
                Trim clip
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={() => onAction('article')}>
              <FileText className="mr-2 h-4 w-4 text-blue-500" />
              Share article link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function CreatePostPrivacyBadge() {
  return (
    <span className="feed-create-post__privacy">
      <Globe className="h-3 w-3" />
      Public
    </span>
  )
}

interface CreatePostAddAudioBadgeProps {
  artistName?: string | null
  trackTitle?: string | null
  disabled?: boolean
  onClick: () => void
}

export function CreatePostAddAudioBadge({
  artistName,
  trackTitle,
  disabled = false,
  onClick,
}: CreatePostAddAudioBadgeProps) {
  const trackLabel = formatAttachedAudioLabel(artistName, trackTitle)
  const hasSound = Boolean(trackLabel)

  return (
    <button
      type="button"
      title={hasSound ? `Change audio: ${trackLabel}` : 'Add audio from library'}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'feed-create-post__privacy feed-create-post__privacy-btn',
        hasSound && 'feed-create-post__privacy-btn--track is-active',
      )}
    >
      <Music2 className="h-3 w-3 shrink-0" />
      <span className="feed-create-post__privacy-btn-label">{trackLabel || 'Add audio'}</span>
    </button>
  )
}
