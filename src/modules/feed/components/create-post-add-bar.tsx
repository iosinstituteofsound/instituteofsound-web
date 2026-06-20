import {
  Box,
  FileText,
  Globe,
  ImageIcon,
  Mic,
  MoreHorizontal,
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

export type PostAddAction = 'photo-video' | 'audio' | 'model' | 'record-video' | 'record-audio' | 'clip' | 'article'

interface CreatePostAddBarProps {
  activeAction: PostAddAction | null
  onAction: (action: PostAddAction) => void
  onEmojiClick?: (anchor: HTMLElement) => void
  emojiActive?: boolean
  hasMedia: boolean
  disabled?: boolean
}

export function CreatePostAddBar({
  activeAction,
  onAction,
  onEmojiClick,
  emojiActive = false,
  hasMedia,
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
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onAction('record-video')}>
              <Video className="mr-2 h-4 w-4 text-pink-500" />
              Record video
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('record-audio')}>
              <Mic className="mr-2 h-4 w-4 text-red-500" />
              Record audio
            </DropdownMenuItem>
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
