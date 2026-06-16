import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ArticleDto } from '@/modules/explore/types/explore.types'
import {
  articleCategory,
  articleDate,
  articleReadTime,
} from '@/modules/explore/lib/editorial-meta'

interface ArticleRelatedGridProps {
  articles: ArticleDto[]
  currentSlug: string
}

export function ArticleRelatedGrid({ articles, currentSlug }: ArticleRelatedGridProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const related = articles.filter((article) => article.slug !== currentSlug).slice(0, 4)

  const updateScrollState = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    const { scrollLeft, clientWidth, scrollWidth } = track
    setCanScrollPrev(scrollLeft > 4)
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()

    const track = trackRef.current
    if (!track) return

    track.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    const observer = new ResizeObserver(updateScrollState)
    observer.observe(track)

    return () => {
      track.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
      observer.disconnect()
    }
  }, [updateScrollState, related.length])

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return

    const card = track.querySelector<HTMLElement>('.explore-article-related__card')
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 10
    const step = (card?.offsetWidth ?? track.clientWidth * 0.78) + gap

    track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  if (related.length === 0) return null

  return (
    <section className="explore-article-related" aria-labelledby="explore-article-related-title">
      <header className="explore-article-related__head">
        <div className="explore-article-related__brand">
          <div>
            <p className="explore-article-related__kicker">Related reads</p>
            <h2 id="explore-article-related-title" className="explore-article-related__title">
              Continue exploring
              <br />
              the underground
            </h2>
          </div>
        </div>

        <div className="explore-article-related__nav">
          <button
            type="button"
            className="explore-article-related__nav-btn"
            aria-label="Previous articles"
            disabled={!canScrollPrev}
            onClick={() => scroll(-1)}
          >
            <ArrowLeft size={13} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="explore-article-related__nav-btn"
            aria-label="Next articles"
            disabled={!canScrollNext}
            onClick={() => scroll(1)}
          >
            <ArrowRight size={13} strokeWidth={2} />
          </button>
        </div>
      </header>

      <div ref={trackRef} className="explore-article-related__track">
        {related.map((article, index) => (
          <Link
            key={article.id}
            to={`/explore/articles/${article.slug}`}
            className="explore-article-related__card"
            style={{ '--explore-related-delay': `${80 + index * 45}ms` } as React.CSSProperties}
          >
            <div className="explore-article-related__media" aria-hidden>
              {article.coverUrl ? (
                <img
                  src={article.coverUrl}
                  alt=""
                  loading="lazy"
                  className="explore-article-related__img"
                />
              ) : (
                <span className="explore-article-related__img explore-article-related__img--empty" />
              )}
              <div className="explore-article-related__shade" />
              <div className="explore-article-related__tint" />
              <div className="explore-article-related__grain" />
            </div>

            <div className="explore-article-related__body">
              <div className="explore-article-related__top">
                <p className="explore-article-related__idx">
                  {String(index + 1).padStart(2, '0')} {articleCategory(article)}
                </p>
                <span className="explore-article-related__arrow" aria-hidden>
                  <ArrowUpRight size={12} strokeWidth={2.25} />
                </span>
              </div>

              <h3 className="explore-article-related__name">{article.title}</h3>
              <p className="explore-article-related__meta">
                {articleReadTime(article.slug)} · {articleDate(article)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
