import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ArticleAudioWidget } from '@/modules/explore/components/article-audio-widget'
import {
  formatTemplateQuoteLines,
  resolveTemplateLivePreview,
} from '@/modules/editor/lib/template-live-preview'
import type { ArticleTemplateDto } from '@/modules/editor/types/article-template.types'
import '@/modules/explore/styles/explore.css'
import '@/modules/editor/styles/article-editor.css'

const PREVIEW_SCALE = 0.238

interface ArticleTemplatePreviewProps {
  template: ArticleTemplateDto
  className?: string
}

function TemplateQuotePreview({
  text,
  attribution,
}: {
  text: string
  attribution?: string
}) {
  const lines = formatTemplateQuoteLines(text)
  const displayLines = lines.length > 0 ? lines : ['']

  return (
    <figure className="explore-article-quote">
      <div className="explore-article-quote__texture" aria-hidden />
      <div className="explore-article-quote__inner">
        <div className="explore-article-quote__stage">
          <span className="explore-article-quote__mark explore-article-quote__mark--open" aria-hidden>
            &ldquo;
          </span>
          <div className="explore-article-quote__copy">
            <blockquote className="explore-article-quote__text">
              {displayLines.map((line, index) => (
                <span key={`${index}-${line}`} className="explore-article-quote__line">
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
    </figure>
  )
}

function TemplateSoundDnaPanel({
  rows,
}: {
  rows: Array<{ label: string; value: string }>
}) {
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

export function ArticleTemplatePreview({ template, className }: ArticleTemplatePreviewProps) {
  const preview = useMemo(() => resolveTemplateLivePreview(template), [template])
  const contentRef = useRef<HTMLElement>(null)
  const [scaledHeight, setScaledHeight] = useState(0)

  useLayoutEffect(() => {
    const node = contentRef.current
    if (!node) return

    const measure = () => {
      setScaledHeight(node.offsetHeight * PREVIEW_SCALE)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [preview])

  return (
    <div className={className ?? 'article-template-live-preview'} aria-hidden>
      <span className="article-template-live-preview__hint">Scroll to preview</span>
      <div
        className="article-template-live-preview__viewport"
        onWheel={(event) => event.stopPropagation()}
      >
        <div className="article-template-live-preview__scaler" style={{ height: scaledHeight || undefined }}>
          <article
            ref={contentRef}
            className="explore-article explore-article--template-preview article-template-live-preview__frame"
            style={{
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: 'top left',
              width: `${100 / PREVIEW_SCALE}%`,
            }}
          >
            <header className="explore-article-hero">
              <img src={preview.coverUrl} alt="" className="explore-article-hero__img" />
              <div className="explore-article-hero__scrim" aria-hidden />
              <div className="explore-article-hero__glow" aria-hidden />
              <div className="explore-article-hero__grain" aria-hidden />

              <div className="explore-article-hero__stage">
                <div className="explore-article-hero__content">
                  <span className="explore-article-hero__tag">{preview.category}</span>
                  <h1 className="explore-article-hero__title">{preview.title}</h1>
                  <p className="explore-article-hero__deck">{preview.deck}</p>
                </div>

                <ArticleAudioWidget
                  title={preview.title}
                  streamUrl={preview.sessionAudio}
                  tracks={preview.sessionTracks}
                  sessionLabel={preview.sessionLabel}
                  variant="hero"
                  className="explore-article-hero__audio article-template-live-preview__interactive"
                />
              </div>
            </header>

            <div className="explore-article-main explore-article-main--intro">
              <section className="explore-article-intro">
                <div
                  className="explore-article-intro__text"
                  dangerouslySetInnerHTML={{ __html: preview.introHtml }}
                />
                {preview.introImage ? (
                  <figure className="explore-article-intro__figure">
                    <img src={preview.introImage} alt="" loading="lazy" />
                    <span className="explore-article-intro__figure-grain" aria-hidden />
                  </figure>
                ) : null}
              </section>
            </div>

            {preview.quote ? (
              <TemplateQuotePreview text={preview.quote.text} attribution={preview.quote.attribution} />
            ) : null}

            <div className="explore-article-main">
              {preview.sections[0] ? (
                <section className="explore-article-block">
                  <div className="explore-article-block__copy">
                    <span className="explore-article-block__num">{preview.sections[0].num}</span>
                    <h2 className="explore-article-block__title">{preview.sections[0].heading}</h2>
                    <div
                      className="explore-article-body explore-article-block__body"
                      dangerouslySetInnerHTML={{ __html: preview.sections[0].html }}
                    />
                    <ArticleAudioWidget
                      title={preview.title}
                      streamUrl={preview.sessionAudio}
                      tracks={preview.sessionTracks}
                      sessionLabel={preview.sessionLabel}
                      variant="compact"
                      className="explore-article-block__audio article-template-live-preview__interactive"
                    />
                  </div>
                  {preview.showSoundDna ? <TemplateSoundDnaPanel rows={preview.soundDna} /> : null}
                </section>
              ) : null}

              {preview.breakImage ? (
                <figure className="explore-article-break">
                  <img src={preview.breakImage} alt="" loading="lazy" />
                  <span className="explore-article-break__grain" aria-hidden />
                </figure>
              ) : null}

              {preview.sections[1] ? (
                <section className="explore-article-block explore-article-block--reverse">
                  {preview.sectionImage ? (
                    <figure className="explore-article-block__figure">
                      <img src={preview.sectionImage} alt="" loading="lazy" />
                    </figure>
                  ) : null}
                  <div className="explore-article-block__copy">
                    <span className="explore-article-block__num">{preview.sections[1].num}</span>
                    <h2 className="explore-article-block__title">{preview.sections[1].heading}</h2>
                    <div
                      className="explore-article-body explore-article-block__body"
                      dangerouslySetInnerHTML={{ __html: preview.sections[1].html }}
                    />
                    <ArticleAudioWidget
                      title={`${preview.title} · Session`}
                      streamUrl={preview.sessionAudio}
                      tracks={preview.sessionTracks}
                      sessionLabel={preview.sessionLabel}
                      variant="compact"
                      className="explore-article-block__audio article-template-live-preview__interactive"
                    />
                  </div>
                </section>
              ) : null}
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
