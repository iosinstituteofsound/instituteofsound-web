import { useMemo } from 'react'
import type { Data } from '@measured/puck'
import { ArticleAudioWidget } from '@/modules/explore/components/article-audio-widget'
import { articleAuthorAvatar } from '@/modules/explore/lib/article-content'
import { ArticleCanvasArtifactLayer } from '@/modules/editor/components/article-canvas-artifact-layer'
import { ArticleCanvasEffectsOverlay } from '@/modules/editor/components/article-canvas-effects-overlay'
import { ArticleLiveFreeBlocksLayer } from '@/modules/editor/components/article-live-free-blocks-layer'
import { ArticleLiveSortableStack } from '@/modules/editor/components/article-live-sortable-stack'
import {
  canvasBackgroundToStyle,
  readCanvasBackground,
} from '@/modules/editor/lib/canvas-background-utils'
import { readCanvasArtifact } from '@/modules/editor/lib/canvas-artifact-utils'
import {
  canvasEffectsFilterStyle,
  readCanvasEffects,
} from '@/modules/editor/lib/canvas-effects-utils'
import {
  ensureCanvasLayouts,
  isCanvasBlockHiddenById,
} from '@/modules/editor/lib/canvas-block-utils'
import { getHeroBlockIdSet } from '@/modules/editor/lib/live-article-body'
import { resolvePuckLivePreview } from '@/modules/editor/lib/puck-live-preview'
import { extractHeroImageUrl } from '@/modules/editor/lib/puck-to-html'
import type { ArticleEditorMeta } from '@/modules/editor/types/article-editor.types'
import '@/modules/explore/styles/explore.css'

interface ArticleComposedArticlePreviewProps {
  puckData: Data
  meta: ArticleEditorMeta
  excerpt: string
  slug: string
  authorName: string
  readMinutes: number
}

export function ArticleComposedArticlePreview({
  puckData,
  meta,
  excerpt,
  slug,
  authorName,
  readMinutes,
}: ArticleComposedArticlePreviewProps) {
  const canvasBackground = readCanvasBackground(puckData)
  const canvasBackgroundStyle = canvasBackground.hidden
    ? undefined
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
        seedId: slug || 'preview',
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

  return (
    <div
      className="article-composed-article-preview relative min-h-full w-full"
      style={canvasBackgroundStyle}
    >
      <div className="article-canvas-board__stage relative min-h-full w-full" style={canvasEffectsFilter}>
        <ArticleCanvasArtifactLayer artifact={canvasArtifact} data={puckData} />
        <article className="explore-article explore-article--editor-preview relative z-[1]">
          <header className="explore-article-hero">
            {!heroImageHidden ? (
              heroImageUrl ? (
                <img src={heroImageUrl} alt="" className="explore-article-hero__img" />
              ) : (
                <span className="explore-article-hero__img explore-article-hero__img--empty" aria-hidden />
              )
            ) : null}
            <div className="explore-article-hero__scrim" aria-hidden />
            <div className="explore-article-hero__glow" aria-hidden />
            <div className="explore-article-hero__grain" aria-hidden />

            <div className="explore-article-hero__stage">
              <div className="explore-article-hero__content">
                <span className="explore-article-hero__tag">{preview.category}</span>

                {!heroTitleHidden ? (
                  <h1 className="explore-article-hero__title">{preview.title}</h1>
                ) : null}

                {preview.deck ? <p className="explore-article-hero__deck">{preview.deck}</p> : null}

                <div className="explore-article-hero__meta">
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

              {!heroAudioHidden && preview.sessionAudio ? (
                <ArticleAudioWidget
                  title={preview.title}
                  streamUrl={preview.sessionAudio}
                  tracks={preview.sessionTracks}
                  sessionLabel={preview.sessionLabel}
                  variant="hero"
                  className="explore-article-hero__audio"
                />
              ) : null}
            </div>
          </header>

          <div className="explore-article-main article-live-flow-main">
            <ArticleLiveSortableStack
              puckData={puckData}
              preview={preview}
              heroBlockIds={heroBlockIds}
              selectedBlockIds={[]}
              onChange={() => undefined}
              onSelectBlocks={() => undefined}
              onSelectSoundDna={() => undefined}
              showSoundDna={preview.showSoundDna}
              soundDna={preview.soundDna}
              readOnly
            />
          </div>
        </article>

        <ArticleLiveFreeBlocksLayer
          boardRef={{ current: null }}
          data={ensureCanvasLayouts(puckData)}
          selectedBlockIds={[]}
          onChange={() => undefined}
          onSelectBlocks={() => undefined}
          readOnly
        />
      </div>
      <ArticleCanvasEffectsOverlay effects={canvasEffects} />
    </div>
  )
}
