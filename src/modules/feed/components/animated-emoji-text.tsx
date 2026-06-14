import { animatedEmojiUrl, splitTextWithEmojis } from '@/modules/feed/lib/animated-emoji'
import { cn } from '@/shared/lib/cn'

interface AnimatedEmojiProps {
  slug: string
  emoji: string
  size?: 'sm' | 'md' | 'lg'
  /** CDN asset size — use smaller values in dense grids for faster loads. */
  imageSize?: number
  className?: string
}

const SIZE_CLASS = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
} as const

export function AnimatedEmoji({
  slug,
  emoji,
  size = 'md',
  imageSize = 512,
  className,
}: AnimatedEmojiProps) {
  return (
    <img
      src={animatedEmojiUrl(slug, imageSize)}
      alt={emoji}
      title={emoji}
      loading="lazy"
      decoding="async"
      draggable={false}
      fetchPriority="low"
      className={cn('inline-block object-contain', SIZE_CLASS[size], className)}
      onError={(event) => {
        const target = event.currentTarget
        target.replaceWith(document.createTextNode(emoji))
      }}
    />
  )
}

interface AnimatedEmojiTextProps {
  text: string
  className?: string
  emojiSize?: 'sm' | 'md' | 'lg'
}

export function AnimatedEmojiText({ text, className, emojiSize = 'md' }: AnimatedEmojiTextProps) {
  const parts = splitTextWithEmojis(text)

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.type === 'emoji' ? (
          <AnimatedEmoji
            key={`${part.slug}-${index}`}
            slug={part.slug}
            emoji={part.value}
            size={emojiSize}
            className="mx-0.5 align-[-0.15em]"
          />
        ) : (
          <span key={`text-${index}`}>{part.value}</span>
        ),
      )}
    </span>
  )
}
