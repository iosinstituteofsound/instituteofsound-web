import { useMemo, type ReactNode } from 'react'
import type { Data } from '@measured/puck'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { ArticleAudioWidget } from '@/modules/explore/components/article-audio-widget'
import type { SoundDnaRow } from '@/modules/explore/lib/article-content'
import {
  formatLiveQuoteLines,
  parseSessionTracks,
  type PuckLivePreviewModel,
} from '@/modules/editor/lib/puck-live-preview'
import { getLiveBodyBlocks, parseQuoteFromBodyHtml } from '@/modules/editor/lib/live-article-body'
import { isQuoteBodyHtml } from '@/modules/editor/lib/quote-body-utils'
import { reorderPuckContent } from '@/modules/editor/lib/reorder-puck-content'
import { isCanvasBlockHidden, getBlockBodyQuote } from '@/modules/editor/lib/canvas-block-utils'
import type { CanvasBlockType } from '@/modules/editor/types/article-canvas.types'
import { cn } from '@/shared/lib/cn'

function readBlockId(block: Data['content'][number]): string {
  return String((block.props as Record<string, unknown>).blockId)
}

function asHtml(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function SortableRow({
  blockId,
  selected,
  label,
  onActivate,
  children,
}: {
  blockId: string
  selected: boolean
  label: string
  onActivate: () => void
  children: ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: blockId,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('article-live-sortable-row', isDragging && 'article-live-sortable-row--dragging')}
    >
      <button
        type="button"
        className="article-live-sortable-row__handle"
        aria-label={`Drag ${label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div
        className={cn(
          'article-live-editable',
          selected && 'article-live-editable--selected',
          'article-live-sortable-row__content',
        )}
        role="button"
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation()
          onActivate()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onActivate()
          }
        }}
      >
        {children}
        <span className="article-live-editable__hint">{label}</span>
      </div>
    </div>
  )
}

function LiveQuoteBlock({
  text,
  attribution,
}: {
  text: string
  attribution?: string
}) {
  const lines = formatLiveQuoteLines(text)
  const displayLines = lines.length > 0 ? lines : ['']

  return (
    <div className="explore-article-quote">
      <div className="explore-article-quote__texture" aria-hidden />
      <div className="explore-article-quote__inner">
        <div className="explore-article-quote__stage">
          <span className="explore-article-quote__mark explore-article-quote__mark--open" aria-hidden>
            &ldquo;
          </span>
          <div className="explore-article-quote__copy">
            <blockquote className="explore-article-quote__text">
              {displayLines.map((line, index) => (
                <span
                  key={`${index}-${line}`}
                  className={cn('explore-article-quote__line', !line && 'explore-article-quote__line--empty')}
                >
                  {line || '\u00a0'}
                </span>
              ))}
            </blockquote>
            {attribution ? (
              <figcaption className="explore-article-quote__cite">{attribution}</figcaption>
            ) : null}
          </div>
          <span className="explore-article-quote__mark explore-article-quote__mark--close" aria-hidden>
            &rdquo;
          </span>
        </div>
      </div>
    </div>
  )
}

function LiveSoundDnaEditWrap({
  selected,
  onSelect,
  readOnly,
  children,
}: {
  selected: boolean
  onSelect: () => void
  readOnly?: boolean
  children: ReactNode
}) {
  if (readOnly) return <>{children}</>

  return (
    <div className={cn('article-live-sound-dna-wrap', selected && 'article-live-sound-dna-wrap--selected')}>
      {children}
      <button
        type="button"
        className="article-live-sound-dna-wrap__edit"
        onClick={(event) => {
          event.stopPropagation()
          onSelect()
        }}
      >
        Edit Sound DNA
      </button>
    </div>
  )
}

function LiveSoundDnaPanel({ rows }: { rows: SoundDnaRow[] }) {
  return (
    <aside className="explore-article-dna explore-ed-glass">
      <p className="explore-article-dna__kicker">Sound DNA</p>
      <dl className="explore-article-dna__list">
        {rows.map((row) => (
          <div key={row.label} className="explore-article-dna__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <span className="explore-article-dna__cta">View session gear &amp; notes →</span>
    </aside>
  )
}

function LiveAudioBlock({
  block,
  preview,
  selected,
  onSelect,
  readOnly,
  variant = 'compact',
}: {
  block: Data['content'][number]
  preview: PuckLivePreviewModel
  selected: boolean
  onSelect: () => void
  readOnly?: boolean
  variant?: 'compact' | 'hero'
}) {
  const props = block.props as Record<string, unknown>
  const audioUrl = asHtml(props.audioUrl) || preview.sessionAudio
  const label = asHtml(props.sessionLabel) || preview.sessionLabel
  const tracks = parseSessionTracks(props.sessionTracks, asHtml(props.trackTitle) || preview.title)

  return (
    <div className={cn('article-live-audio-wrap', !readOnly && selected && 'article-live-audio-wrap--selected')}>
      <ArticleAudioWidget
        title={preview.title}
        streamUrl={audioUrl}
        tracks={tracks}
        sessionLabel={label}
        variant={variant}
        className={variant === 'compact' ? 'explore-article-block__audio' : 'explore-article-hero__audio'}
      />
      {!readOnly ? (
        <button
          type="button"
          className="article-live-audio-wrap__edit"
          onClick={(event) => {
            event.stopPropagation()
            onSelect()
          }}
        >
          Edit audio
        </button>
      ) : null}
    </div>
  )
}

function LiveBlockContent({
  block,
  preview,
  sectionIndex,
  selected,
  onSelect,
  showSoundDna,
  soundDna,
  soundDnaEditActive,
  onSelectSoundDna,
  isFirstSection,
  readOnly = false,
}: {
  block: Data['content'][number]
  preview: PuckLivePreviewModel
  sectionIndex: number
  selected: boolean
  onSelect: () => void
  showSoundDna: boolean
  soundDna: SoundDnaRow[]
  soundDnaEditActive: boolean
  onSelectSoundDna: () => void
  isFirstSection: boolean
  readOnly?: boolean
}) {
  const type = block.type as CanvasBlockType
  const props = block.props as Record<string, unknown>

  if (type === 'ArticleImage' || type === 'ArticleHero') {
    const imageUrl = asHtml(props.imageUrl)
    return (
      <div className={cn('explore-article-break article-live-body-image', !readOnly && selected && 'article-live-body-image--selected')}>
        {imageUrl ? (
          <img key={imageUrl} src={imageUrl} alt={asHtml(props.alt)} loading="lazy" />
        ) : (
          <span className="explore-article-hero__img explore-article-hero__img--empty" aria-hidden />
        )}
        <span className="explore-article-break__grain" aria-hidden />
        {!readOnly ? (
          <button
            type="button"
            className="article-live-body-image__replace"
            onClick={(event) => {
              event.stopPropagation()
              onSelect()
            }}
          >
            Replace image
          </button>
        ) : null}
      </div>
    )
  }

  if (type === 'ArticleLead') {
    const html = asHtml(props.body) || preview.introHtml
    return (
      <div className="article-live-flow-intro">
        <section className="explore-article-intro">
          <div className="explore-article-intro__text" dangerouslySetInnerHTML={{ __html: html }} />
        </section>
      </div>
    )
  }

  if (type === 'ArticleBody') {
    const html = asHtml(props.body)
    if (isQuoteBodyHtml(html)) {
      const parsed = parseQuoteFromBodyHtml(html)
      const quote = parsed.quote ?? { text: '', attribution: undefined }
      return <LiveQuoteBlock text={quote.text} attribution={quote.attribution} />
    }
    const parsed = parseQuoteFromBodyHtml(html)
    return (
      <div
        className="explore-article-body explore-article-block__body"
        dangerouslySetInnerHTML={{ __html: parsed.rest || '<p>Body copy.</p>' }}
      />
    )
  }

  if (type === 'ArticleSection') {
    const num = String(sectionIndex + 1).padStart(2, '0')
    const reverse = sectionIndex % 2 === 1

    return (
      <section className={cn('explore-article-block', reverse && 'explore-article-block--reverse')}>
        <div className="explore-article-block__copy">
          <span className="explore-article-block__num">{num}</span>
          <h2 className="explore-article-block__title">
            {asHtml(props.heading) || `Section ${sectionIndex + 1}`}
          </h2>
          <div
            className="explore-article-body explore-article-block__body"
            dangerouslySetInnerHTML={{ __html: asHtml(props.body) || '<p>Section body copy.</p>' }}
          />
        </div>
        {showSoundDna && isFirstSection && (soundDna.length > 0 || (!readOnly && soundDnaEditActive)) ? (
          <LiveSoundDnaEditWrap
            selected={soundDnaEditActive}
            onSelect={onSelectSoundDna}
            readOnly={readOnly}
          >
            <LiveSoundDnaPanel rows={soundDna} />
          </LiveSoundDnaEditWrap>
        ) : null}
      </section>
    )
  }

  if (type === 'ArticleAudio') {
    return (
      <div className="article-live-flow-copy-slot">
        <LiveAudioBlock
          block={block}
          preview={preview}
          selected={selected}
          onSelect={onSelect}
          readOnly={readOnly}
        />
      </div>
    )
  }

  if (type === 'ArticleDivider') {
    return <hr className="article-live-divider" />
  }

  if (type === 'ArticleVideo') {
    const videoUrl = asHtml(props.videoUrl)
    return videoUrl ? (
      <div className="article-live-video">
        <video src={videoUrl} controls className="article-live-video__player" />
      </div>
    ) : (
      <p className="article-live-video__empty">Add a video URL in the sidebar.</p>
    )
  }

  return null
}

function blockEditLabel(block: Data['content'][number], type: CanvasBlockType): string {
  if ((type === 'ArticleBody' || type === 'ArticleLead') && getBlockBodyQuote(block)) {
    return 'Edit quote'
  }
  switch (type) {
    case 'ArticleHero':
      return 'Edit hero image'
    case 'ArticleImage':
      return 'Edit image'
    case 'ArticleLead':
      return 'Edit intro'
    case 'ArticleBody':
      return 'Edit text'
    case 'ArticleSection':
      return 'Edit section'
    case 'ArticleAudio':
      return 'Edit audio'
    case 'ArticleVideo':
      return 'Edit video'
    default:
      return 'Edit block'
  }
}

interface ArticleLiveSortableStackProps {
  puckData: Data
  preview: PuckLivePreviewModel
  heroBlockIds: Set<string>
  selectedBlockIds: string[]
  showSoundDna: boolean
  soundDna: SoundDnaRow[]
  soundDnaEditActive?: boolean
  readOnly?: boolean
  onSelectSoundDna: () => void
  onChange: (data: Data) => void
  onSelectBlocks: (blockIds: string[]) => void
}

export function ArticleLiveSortableStack({
  puckData,
  preview,
  heroBlockIds,
  selectedBlockIds,
  showSoundDna,
  soundDna,
  soundDnaEditActive = false,
  readOnly = false,
  onSelectSoundDna,
  onChange,
  onSelectBlocks,
}: ArticleLiveSortableStackProps) {
  const bodyBlocks = useMemo(
    () => getLiveBodyBlocks(puckData, heroBlockIds),
    [heroBlockIds, puckData],
  )

  const visibleBodyBlocks = useMemo(
    () =>
      bodyBlocks.filter(({ block }, index) => {
        const contentIndex = puckData.content.indexOf(block)
        return !isCanvasBlockHidden(block, contentIndex >= 0 ? contentIndex : index)
      }),
    [bodyBlocks, puckData.content],
  )

  const blockIds = useMemo(() => visibleBodyBlocks.map((entry) => entry.blockId), [visibleBodyBlocks])

  const sectionIndexByBlockId = useMemo(() => {
    const map = new Map<string, number>()
    let sectionIndex = 0
    for (const { block } of bodyBlocks) {
      if (block.type === 'ArticleSection') {
        map.set(readBlockId(block), sectionIndex)
        sectionIndex += 1
      }
    }
    return map
  }, [bodyBlocks])

  const firstSectionBlockId = useMemo(() => {
    for (const { block, blockId } of bodyBlocks) {
      if (block.type === 'ArticleSection') return blockId
    }
    return undefined
  }, [bodyBlocks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onChange(reorderPuckContent(puckData, String(active.id), String(over.id)))
  }

  const isSelected = (blockId: string) => selectedBlockIds.includes(blockId)

  if (!visibleBodyBlocks.length) return null

  const blockNodes = visibleBodyBlocks.map(({ block, blockId }) => {
    const type = block.type as CanvasBlockType
    const selected = isSelected(blockId)
    const sectionIndex = sectionIndexByBlockId.get(blockId) ?? 0

    const content = (
      <LiveBlockContent
        block={block}
        preview={preview}
        sectionIndex={sectionIndex}
        selected={selected}
        onSelect={() => onSelectBlocks([blockId])}
        showSoundDna={showSoundDna}
        soundDna={soundDna}
        soundDnaEditActive={soundDnaEditActive}
        onSelectSoundDna={onSelectSoundDna}
        isFirstSection={blockId === firstSectionBlockId}
        readOnly={readOnly}
      />
    )

    if (readOnly) {
      return (
        <div key={blockId} className="article-live-preview-block">
          {content}
        </div>
      )
    }

    return (
      <SortableRow
        key={blockId}
        blockId={blockId}
        selected={selected}
        label={blockEditLabel(block, type)}
        onActivate={() => onSelectBlocks([blockId])}
      >
        {content}
      </SortableRow>
    )
  })

  if (readOnly) {
    return <div className="article-live-sortable-stack article-live-sortable-stack--readonly">{blockNodes}</div>
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        <div className="article-live-sortable-stack">{blockNodes}</div>
      </SortableContext>
    </DndContext>
  )
}
