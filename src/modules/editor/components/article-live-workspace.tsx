import { useMemo, type ReactNode } from 'react'
import type { Data } from '@measured/puck'
import { ArticleAudioWidget } from '@/modules/explore/components/article-audio-widget'
import { articleAuthorAvatar } from '@/modules/explore/lib/article-content'
import {
  formatLiveQuoteLines,
  resolvePuckLivePreview,
} from '@/modules/editor/lib/puck-live-preview'
import {
  addCanvasBlockWithId,
  ensureCanvasLayouts,
  IOS_BLOCK_PAYLOAD_MIME,
  IOS_BLOCK_TYPE_MIME,
  updateCanvasBlock,
  type AudioBlockDragPayload,
} from '@/modules/editor/lib/canvas-block-utils'
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
  onChange: (data: Data) => void
  onSelectBlocks: (blockIds: string[]) => void
  onSelectDeck: () => void
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

function LiveQuote({
  text,
  attribution,
  selected,
  onActivate,
}: {
  text: string
  attribution?: string
  selected: boolean
  onActivate: () => void
}) {
  const lines = formatLiveQuoteLines(text)

  return (
    <LiveEditable selected={selected} label="Edit quote" onActivate={onActivate} className="explore-article-quote">
      <div className="explore-article-quote__texture" aria-hidden />
      <div className="explore-article-quote__inner">
        <div className="explore-article-quote__stage">
          <span className="explore-article-quote__mark explore-article-quote__mark--open" aria-hidden>
            &ldquo;
          </span>
          <div className="explore-article-quote__copy">
            <blockquote className="explore-article-quote__text">
              {lines.map((line) => (
                <span key={line} className="explore-article-quote__line">
                  {line}
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
    </LiveEditable>
  )
}

function LiveSoundDnaPanel({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <aside className="explore-article-dna explore-ed-glass pointer-events-none" aria-hidden>
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
  onChange,
  onSelectBlocks,
  onSelectDeck,
  onDeselectBlocks,
}: ArticleLiveWorkspaceProps) {
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

  const selectBlock = (blockId?: string) => {
    if (!blockId) return
    onSelectBlocks([blockId])
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const type = event.dataTransfer.getData(IOS_BLOCK_TYPE_MIME) as CanvasBlockType
    if (!type) return

    const { data: next, blockId } = addCanvasBlockWithId(ensureCanvasLayouts(puckData), type)
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
    <div
      className="article-live-workspace"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDeselectBlocks()
      }}
    >
      <article className="explore-article explore-article--editor-workspace">
        <header className="explore-article-hero">
          <LiveEditable
            selected={isSelected(selectedBlockIds, preview.blockIds.hero)}
            label="Edit hero image"
            onActivate={() => selectBlock(preview.blockIds.hero ?? preview.blockIds.images[0])}
            className="explore-article-hero__img-wrap"
          >
            {preview.coverUrl ? (
              <img src={preview.coverUrl} alt="" className="explore-article-hero__img" />
            ) : (
              <span className="explore-article-hero__img explore-article-hero__img--empty" aria-hidden />
            )}
          </LiveEditable>
          <div className="explore-article-hero__scrim" aria-hidden />
          <div className="explore-article-hero__glow" aria-hidden />
          <div className="explore-article-hero__grain" aria-hidden />

          <div className="explore-article-hero__stage">
            <div className="explore-article-hero__content">
              <span className="explore-article-hero__tag">{preview.category}</span>

              <LiveEditable
                selected={isSelected(selectedBlockIds, preview.blockIds.title)}
                label="Edit headline"
                onActivate={() => selectBlock(preview.blockIds.title)}
              >
                <h1 className="explore-article-hero__title">{preview.title}</h1>
              </LiveEditable>

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
          </div>
        </header>

        <LiveEditable
          selected={isSelected(selectedBlockIds, preview.blockIds.lead)}
          label="Edit intro"
          onActivate={() => selectBlock(preview.blockIds.lead)}
          className="explore-article-main explore-article-main--intro"
        >
          <section className="explore-article-intro">
            <div
              className="explore-article-intro__text"
              dangerouslySetInnerHTML={{ __html: preview.introHtml }}
            />
            {preview.introImage ? (
              <LiveEditable
                selected={isSelected(selectedBlockIds, preview.blockIds.images[0])}
                label="Edit image"
                onActivate={() => selectBlock(preview.blockIds.images[0])}
                className="explore-article-intro__figure"
              >
                <img src={preview.introImage} alt="" loading="lazy" />
                <span className="explore-article-intro__figure-grain" aria-hidden />
              </LiveEditable>
            ) : null}
          </section>
        </LiveEditable>

        {preview.quote ? (
          <LiveQuote
            text={preview.quote.text}
            attribution={preview.quote.attribution}
            selected={isSelected(selectedBlockIds, preview.blockIds.quoteBody)}
            onActivate={() => selectBlock(preview.blockIds.quoteBody)}
          />
        ) : null}

        <div className="explore-article-main">
          {preview.sections[0] ? (
            <section className="explore-article-block">
              <LiveEditable
                selected={isSelected(selectedBlockIds, preview.sections[0].blockId)}
                label="Edit section"
                onActivate={() => selectBlock(preview.sections[0]?.blockId)}
                className="explore-article-block__copy"
              >
                <span className="explore-article-block__num">{preview.sections[0].num}</span>
                <h2 className="explore-article-block__title">{preview.sections[0].heading}</h2>
                <div
                  className="explore-article-body explore-article-block__body"
                  dangerouslySetInnerHTML={{ __html: preview.sections[0].html }}
                />
                <LiveAudioEditWrap
                  blockId={preview.blockIds.sectionAudios[0] ?? preview.blockIds.heroAudio}
                  selected={isSelected(
                    selectedBlockIds,
                    preview.blockIds.sectionAudios[0] ?? preview.blockIds.heroAudio,
                  )}
                  onSelect={selectBlock}
                >
                  <ArticleAudioWidget
                    title={preview.title}
                    streamUrl={preview.sessionAudio}
                    tracks={preview.sessionTracks}
                    sessionLabel={preview.sessionLabel}
                    variant="compact"
                    className="explore-article-block__audio"
                  />
                </LiveAudioEditWrap>
              </LiveEditable>
              {preview.showSoundDna ? <LiveSoundDnaPanel rows={preview.soundDna} /> : null}
            </section>
          ) : null}

          {preview.breakImage ? (
            <LiveEditable
              selected={isSelected(
                selectedBlockIds,
                preview.blockIds.images[1] ?? preview.blockIds.images[0],
              )}
              label="Edit break image"
              onActivate={() => selectBlock(preview.blockIds.images[1] ?? preview.blockIds.images[0])}
              className="explore-article-break"
            >
              <img src={preview.breakImage} alt="" loading="lazy" />
              <span className="explore-article-break__grain" aria-hidden />
            </LiveEditable>
          ) : null}

          {preview.sections[1] ? (
            <section className="explore-article-block explore-article-block--reverse">
              {preview.sectionImage ? (
                <LiveEditable
                  selected={isSelected(
                    selectedBlockIds,
                    preview.blockIds.images[2] ?? preview.blockIds.images[1],
                  )}
                  label="Edit section image"
                  onActivate={() =>
                    selectBlock(preview.blockIds.images[2] ?? preview.blockIds.images[1])
                  }
                  className="explore-article-block__figure"
                >
                  <img src={preview.sectionImage} alt="" loading="lazy" />
                </LiveEditable>
              ) : null}
              <LiveEditable
                selected={isSelected(selectedBlockIds, preview.sections[1].blockId)}
                label="Edit section"
                onActivate={() => selectBlock(preview.sections[1]?.blockId)}
                className="explore-article-block__copy"
              >
                <span className="explore-article-block__num">{preview.sections[1].num}</span>
                <h2 className="explore-article-block__title">{preview.sections[1].heading}</h2>
                <div
                  className="explore-article-body explore-article-block__body"
                  dangerouslySetInnerHTML={{ __html: preview.sections[1].html }}
                />
                <LiveAudioEditWrap
                  blockId={
                    preview.blockIds.sectionAudios[1] ??
                    preview.blockIds.sectionAudios[0] ??
                    preview.blockIds.heroAudio
                  }
                  selected={isSelected(
                    selectedBlockIds,
                    preview.blockIds.sectionAudios[1] ??
                      preview.blockIds.sectionAudios[0] ??
                      preview.blockIds.heroAudio,
                  )}
                  onSelect={selectBlock}
                >
                  <ArticleAudioWidget
                    title={`${preview.title} · Session`}
                    streamUrl={preview.sessionAudio}
                    tracks={preview.sessionTracks}
                    sessionLabel={preview.sessionLabel}
                    variant="compact"
                    className="explore-article-block__audio"
                  />
                </LiveAudioEditWrap>
              </LiveEditable>
            </section>
          ) : null}
        </div>
      </article>
    </div>
  )
}
