import { useState } from 'react'
import { ChevronRight, Minus, Play, Plus, Redo2, Share2, Undo2, X } from 'lucide-react'
import { env } from '@/shared/config/env'
import type { StudioSaveStatus } from '@/modules/illustrator/hooks/use-studio-autosave'
import { StudioGlass } from '@/modules/illustrator/components/studio/studio-glass'

function saveLabel(status: StudioSaveStatus | undefined, saved: boolean) {
  if (status === 'dirty') return 'Save failed'
  if (status === 'saving') return 'Saving…'
  return saved ? 'Saved' : 'Saving…'
}

type StudioTopBarProps = {
  title: string
  status: string
  zoom: number
  saved?: boolean
  saveStatus?: StudioSaveStatus
  placement?: 'canvas' | 'rail'
  onZoomIn: () => void
  onZoomOut: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
}

export function StudioTopBar({
  title,
  status,
  zoom,
  saved = true,
  saveStatus,
  placement = 'canvas',
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: StudioTopBarProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`mas-topbar-wrap${expanded ? ' mas-topbar-wrap--expanded' : ''}${placement === 'rail' ? ' mas-topbar-wrap--rail' : ''}`}
    >
      <StudioGlass
        className={`mas-topbar${expanded ? ' mas-topbar--expanded' : ' mas-topbar--compact'}`}
        pill={expanded}
      >
        {!expanded ? (
          <button
            type="button"
            className="mas-topbar__trigger"
            aria-label="Open command bar"
            aria-expanded={false}
            onClick={() => setExpanded(true)}
          >
            <span className="mas-topbar__mark" aria-hidden />
          </button>
        ) : (
          <div className="mas-topbar__inner" aria-expanded>
            <div className="mas-topbar__brand">
              <span className="mas-topbar__mark" aria-hidden />
              <div className="mas-topbar__title-block">
                <p className="mas-topbar__app">{env.appName}</p>
                <div className="mas-topbar__doc">
                  <span className="truncate max-w-[140px]">{title}</span>
                  <span className="mas-topbar__status">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mas-topbar__cluster">
              <span className="text-xs font-medium text-[var(--mas-muted)]">{saveLabel(saveStatus, saved)}</span>
              <div className="mas-topbar__divider" />
              <button type="button" className="mas-icon-btn" aria-label="Undo" onClick={onUndo} disabled={!canUndo}>
                <Undo2 size={16} strokeWidth={1.75} />
              </button>
              <button type="button" className="mas-icon-btn" aria-label="Redo" onClick={onRedo} disabled={!canRedo}>
                <Redo2 size={16} strokeWidth={1.75} />
              </button>
              <div className="mas-topbar__divider" />
              <button type="button" className="mas-icon-btn" aria-label="Zoom out" onClick={onZoomOut}>
                <Minus size={16} strokeWidth={1.75} />
              </button>
              <span className="mas-zoom">{zoom}%</span>
              <button type="button" className="mas-icon-btn" aria-label="Zoom in" onClick={onZoomIn}>
                <Plus size={16} strokeWidth={1.75} />
              </button>
              <button type="button" className="mas-icon-btn" aria-label="Preview">
                <Play size={16} strokeWidth={1.75} />
              </button>
            </div>

            <div className="mas-topbar__cluster">
              <button type="button" className="mas-btn">
                <Share2 size={14} strokeWidth={1.75} />
                Share
              </button>
              <button type="button" className="mas-btn">
                Export
                <ChevronRight size={14} strokeWidth={1.75} />
              </button>
              <button type="button" className="mas-btn mas-btn--primary">
                Publish
                <ChevronRight size={14} strokeWidth={1.75} />
              </button>
              <div className="mas-topbar__divider" />
              <button
                type="button"
                className="mas-icon-btn mas-icon-btn--close"
                aria-label="Close command bar"
                onClick={() => setExpanded(false)}
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        )}
      </StudioGlass>
    </div>
  )
}
