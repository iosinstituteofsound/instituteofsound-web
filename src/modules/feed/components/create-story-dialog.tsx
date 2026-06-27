import { ImageIcon } from 'lucide-react'
import type { FeedItemType } from '@/modules/feed/types/feed.types'
import { UserAvatar } from '@/shared/components/user'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/cn'

type StoryOptionType = Extract<FeedItemType, 'image' | 'text'>

const STORY_OPTIONS: {
  type: StoryOptionType
  label: string
  gradient: string
  icon: React.ReactNode
}[] = [
  {
    type: 'image',
    label: 'Create a photo or video story',
    gradient: 'from-blue-700 via-blue-500 to-cyan-400',
    icon: <ImageIcon className="h-6 w-6" />,
  },
  {
    type: 'text',
    label: 'Create a Text Story',
    gradient: 'from-violet-700 via-fuchsia-600 to-pink-500',
    icon: <span className="text-lg font-bold leading-none">Aa</span>,
  },
]

interface CreateStoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  avatarUrl?: string | null
  onSelect: (type: StoryOptionType) => void
}

export function CreateStoryDialog({
  open,
  onOpenChange,
  userName,
  avatarUrl,
  onSelect,
}: CreateStoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-[640px]">
        <DialogHeader className="space-y-0 border-b px-5 py-4 text-left">
          <DialogTitle className="text-xl font-bold">Your story</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 border-b px-5 py-3">
          <UserAvatar name={userName} avatarUrl={avatarUrl} className="h-10 w-10" />
          <p className="text-sm font-semibold">{userName}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          {STORY_OPTIONS.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => onSelect(option.type)}
              className={cn(
                'group relative flex aspect-[3/4] w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br p-6 text-center text-white shadow-md transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                option.gradient,
              )}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/80 text-white">
                {option.icon}
              </div>
              <p className="max-w-[180px] text-sm font-semibold leading-snug">{option.label}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
