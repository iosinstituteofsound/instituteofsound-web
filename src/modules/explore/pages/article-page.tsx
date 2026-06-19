import { Compass, Home } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ArticleAudioWidget } from '@/modules/explore/components/article-audio-widget'
import { ArticleRelatedGrid } from '@/modules/explore/components/article-related-grid'
import { useArticle, useExplore } from '@/modules/explore/hooks/use-explore'
import {
  articleAuthorAvatar,
  articleAuthorName,
  buildArticleIntroHtml,
  formatQuoteLines,
  resolveArticleSessionAudio,
  resolveArticleSessionTracks,
  articleSessionLabel,
  parseArticleContent,
} from '@/modules/explore/lib/article-content'
import {
  buildDefaultSoundDnaRows,
  readSoundDnaFromPuckMeta,
  resolveVisibleSoundDna,
} from '@/modules/editor/lib/sound-dna-utils'
import {
  articleCategory,
  articleDate,
  articleReadTime,
} from '@/modules/explore/lib/editorial-meta'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { Loader } from '@/shared/components/feedback/loader'
import { useBreadcrumbHomeHref } from '@/shared/hooks/use-breadcrumb-home'
import '@/modules/explore/styles/explore.css'

function ArticleQuote({
  text,
  attribution,
}: {
  text: string
  attribution?: string
}) {
  const lines = formatQuoteLines(text)
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

function SoundDnaPanel({ article }: { article: import('@/modules/explore/types/explore.types').ArticleDto }) {
  const fallback = buildDefaultSoundDnaRows(article)
  const rows = resolveVisibleSoundDna(
    { soundDna: readSoundDnaFromPuckMeta(article.puckData) },
    fallback,
  )

  if (!rows.length) return null

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
      <Link to="/explore" className="explore-article-dna__cta">
        View session gear &amp; notes →
      </Link>
    </aside>
  )
}

export function ArticlePage() {
  const { slug = '' } = useParams()
  const homeHref = useBreadcrumbHomeHref()
  const { data: article, isLoading, isError } = useArticle(slug)
  const { data: explore, isLoading: exploreLoading } = useExplore()

  if (isLoading) return <Loader className="min-h-screen bg-background" />
  if (isError || !article) {
    return (
      <div className="explore-page flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Article not found.</p>
        <Link to="/explore" className="explore-accent-text text-sm underline">
          Back to Explore
        </Link>
      </div>
    )
  }

  const parsed = parseArticleContent(article.bodyHtml)
  const introHtml = buildArticleIntroHtml(article, parsed.leadHtml)
  const gallery = article.galleryUrls ?? []
  const introImage = gallery[0] ?? article.coverUrl
  const breakImage = gallery[1] ?? gallery[0] ?? article.coverUrl
  const sectionImage = gallery[2] ?? gallery[1] ?? article.coverUrl
  const author = articleAuthorName(article.slug)
  const sessionAudio = resolveArticleSessionAudio(article, explore)
  const sessionTracks = resolveArticleSessionTracks(article, explore)
  const sessionLabel = articleSessionLabel(article)
  const audioLoading = exploreLoading && !sessionAudio && sessionTracks.length === 0

  const allEditorial = [
    ...(explore?.editorial.coverStory ? [explore.editorial.coverStory] : []),
    ...(explore?.editorial.sidebar ?? []),
  ]

  const sectionOne = parsed.sections[0]
  const sectionTwo = parsed.sections[1]
  const defaultQuote =
    parsed.quotes[0] ??
    (article.excerpt
      ? {
          text: 'WE ARE NOT CHASING A SCENE. WE ARE CHASING A FREQUENCY.',
          attribution: 'VOICE NOTE FROM THE VOID ECHO SESSION',
        }
      : null)

  return (
    <article className="explore-article">
      <header className="explore-article-hero">
        {article.coverUrl ? (
          <img src={article.coverUrl} alt="" className="explore-article-hero__img" />
        ) : (
          <span className="explore-article-hero__img explore-article-hero__img--empty" aria-hidden />
        )}
        <div className="explore-article-hero__scrim" aria-hidden />
        <div className="explore-article-hero__glow" aria-hidden />
        <div className="explore-article-hero__grain" aria-hidden />

        <div className="explore-article-hero__top">
          <AppBreadcrumb
            items={[
              { label: 'Home', href: homeHref, icon: Home },
              { label: 'Explore', href: '/explore', icon: Compass },
              { label: article.title },
            ]}
          />
        </div>

        <div className="explore-article-hero__stage">
          <div className="explore-article-hero__content">
            <span className="explore-article-hero__tag">{articleCategory(article)}</span>
            <h1 className="explore-article-hero__title">{article.title}</h1>
            {article.excerpt ? (
              <p className="explore-article-hero__deck">{article.excerpt}</p>
            ) : null}

            <div className="explore-article-hero__meta">
              <img
                src={articleAuthorAvatar(article.slug)}
                alt=""
                className="explore-article-hero__avatar"
              />
              <p className="explore-article-hero__byline">
                <span>
                  By <strong>{author}</strong> (IOS)
                </span>
                <span className="explore-article-hero__dot" aria-hidden />
                <span>{articleReadTime(article.slug)}</span>
                <span className="explore-article-hero__dot" aria-hidden />
                <span>{articleDate(article)}</span>
              </p>
            </div>
          </div>

          <ArticleAudioWidget
            title={article.title}
            streamUrl={sessionAudio}
            tracks={sessionTracks}
            sessionLabel={sessionLabel}
            variant="hero"
            isLoading={audioLoading}
            className="explore-article-hero__audio"
          />
        </div>

        <div className="explore-article-hero__scroll" aria-hidden>
          <span className="explore-article-hero__scroll-line" />
          <span className="explore-article-hero__scroll-label">Scroll to read</span>
        </div>
      </header>

      {(introHtml || (!introHtml && parsed.bodyHtml && parsed.sections.length === 0)) ? (
        <div className="explore-article-main explore-article-main--intro">
          <section className="explore-article-intro">
            <div
              className="explore-article-intro__text"
              dangerouslySetInnerHTML={{ __html: introHtml || parsed.bodyHtml }}
            />
            {introImage ? (
              <figure className="explore-article-intro__figure">
                <img src={introImage} alt="" loading="lazy" />
                <span className="explore-article-intro__figure-grain" aria-hidden />
              </figure>
            ) : null}
          </section>
        </div>
      ) : null}

      {defaultQuote ? (
        <ArticleQuote text={defaultQuote.text} attribution={defaultQuote.attribution} />
      ) : null}

      <div className="explore-article-main">

        <section className="explore-article-block">
          <div className="explore-article-block__copy">
            <span className="explore-article-block__num">01</span>
            <h2 className="explore-article-block__title">
              {sectionOne?.heading || 'Sound DNA'}
            </h2>
            {sectionOne ? (
              <div
                className="explore-article-body explore-article-block__body"
                dangerouslySetInnerHTML={{ __html: sectionOne.html }}
              />
            ) : parsed.bodyHtml && introHtml ? (
              <div
                className="explore-article-body explore-article-block__body"
                dangerouslySetInnerHTML={{ __html: parsed.bodyHtml }}
              />
            ) : (
              <div className="explore-article-body explore-article-block__body">
                <p>
                  The sessions run slow and heavy. BPMs sit in the low 80s while sub pressure fills
                  the gaps between notes — every pass a commitment, not a sketch.
                </p>
              </div>
            )}
            <ArticleAudioWidget
              title={article.title}
              streamUrl={sessionAudio}
              tracks={sessionTracks}
              sessionLabel={sessionLabel}
              variant="compact"
              isLoading={audioLoading}
              className="explore-article-block__audio"
            />
          </div>
          <SoundDnaPanel article={article} />
        </section>

        {breakImage ? (
          <figure className="explore-article-break">
            <img src={breakImage} alt="" loading="lazy" />
            <span className="explore-article-break__grain" aria-hidden />
          </figure>
        ) : null}

        <section className="explore-article-block explore-article-block--reverse">
          {sectionImage ? (
            <figure className="explore-article-block__figure">
              <img src={sectionImage} alt="" loading="lazy" />
            </figure>
          ) : null}
          <div className="explore-article-block__copy">
            <span className="explore-article-block__num">02</span>
            <h2 className="explore-article-block__title">
              {sectionTwo?.heading || 'Session One'}
            </h2>
            {sectionTwo ? (
              <div
                className="explore-article-body explore-article-block__body"
                dangerouslySetInnerHTML={{ __html: sectionTwo.html }}
              />
            ) : (
              <div className="explore-article-body explore-article-block__body">
                <p>
                  The room doesn&apos;t ask for permission. Cables snake across concrete, red light
                  bleeds from the rig, and every take carries the weight of a city that learned to
                  listen after midnight.
                </p>
                <p>
                  This is not documentation — it is transmission. What you hear in the mix is what
                  survived the night.
                </p>
              </div>
            )}
            <ArticleAudioWidget
              title={`${article.title} · Session`}
              streamUrl={sessionAudio}
              tracks={sessionTracks}
              sessionLabel={sessionLabel}
              variant="compact"
              isLoading={audioLoading}
              className="explore-article-block__audio"
            />
          </div>
        </section>

        {parsed.quotes.slice(1).map((quote) => (
          <ArticleQuote key={quote.text} text={quote.text} attribution={quote.attribution} />
        ))}

        {parsed.sections.slice(2).map((section, i) => (
          <section key={section.heading || i} className="explore-article-block">
            <div className="explore-article-block__copy explore-article-block__copy--full">
              <span className="explore-article-block__num">{String(i + 3).padStart(2, '0')}</span>
              {section.heading ? (
                <h2 className="explore-article-block__title">{section.heading}</h2>
              ) : null}
              <div
                className="explore-article-body explore-article-block__body"
                dangerouslySetInnerHTML={{ __html: section.html }}
              />
            </div>
          </section>
        ))}
      </div>

      <ArticleRelatedGrid articles={allEditorial} currentSlug={article.slug} />

      <footer className="explore-article-foot">
        <div className="explore-article-foot__brand">
          <span className="explore-article-foot__mark">IOS</span>
          <span className="explore-article-foot__name">Institute of Sound</span>
        </div>
        <nav className="explore-article-foot__links" aria-label="Footer">
          <Link to="/explore">About</Link>
          <Link to="/explore">Contact</Link>
          <span>Privacy</span>
          <span>Terms</span>
        </nav>
        <p className="explore-article-foot__copy">© {new Date().getFullYear()} Institute of Sound</p>
      </footer>
    </article>
  )
}
