import { useState } from 'react'
import { ChevronDown, Music2, Settings2, Smile, X } from 'lucide-react'
import { useCreateFeedItem } from '@/modules/feed/hooks/use-feed'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import {
  STORY_BACKGROUND_OPTIONS,
  STORY_TEXT_STYLES,
  type StoryBackgroundId,
  type StoryTextStyleId,
  storyGradientClass,
  storyTextStyleClass,
} from '@/modules/feed/lib/story-theme'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'

interface CreateTextStoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  avatarUrl?: string | null
}

export function CreateTextStoryDialog({
  open,
  onOpenChange,
  userName,
  avatarUrl,
}: CreateTextStoryDialogProps) {
  const createFeed = useCreateFeedItem()
  const [text, setText] = useState('')
  const [backgroundId, setBackgroundId] = useState<StoryBackgroundId>('blue')
  const [textStyleId, setTextStyleId] = useState<StoryTextStyleId>('clean')

  const reset = () => {
    setText('')
    setBackgroundId('blue')
    setTextStyleId('clean')
  }

  const handleClose = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const canShare = text.trim().length > 0

  const handleShare = async () => {
    if (!canShare) {
      toast.error('Write something for your story')
      return
    }

    try {
      await createFeed.mutateAsync({
        type: 'text',
        body: text.trim(),
        payload: {
          text: text.trim(),
          storyGradient: backgroundId,
          storyTextStyle: textStyleId,
          isStory: true,
        },
      })
      toast.success('Story shared')
      handleClose(false)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Could not share story'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="fixed inset-0 z-50 flex h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 [&>button]:hidden">
        <div className="flex min-h-0 flex-1">
          <aside className="flex w-full max-w-[360px] shrink-0 flex-col border-r bg-card">
            <DialogHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleClose(false)}>
                  <X className="h-5 w-5" />
                </Button>
                <DialogTitle className="text-xl font-bold">Your story</DialogTitle>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" aria-label="Story settings">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DialogHeader>

            <div className="flex items-center gap-3 border-b px-4 py-3">
              <FeedUserAvatar name={userName} avatarUrl={avatarUrl} className="h-10 w-10" />
              <p className="text-sm font-semibold">{userName}</p>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
              <div className="space-y-2">
                <Select value={textStyleId} onValueChange={(value) => setTextStyleId(value as StoryTextStyleId)}>
                  <SelectTrigger className="h-11 rounded-lg bg-muted/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STORY_TEXT_STYLES.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold">Backgrounds</p>
                  <p className="text-xs text-muted-foreground">Gradient</p>
                </div>

                <div className="grid grid-cols-6 gap-2.5">
                  {STORY_BACKGROUND_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setBackgroundId(option.id)}
                      className={cn(
                        'aspect-square rounded-full bg-gradient-to-br ring-offset-background transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        option.gradient,
                        backgroundId === option.id ? 'ring-2 ring-white' : 'ring-0',
                      )}
                      aria-label={`Background ${option.id}`}
                    />
                  ))}
                </div>

                <div className="flex justify-center pt-1 text-muted-foreground">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full justify-start gap-2" disabled>
                <Music2 className="h-4 w-4" />
                Add music
              </Button>
            </div>

            <div className="flex shrink-0 items-center gap-3 border-t px-4 py-3">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => handleClose(false)}>
                Discard
              </Button>
              <Button
                type="button"
                className="flex-[1.4]"
                onClick={() => void handleShare()}
                disabled={!canShare || createFeed.isPending}
              >
                {createFeed.isPending ? 'Sharing…' : 'Share to Story'}
              </Button>
            </div>
          </aside>

          <section className="hidden min-h-0 flex-1 flex-col bg-muted/20 md:flex">
            <div className="border-b px-5 py-3">
              <p className="text-sm font-semibold text-muted-foreground">Preview</p>
            </div>

            <div className="flex flex-1 items-center justify-center p-8">
              <StoryPreviewCard
                text={text}
                backgroundId={backgroundId}
                textStyleId={textStyleId}
                onTextChange={setText}
              />
            </div>
          </section>
        </div>

        <div className="border-t bg-card p-4 md:hidden">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">Preview</p>
          <StoryPreviewCard
            text={text}
            backgroundId={backgroundId}
            textStyleId={textStyleId}
            onTextChange={setText}
            compact
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StoryPreviewCard({
  text,
  backgroundId,
  textStyleId,
  onTextChange,
  compact = false,
}: {
  text: string
  backgroundId: StoryBackgroundId
  textStyleId: StoryTextStyleId
  onTextChange: (value: string) => void
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl shadow-2xl',
        compact ? 'mx-auto aspect-[9/16] w-full max-w-[280px]' : 'aspect-[9/16] w-full max-w-[320px]',
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', storyGradientClass(backgroundId))} />

      <div className="relative flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center p-6">
          <textarea
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Start typing"
            rows={4}
            className={cn(
              'w-full resize-none border-0 bg-transparent text-center text-2xl leading-snug text-white caret-white placeholder:text-white/80 focus:outline-none',
              storyTextStyleClass(textStyleId),
            )}
          />
        </div>

        <div className="absolute bottom-4 right-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white">
            <Smile className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  )
}
