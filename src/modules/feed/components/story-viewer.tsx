import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import {
  findStoryLocation,
  groupStoriesByAuthor,
  storyBackground,
  storyPreviewText,
  storyTextStyle,
  storyVideoUrl,
} from '@/modules/feed/lib/story-content'
import { FEED_REACTION_OPTIONS } from '@/modules/feed/lib/feed-reactions'
import { formatFeedTimestamp } from '@/modules/feed/lib/feed-time'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

const STORY_DURATION_MS = 5000

interface StoryViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stories: FeedItemDto[]
  initialStoryId: string | null
  userName: string
  avatarUrl?: string | null
  onCreateStory: () => void
}

export function StoryViewer({
  open,
  onOpenChange,
  stories,
  initialStoryId,
  userName,
  avatarUrl,
  onCreateStory,
}: StoryViewerProps) {
  const [{ groupIndex, storyIndex }, setPosition] = useState(() => {
    const location = findStoryLocation(stories, initialStoryId)
    return { groupIndex: location.groupIndex, storyIndex: location.storyIndex }
  })
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true)

  const groups = useMemo(() => groupStoriesByAuthor(stories), [stories])
  const activeGroup = groups[groupIndex]
  const activeStory = activeGroup?.stories[storyIndex]

  useEffect(() => {
    if (!open) return
    const location = findStoryLocation(stories, initialStoryId)
    setPosition({ groupIndex: location.groupIndex, storyIndex: location.storyIndex })
    setProgress(0)
    setPaused(false)
  }, [open, initialStoryId, stories])

  const goNext = useCallback(() => {
    if (!groups.length) return

    const currentGroup = groups[groupIndex]
    if (!currentGroup) return

    if (storyIndex < currentGroup.stories.length - 1) {
      setPosition({ groupIndex, storyIndex: storyIndex + 1 })
      setProgress(0)
      return
    }

    if (groupIndex < groups.length - 1) {
      setPosition({ groupIndex: groupIndex + 1, storyIndex: 0 })
      setProgress(0)
      return
    }

    onOpenChange(false)
  }, [groupIndex, groups, onOpenChange, storyIndex])

  const goPrev = useCallback(() => {
    if (!groups.length) return

    if (storyIndex > 0) {
      setPosition({ groupIndex, storyIndex: storyIndex - 1 })
      setProgress(0)
      return
    }

    if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1]!
      setPosition({ groupIndex: groupIndex - 1, storyIndex: prevGroup.stories.length - 1 })
      setProgress(0)
    }
  }, [groupIndex, groups, storyIndex])

  useEffect(() => {
    if (!open || !activeStory || paused) return

    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const next = Math.min(1, elapsed / STORY_DURATION_MS)
      setProgress(next)
      if (next >= 1) goNext()
    }, 50)

    return () => window.clearInterval(timer)
  }, [activeStory, goNext, open, paused, groupIndex, storyIndex])

  const jumpToStory = (nextGroupIndex: number, nextStoryIndex = 0) => {
    setPosition({ groupIndex: nextGroupIndex, storyIndex: nextStoryIndex })
    setProgress(0)
  }

  if (!groups.length || !activeStory || !activeGroup) return null

  const background = storyBackground(activeStory, storyIndex)
  const previewText = storyPreviewText(activeStory)
  const videoUrl = storyVideoUrl(activeStory)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 z-50 flex h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black p-0 text-white [&>button]:hidden">
        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-[360px] shrink-0 flex-col border-r border-white/10 bg-[#18191a] md:flex">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white hover:bg-white/10"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold">Stories</h2>
                <p className="text-xs text-white/60">
                  <button type="button" className="hover:underline">
                    Archive
                  </button>
                  <span className="mx-1">·</span>
                  <button type="button" className="hover:underline">
                    Settings
                  </button>
                </p>
              </div>
            </div>

            <div className="border-b border-white/10 px-4 py-4">
              <p className="mb-3 text-sm font-semibold">Your story</p>
              <button
                type="button"
                onClick={onCreateStory}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/10"
              >
                <div className="relative">
                  <FeedUserAvatar name={userName} avatarUrl={avatarUrl} className="h-12 w-12" />
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold">Create a story</p>
                  <p className="text-xs text-white/60">Share a photo or write something.</p>
                </div>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
              <p className="px-2 pb-2 text-sm font-semibold">All stories</p>
              {groups.map((group, index) => {
                const isActive = index === groupIndex
                const latestStory = group.stories[0]

                return (
                  <button
                    key={group.author.id}
                    type="button"
                    onClick={() => jumpToStory(index, 0)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                      isActive ? 'bg-white/10' : 'hover:bg-white/5',
                    )}
                  >
                    <FeedUserAvatar
                      name={group.author.name}
                      avatarUrl={group.author.avatarUrl}
                      className={cn('h-12 w-12', isActive ? 'ring-2 ring-primary' : 'ring-2 ring-primary/80')}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{group.author.name}</p>
                      <p className="text-xs text-white/60">
                        {group.stories.length} new · {formatFeedTimestamp(latestStory?.createdAt ?? new Date().toISOString())}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-6">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 z-20 h-10 w-10 text-white hover:bg-white/10 md:hidden"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {groupIndex > 0 || storyIndex > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 sm:inline-flex"
                onClick={goPrev}
                aria-label="Previous story"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            ) : null}

            <div className="relative h-[min(88vh,760px)] w-full max-w-[420px] overflow-hidden rounded-2xl bg-black shadow-2xl">
              <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-3 pt-3">
                {activeGroup.stories.map((story, index) => (
                  <div key={story.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
                    <div
                      className="h-full rounded-full bg-white transition-[width] duration-100 ease-linear"
                      style={{
                        width:
                          index < storyIndex
                            ? '100%'
                            : index === storyIndex
                              ? `${progress * 100}%`
                              : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pb-3 pt-8">
                <div className="flex min-w-0 items-center gap-2">
                  <FeedUserAvatar
                    name={activeGroup.author.name}
                    avatarUrl={activeGroup.author.avatarUrl}
                    className="h-9 w-9 ring-2 ring-primary"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{activeGroup.author.name}</p>
                    <div className="flex items-center gap-1 text-xs text-white/80">
                      <span>{formatFeedTimestamp(activeStory.createdAt)}</span>
                      <Globe className="h-3 w-3" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/10"
                    onClick={() => setMuted((value) => !value)}
                    aria-label={muted ? 'Unmute' : 'Mute'}
                  >
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/10"
                    onClick={() => setPaused((value) => !value)}
                    aria-label={paused ? 'Play' : 'Pause'}
                  >
                    {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/10"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <StorySlide
                story={activeStory}
                background={background}
                previewText={previewText}
                textStyle={storyTextStyle(activeStory)}
                videoUrl={videoUrl}
                muted={muted}
                paused={paused}
              />

              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-4 pb-4 pt-10">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Send message..."
                    className="h-11 flex-1 rounded-full border-white/15 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white/30"
                  />
                  <div className="hidden items-center gap-1 sm:flex">
                    {FEED_REACTION_OPTIONS.map((reaction) => (
                      <button
                        key={reaction.kind}
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg transition-transform hover:scale-110"
                        aria-label={reaction.label}
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {groupIndex < groups.length - 1 || storyIndex < activeGroup.stories.length - 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 sm:inline-flex"
                onClick={goNext}
                aria-label="Next story"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StorySlide({
  story,
  background,
  previewText,
  textStyle,
  videoUrl,
  muted,
  paused,
}: {
  story: FeedItemDto
  background: ReturnType<typeof storyBackground>
  previewText?: string
  textStyle: string
  videoUrl?: string
  muted: boolean
  paused: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (paused) {
      video.pause()
      return
    }
    void video.play().catch(() => undefined)
  }, [paused, videoUrl])

  return (
    <div className="absolute inset-0">
      {!videoUrl && background.kind === 'image' ? (
        <img src={background.value} alt="" className="h-full w-full object-cover" />
      ) : !videoUrl ? (
        <div className={cn('h-full w-full bg-gradient-to-br', background.value)} />
      ) : null}

      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={payloadString(story.payload, 'posterUrl')}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          playsInline
          loop
          muted={muted}
        />
      ) : null}

      {previewText ? (
        <div className="absolute inset-0 flex items-center justify-center p-8 pt-20 pb-24">
          <p className={cn('text-center text-3xl leading-snug text-white drop-shadow-lg', textStyle)}>
            {previewText}
          </p>
        </div>
      ) : null}
    </div>
  )
}
