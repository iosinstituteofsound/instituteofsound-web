import { useMemo, useState } from 'react'
import { getLessonVideos } from '@/lib/academy/lessonVideos'
import type { AcademyLesson, AcademyLessonVideo } from '@/lib/academy/types'

interface AcademyLessonMediaSidebarProps {
  lesson: AcademyLesson
}

type MediaKind = 'video' | 'playlist' | 'guide'

function mediaKind(item: AcademyLessonVideo): MediaKind {
  if (item.href) return 'guide'
  if (item.playlistId) return 'playlist'
  return 'video'
}

function youtubeEmbedSrc(item: AcademyLessonVideo): string {
  if (item.playlistId) {
    return `https://www.youtube-nocookie.com/embed/videoseries?list=${item.playlistId}`
  }
  return `https://www.youtube-nocookie.com/embed/${item.youtubeId ?? ''}`
}

function MediaPlayer({ item, compact }: { item: AcademyLessonVideo; compact?: boolean }) {
  if (item.href) {
    return (
      <div className={`academy-media-player-guide${compact ? ' academy-media-player-guide--compact' : ''}`}>
        <p className="academy-media-player-guide-text">
          External guide — open in a new tab, then return here.
        </p>
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="academy-media-player-guide-btn"
        >
          Open guide →
        </a>
      </div>
    )
  }

  return (
    <div className={`academy-media-player-frame${compact ? ' academy-media-player-frame--compact' : ''}`}>
      <iframe
        src={youtubeEmbedSrc(item)}
        title={item.title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function MediaItemList({
  items,
  activeIndex,
  onSelect,
  layout,
}: {
  items: AcademyLessonVideo[]
  activeIndex: number
  onSelect: (index: number) => void
  layout: 'vertical' | 'horizontal'
}) {
  return (
    <ul
      className={`academy-lesson-media-list academy-lesson-media-list--${layout}`}
      role="listbox"
      aria-label="Study media items"
    >
      {items.map((item, index) => {
        const itemKind = mediaKind(item)
        const isActive = index === activeIndex
        return (
          <li key={item.youtubeId ?? item.playlistId ?? item.href ?? index} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={isActive}
              className={`academy-lesson-media-item${isActive ? ' is-active' : ''}`}
              onClick={() => onSelect(index)}
            >
              <span className={`academy-lesson-media-item-badge academy-lesson-media-badge-${itemKind}`}>
                {itemKind === 'video' ? 'Vid' : itemKind === 'playlist' ? 'List' : 'Doc'}
              </span>
              <span className="academy-lesson-media-item-title">{item.title}</span>
              <span className="academy-lesson-media-item-index" aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function AcademyLessonMediaSidebar({ lesson }: AcademyLessonMediaSidebarProps) {
  const items = useMemo(() => getLessonVideos(lesson), [lesson])
  const [activeIndex, setActiveIndex] = useState(0)
  const [dockExpanded, setDockExpanded] = useState(false)

  if (items.length === 0) return null

  const active = items[activeIndex] ?? items[0]
  const kind = mediaKind(active)
  const kindLabel = kind === 'video' ? 'Video' : kind === 'playlist' ? 'Playlist' : 'Guide'

  const selectItem = (index: number) => {
    setActiveIndex(index)
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setDockExpanded(true)
    }
  }

  const goPrev = () => {
    selectItem(activeIndex > 0 ? activeIndex - 1 : items.length - 1)
  }

  const goNext = () => {
    selectItem(activeIndex < items.length - 1 ? activeIndex + 1 : 0)
  }

  return (
    <aside
      className={`academy-lesson-media${dockExpanded ? ' is-expanded' : ''}`}
      aria-label="Lesson study media"
    >
      {/* Desktop / large tablet: right sidebar */}
      <div className="academy-lesson-media-panel academy-lesson-media-panel--desktop">
        <header className="academy-lesson-media-header">
          <span className="academy-lesson-media-kicker">Study media</span>
          <h2 className="academy-lesson-media-heading">Watch &amp; reference</h2>
          <p className="academy-lesson-media-count">
            {items.length} {items.length === 1 ? 'item' : 'items'} · pick below to switch
          </p>
        </header>

        <div className="academy-lesson-media-stage">
          <MediaPlayer item={active} />
          <p className="academy-lesson-media-active-title">{active.title}</p>
          <span className={`academy-lesson-media-active-badge academy-lesson-media-badge-${kind}`}>
            {kindLabel}
          </span>
        </div>

        <MediaItemList
          items={items}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
          layout="vertical"
        />
      </div>

      {/* Mobile / tablet: bottom sticky dock */}
      <div className="academy-lesson-media-dock" role="region" aria-label="Study media player">
        {dockExpanded && (
          <button
            type="button"
            className="academy-lesson-media-dock-backdrop"
            aria-label="Close player"
            onClick={() => setDockExpanded(false)}
          />
        )}

        <div className="academy-lesson-media-dock-inner">
          {dockExpanded && (
            <div className="academy-lesson-media-dock-sheet" id="academy-media-dock-sheet">
              <div className="academy-lesson-media-dock-sheet-head">
                <span className="academy-lesson-media-kicker">Study media</span>
                <button
                  type="button"
                  className="academy-lesson-media-dock-close"
                  aria-label="Collapse player"
                  onClick={() => setDockExpanded(false)}
                >
                  Close
                </button>
              </div>
              <div className="academy-lesson-media-dock-stage">
                <MediaPlayer item={active} compact />
              </div>
              <MediaItemList
                items={items}
                activeIndex={activeIndex}
                onSelect={selectItem}
                layout="horizontal"
              />
            </div>
          )}

          <div className="academy-lesson-media-dock-bar">
            {items.length > 1 && (
              <button
                type="button"
                className="academy-lesson-media-dock-step"
                aria-label="Previous video"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
              >
                ‹
              </button>
            )}

            <button
              type="button"
              className="academy-lesson-media-dock-bar-main"
              aria-expanded={dockExpanded}
              aria-controls="academy-media-dock-sheet"
              onClick={() => setDockExpanded((v) => !v)}
            >
              <span className={`academy-lesson-media-dock-badge academy-lesson-media-badge-${kind}`}>
                {kindLabel}
              </span>
              <span className="academy-lesson-media-dock-title">{active.title}</span>
              {items.length > 1 && (
                <span className="academy-lesson-media-dock-count">
                  {activeIndex + 1}/{items.length}
                </span>
              )}
              <span className={`academy-lesson-media-dock-chevron${dockExpanded ? ' is-up' : ''}`} aria-hidden>
                ▲
              </span>
            </button>

            {items.length > 1 && (
              <button
                type="button"
                className="academy-lesson-media-dock-step"
                aria-label="Next video"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
              >
                ›
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
