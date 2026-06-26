import { useMemo, useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, MessageCircle, Plus, Sparkles } from 'lucide-react'
import {
  createIllustratorArtwork,
  listIllustratorPortfolio,
} from '@/modules/illustrator/api/illustrator.api'
import { NewCanvasDialog } from '@/modules/illustrator/components/new-canvas-dialog'
import { IllustratorStudioShell } from '@/modules/illustrator/components/illustrator-studio-shell'
import type { StudioArtworkDraft } from '@/modules/illustrator/components/illustrator-studio-shell'
import type { CanvasPreset } from '@/modules/illustrator/lib/studio-canvas-presets'
import { illustratorBreadcrumbs } from '@/modules/illustrator/lib/illustrator-breadcrumb'
import { formatIllustratorCount } from '@/modules/illustrator/lib/illustrator-dashboard-utils'
import { backfillStudioPreviewFromServer } from '@/modules/illustrator/lib/studio-preview-backfill'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { Loader } from '@/shared/components/feedback/loader'
import { Page, PageSection } from '@/shared/components/layout/page-shell'
import '@/modules/music/styles/artist-dashboard-home.css'
import '@/modules/music/styles/artist-releases-page.css'
import '@/modules/illustrator/styles/illustrator-canvas-page.css'

const PORTFOLIO_QUERY_KEY = ['illustrator-canvas'] as const

export function IllustratorCanvasPage() {
  const queryClient = useQueryClient()
  const [newCanvasOpen, setNewCanvasOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [studioOpen, setStudioOpen] = useState(false)
  const [activeArtwork, setActiveArtwork] = useState<StudioArtworkDraft | undefined>()

  const { data: artworks, isLoading } = useQuery({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: listIllustratorPortfolio,
  })

  const items = useMemo(() => artworks ?? [], [artworks])
  const backfillStartedRef = useRef(false)

  const refreshPortfolio = () => {
    void queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEY })
  }

  useEffect(() => {
    const missing = items.filter((item) => item.source === 'studio' && !item.imageUrl)
    if (!missing.length || backfillStartedRef.current) return

    backfillStartedRef.current = true
    let cancelled = false

    const run = async () => {
      let updated = false
      for (const item of missing.slice(0, 4)) {
        if (cancelled) return
        try {
          const ok = await backfillStudioPreviewFromServer(item.id)
          if (ok) updated = true
        } catch {
          // keep grid stable if one backfill fails
        }
      }
      if (!cancelled && updated) refreshPortfolio()
    }

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 400))
    const idleId = idle(() => {
      void run()
    })

    return () => {
      cancelled = true
      if (window.cancelIdleCallback) window.cancelIdleCallback(idleId as number)
    }
  }, [items])

  const openCreateFlow = () => {
    setNewCanvasOpen(true)
  }

  const openStudio = (artwork: StudioArtworkDraft) => {
    setActiveArtwork(artwork)
    setStudioOpen(true)
  }

  const handlePresetSelect = async (preset: CanvasPreset) => {
    setCreating(true)
    try {
      const created = await createIllustratorArtwork({
        title: 'Untitled Artwork',
        width: preset.width,
        height: preset.height,
        dpi: preset.dpi,
        colorProfile: preset.colorProfile,
      })

      openStudio({
        id: created.id,
        title: created.title,
        status: created.status,
        source: 'studio',
        width: created.document.width,
        height: created.document.height,
        dpi: created.document.dpi,
        colorProfile: created.document.colorProfile,
      })
      setNewCanvasOpen(false)
      refreshPortfolio()
    } finally {
      setCreating(false)
    }
  }

  return (
    <Page>
      <PageSection className="artist-releases-page releases-page releases-page--embed">
        <AppBreadcrumb
          surface
          className="app-breadcrumb--dashboard"
          items={illustratorBreadcrumbs.canvas()}
          description="Create, manage, and publish your visual work."
          actions={
            <button type="button" className="ios-artist-dashboard__upload-btn" onClick={openCreateFlow}>
              <Plus size={16} aria-hidden />
              Create
            </button>
          }
        />

        {isLoading ? (
          <Loader />
        ) : (
          <div className="ios-illustrator-canvas-grid">
            <button
              type="button"
              className="ios-illustrator-canvas-card ios-illustrator-canvas-card--create"
              onClick={openCreateFlow}
            >
              <span className="ios-illustrator-canvas-card__create-icon" aria-hidden>
                <Plus size={28} />
              </span>
              <span className="ios-illustrator-canvas-card__create-title">Create</span>
              <span className="ios-illustrator-canvas-card__create-hint">
                Open the studio — layers, brushes, timeline, all in one place.
              </span>
            </button>

            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="ios-illustrator-canvas-card"
                onClick={() =>
                  openStudio({
                    id: item.id,
                    title: item.title || 'Untitled Artwork',
                    imageUrl: item.source === 'feed' ? item.imageUrl : undefined,
                    status: item.status === 'published' ? 'published' : 'draft',
                    source: item.source ?? 'feed',
                    width: item.width,
                    height: item.height,
                    dpi: item.dpi,
                    colorProfile: item.colorProfile,
                  })
                }
              >
                <div className="ios-illustrator-canvas-card__preview">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title || 'Artwork'} loading="lazy" decoding="async" />
                  ) : (
                    <span className="ios-illustrator-canvas-card__preview-empty">
                      <Sparkles size={22} aria-hidden />
                    </span>
                  )}
                </div>
                <div className="ios-illustrator-canvas-card__body">
                  <h3>{item.title || 'Untitled artwork'}</h3>
                  <div className="ios-illustrator-canvas-card__meta">
                    {item.status === 'draft' ? <span>Draft</span> : null}
                    <span>
                      <Heart size={13} aria-hidden />
                      {formatIllustratorCount(item.reactionTotal)}
                    </span>
                    <span>
                      <MessageCircle size={13} aria-hidden />
                      {formatIllustratorCount(item.commentCount)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </PageSection>

      <NewCanvasDialog
        open={newCanvasOpen}
        onOpenChange={setNewCanvasOpen}
        onSelect={handlePresetSelect}
        busy={creating}
      />

      {studioOpen ? (
        <IllustratorStudioShell
          key={activeArtwork?.id ?? 'new'}
          open={studioOpen}
          onOpenChange={setStudioOpen}
          artwork={activeArtwork}
          onPortfolioChange={refreshPortfolio}
        />
      ) : null}
    </Page>
  )
}
