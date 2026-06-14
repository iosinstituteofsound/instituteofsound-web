import {
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

export type PostAddAction = 'photo-video' | 'audio' | 'record-video' | 'record-audio' | 'clip' | 'article'

interface CreatePostAddBarProps {
  activeAction: PostAddAction | null
  onAction: (action: PostAddAction) => void
  onEmojiClick?: (anchor: HTMLElement) => void
  emojiActive?: boolean
  hasMedia: boolean
  disabled?: boolean
}

const ICON_BUTTON =
  'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40'

export function CreatePostAddBar({
  activeAction,
  onAction,
  onEmojiClick,
  emojiActive = false,
  hasMedia,
  disabled = false,
}: CreatePostAddBarProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2">
      <span className="text-sm font-semibold text-foreground">Add to your post</span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          title="Photo or video"
          disabled={disabled}
          onClick={() => onAction('photo-video')}
          className={cn(
            ICON_BUTTON,
            activeAction === 'photo-video' && 'bg-primary/10',
          )}
        >
          <ImageIcon className="h-6 w-6 text-emerald-500" />
        </button>

        <button
          type="button"
          title="Audio or music"
          disabled={disabled}
          onClick={() => onAction('audio')}
          className={cn(ICON_BUTTON, activeAction === 'audio' && 'bg-primary/10')}
        >
          <Mic className="h-6 w-6 text-red-500" />
        </button>

        <button
          type="button"
          data-emoji-trigger
          title="Animated emoji"
          disabled={disabled}
          onClick={(event) => onEmojiClick?.(event.currentTarget)}
          className={cn(
            ICON_BUTTON,
            emojiActive && 'bg-amber-500/15',
            'hidden sm:inline-flex',
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
              className={ICON_BUTTON}
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
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
      <Globe className="h-3 w-3" />
      Public
    </span>
  )
}
