import { useMemo, useRef, useState, type ReactNode } from 'react'
import type { Data } from '@measured/puck'
import { ArticleAudioWidget } from '@/modules/explore/components/article-audio-widget'
import { articleAuthorAvatar } from '@/modules/explore/lib/article-content'
import {
  ArticleCanvasLayersPanel,
  ArticleCanvasLayersRail,
} from '@/modules/editor/components/article-canvas-layers-panel'
import { ArticleCanvasArtifactLayer } from '@/modules/editor/components/article-canvas-artifact-layer'
import { ArticleCanvasEffectsOverlay } from '@/modules/editor/components/article-canvas-effects-overlay'
import { ArticleLiveFreeBlocksLayer } from '@/modules/editor/components/article-live-free-blocks-layer'
import { ArticleLiveSortableStack } from '@/modules/editor/components/article-live-sortable-stack'
import { readCanvasArtifact } from '@/modules/editor/lib/canvas-artifact-utils'
import {
  canvasBackgroundToStyle,
  readCanvasBackground,
} from '@/modules/editor/lib/canvas-background-utils'
import {
  canvasEffectsFilterStyle,
  readCanvasEffects,
} from '@/modules/editor/lib/canvas-effects-utils'
import { getHeroBlockIdSet } from '@/modules/editor/lib/live-article-body'
import { resolvePuckLivePreview } from '@/modules/editor/lib/puck-live-preview'
import { extractHeroImageUrl } from '@/modules/editor/lib/puck-to-html'
import {
  addFreeCanvasBlockWithId,
  ensureCanvasLayouts,
  IOS_BLOCK_PAYLOAD_MIME,
  IOS_BLOCK_TYPE_MIME,
  isCanvasBlockHiddenById,
  updateCanvasBlock,
  type AudioBlockDragPayload,
} from '@/modules/editor/lib/canvas-block-utils'
import { percentFromPointer } from '@/modules/editor/lib/canvas-pointer-utils'
import type { CanvasBlockType } from '@/modules/editor/types/article-canvas.types'
import type { ArticleEditorMeta } from '@/modules/editor/types/article-editor.types'
import { cn } from '@/shared/lib/cn'

interface ArticleLiveWorkspaceProps {
  puckData: Data
  meta: ArticleEditorMeta
  excerpt: string
  slug: string
  authorName: string
  readMinutes: number
  selectedBlockIds: string[]
  deckEditActive?: boolean
  soundDnaEditActive?: boolean
  onChange: (data: Data) => void
  onSelectBlocks: (blockIds: string[]) => void
  onSelectDeck: () => void
  onSelectSoundDna: () => void
  onDeselectBlocks: () => void
}

function LiveEditable({
  selected,
  label,
  onActivate,
  className,
  children,
}: {
  selected: boolean
  label: string
  onActivate: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn('article-live-editable', selected && 'article-live-editable--selected', className)}
      data-live-block
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
  )
}

function LiveHeroImageEditWrap({
  blockId,
  selected,
  onSelect,
  children,
}: {
  blockId?: string
  selected: boolean
  onSelect: (blockId: string) => void
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'article-live-hero-image-wrap',
        selected && 'article-live-hero-image-wrap--selected',
      )}
    >
      {children}
      {blockId ? (
        <button
          type="button"
          className="article-live-hero-image-wrap__replace"
          onClick={(event) => {
            event.stopPropagation()
            onSelect(blockId)
          }}
        >
          Replace image
        </button>
      ) : null}
    </div>
  )
}

function LiveAudioEditWrap({
  blockId,
  selected,
  onSelect,
  children,
}: {
  blockId?: string
  selected: boolean
  onSelect: (blockId: string) => void
  children: ReactNode
}) {
  if (!blockId) return <>{children}</>

  return (
    <div className={cn('article-live-audio-wrap', selected && 'article-live-audio-wrap--selected')}>
      {children}
      <button
        type="button"
        className="article-live-audio-wrap__edit"
        onClick={(event) => {
          event.stopPropagation()
          onSelect(blockId)
        }}
      >
        Edit audio
      </button>
    </div>
  )
}

function isSelected(selectedBlockIds: string[], blockId?: string): boolean {
  return Boolean(blockId && selectedBlockIds.includes(blockId))
}

export function ArticleLiveWorkspace({
  puckData,
  meta,
  excerpt,
  slug,
  authorName,
  readMinutes,
  selectedBlockIds,
  deckEditActive = false,
  soundDnaEditActive = false,
  onChange,
  onSelectBlocks,
  onSelectDeck,
  onSelectSoundDna,
  onDeselectBlocks,
}: ArticleLiveWorkspaceProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [layersOpen, setLayersOpen] = useState(false)
  const canvasBackground = readCanvasBackground(puckData)
  const canvasBackgroundStyle = canvasBackground.hidden
    ? { background: 'transparent' }
    : canvasBackgroundToStyle(canvasBackground)
  const canvasArtifact = readCanvasArtifact(puckData)
  const canvasEffects = readCanvasEffects(puckData)
  const canvasEffectsFilter = canvasEffectsFilterStyle(canvasEffects)

  const preview = useMemo(
    () =>
      resolvePuckLivePreview({
        puck: puckData,
        category: meta.type,
        meta,
        excerpt,
        slug,
        seedId: slug || 'workspace',
      }),
    [excerpt, meta, puckData, slug],
  )

  const heroBlockIds = useMemo(() => getHeroBlockIdSet(preview.blockIds), [preview.blockIds])

  const heroBlockId = useMemo(() => {
    const fromPreview = preview.blockIds.hero ?? preview.blockIds.images[0]
    if (fromPreview) return fromPreview
    const fallback = puckData.content.find(
      (block) => block.type === 'ArticleHero' || block.type === 'ArticleImage',
    )
    if (!fallback) return undefined
    return String((fallback.props as Record<string, unknown>).blockId)
  }, [preview.blockIds.hero, preview.blockIds.images, puckData.content])
  const heroImageUrl = useMemo(
    () => extractHeroImageUrl(puckData, heroBlockId) ?? preview.coverUrl,
    [heroBlockId, preview.coverUrl, puckData],
  )
  const heroImageHidden = isCanvasBlockHiddenById(puckData, heroBlockId)
  const heroTitleHidden = isCanvasBlockHiddenById(puckData, preview.blockIds.title)
  const heroAudioHidden = isCanvasBlockHiddenById(puckData, preview.blockIds.heroAudio)

  const selectBlock = (blockId?: string) => {
    if (!blockId) return
    onSelectBlocks([blockId])
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const type = event.dataTransfer.getData(IOS_BLOCK_TYPE_MIME) as CanvasBlockType
    if (!type || !stageRef.current) return

    const rect = stageRef.current.getBoundingClientRect()
    const { x, y } = percentFromPointer(rect, event.clientX, event.clientY)
    const { data: next, blockId } = addFreeCanvasBlockWithId(ensureCanvasLayouts(puckData), type, {
      x,
      y,
      zIndex: puckData.content.length,
    })
    const payloadRaw = event.dataTransfer.getData(IOS_BLOCK_PAYLOAD_MIME)

    if (payloadRaw) {
      try {
        const payload = JSON.parse(payloadRaw) as AudioBlockDragPayload
        onChange(updateCanvasBlock(next, blockId, { ...payload }))
        onSelectBlocks([blockId])
        return
      } catch {
        /* fall through */
      }
    }

    onChange(next)
    onSelectBlocks([blockId])
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  return (
    <div className="article-live-workspace-shell">
      <ArticleCanvasLayersRail open={layersOpen} onToggle={() => setLayersOpen((open) => !open)} />

      <ArticleCanvasLayersPanel
        open={layersOpen}
        data={puckData}
        selectedBlockIds={selectedBlockIds}
        reorderContent
        onChange={onChange}
        onSelectBlock={(blockId) => {
          if (!blockId) {
            onDeselectBlocks()
            return
          }
          onSelectBlocks([blockId])
        }}
        onClose={() => setLayersOpen(false)}
      />

      <div
        className={cn(
          'article-live-workspace article-canvas-board relative min-h-full w-full',
          layersOpen && 'article-canvas-board--layers-open',
        )}
        style={canvasBackgroundStyle}
        onClick={(event) => {
          if (event.target === event.currentTarget) onDeselectBlocks()
        }}
      >
        <div
          ref={stageRef}
          className="article-canvas-board__stage min-h-full w-full"
          style={canvasEffectsFilter}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <ArticleCanvasArtifactLayer artifact={canvasArtifact} data={puckData} />
          <article className="explore-article explore-article--editor-workspace relative z-[1]">
          <header className="explore-article-hero">
            {!heroImageHidden ? (
            <LiveHeroImageEditWrap
              blockId={heroBlockId}
              selected={isSelected(selectedBlockIds, heroBlockId)}
              onSelect={selectBlock}
            >
              <LiveEditable
                selected={isSelected(selectedBlockIds, heroBlockId)}
                label="Replace image"
                onActivate={() => selectBlock(heroBlockId)}
                className="explore-article-hero__img-wrap"
              >
                {heroImageUrl ? (
                  <img
                    key={heroImageUrl}
                    src={heroImageUrl}
                    alt=""
                    className="explore-article-hero__img"
                  />
                ) : (
                  <span className="explore-article-hero__img explore-article-hero__img--empty" aria-hidden />
                )}
              </LiveEditable>
            </LiveHeroImageEditWrap>
            ) : null}
            <div className="explore-article-hero__scrim" aria-hidden />
            <div className="explore-article-hero__glow" aria-hidden />
            <div className="explore-article-hero__grain" aria-hidden />

            <div className="explore-article-hero__stage">
              <div className="explore-article-hero__content">
                <span className="explore-article-hero__tag">{preview.category}</span>

                {!heroTitleHidden ? (
                <LiveEditable
                  selected={isSelected(selectedBlockIds, preview.blockIds.title)}
                  label="Edit headline"
                  onActivate={() => selectBlock(preview.blockIds.title)}
                >
                  <h1 className="explore-article-hero__title">{preview.title}</h1>
                </LiveEditable>
                ) : null}

                {preview.deck ? (
                  <LiveEditable
                    selected={deckEditActive}
                    label="Edit hero deck"
                    onActivate={onSelectDeck}
                  >
                    <p className="explore-article-hero__deck">{preview.deck}</p>
                  </LiveEditable>
                ) : null}

                <div className="explore-article-hero__meta pointer-events-none">
                  <img
                    src={articleAuthorAvatar(slug || preview.title)}
                    alt=""
                    className="explore-article-hero__avatar"
                  />
                  <p className="explore-article-hero__byline">
                    <span>
                      By <strong>{authorName}</strong> (IOS)
                    </span>
                    <span className="explore-article-hero__dot" aria-hidden />
                    <span>{readMinutes} min read</span>
                  </p>
                </div>
              </div>

              {!heroAudioHidden ? (
              <LiveAudioEditWrap
                blockId={preview.blockIds.heroAudio}
                selected={isSelected(selectedBlockIds, preview.blockIds.heroAudio)}
                onSelect={selectBlock}
              >
                <ArticleAudioWidget
                  title={preview.title}
                  streamUrl={preview.sessionAudio}
                  tracks={preview.sessionTracks}
                  sessionLabel={preview.sessionLabel}
                  variant="hero"
                  className="explore-article-hero__audio"
                />
              </LiveAudioEditWrap>
              ) : null}
            </div>
          </header>

          <div className="explore-article-main article-live-flow-main">
            <ArticleLiveSortableStack
              puckData={puckData}
              preview={preview}
              heroBlockIds={heroBlockIds}
              selectedBlockIds={selectedBlockIds}
              onChange={onChange}
              onSelectBlocks={onSelectBlocks}
              showSoundDna={preview.showSoundDna}
              soundDna={preview.soundDna}
              soundDnaEditActive={soundDnaEditActive}
              onSelectSoundDna={onSelectSoundDna}
            />
          </div>
          </article>
          <ArticleLiveFreeBlocksLayer
            boardRef={stageRef}
            data={puckData}
            selectedBlockIds={selectedBlockIds}
            onChange={onChange}
            onSelectBlocks={onSelectBlocks}
          />
        </div>
        <ArticleCanvasEffectsOverlay effects={canvasEffects} />
      </div>
    </div>
  )
}
