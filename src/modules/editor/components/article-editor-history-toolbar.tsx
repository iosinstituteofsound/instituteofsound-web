import {
  Circle,
  CircleDashed,
  Redo2,
  Undo2,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { CanvasPreviewMode } from '@/modules/editor/hooks/use-article-canvas-history'
import { cn } from '@/shared/lib/cn'

function RedoPlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M16 6h4v4" />
      <path d="M20 10a8 8 0 1 0 1.8 5" />
      <path d="M8 18h8" />
      <path d="M8 15h5" />
      <path d="M8 12h3" />
    </svg>
  )
}

function RevertIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 7H5v4" />
      <path d="M5 11a7 7 0 1 0 2.2 5.1" />
      <path d="M12 8H8" />
      <path d="M12 11H9" />
    </svg>
  )
}

interface ToolbarButtonProps {
  label: string
  disabled?: boolean
  active?: boolean
  onClick?: () => void
  onPointerDown?: () => void
  onPointerUp?: () => void
  onPointerLeave?: () => void
  children: ReactNode
}

function ToolbarButton({
  label,
  disabled,
  active,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'article-editor-history__btn',
        active && 'article-editor-history__btn--active',
        disabled && 'article-editor-history__btn--disabled',
      )}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      aria-label={label}
      aria-pressed={active}
    >
      <span className="article-editor-history__icon">{children}</span>
      <span className="article-editor-history__label">{label}</span>
    </button>
  )
}

interface ArticleEditorHistoryToolbarProps {
  canUndo: boolean
  canRedo: boolean
  canRedoAll: boolean
  canRevert: boolean
  previewMode: CanvasPreviewMode
  onRevert: () => void
  onUndo: () => void
  onRedo: () => void
  onRedoAll: () => void
  onOriginalHoldStart: () => void
  onOriginalHoldEnd: () => void
  onCompareToggle: () => void
}

export function ArticleEditorHistoryToolbar({
  canUndo,
  canRedo,
  canRedoAll,
  canRevert,
  previewMode,
  onRevert,
  onUndo,
  onRedo,
  onRedoAll,
  onOriginalHoldStart,
  onOriginalHoldEnd,
  onCompareToggle,
}: ArticleEditorHistoryToolbarProps) {
  return (
    <div className="article-editor-history">
      <ToolbarButton label="Revert" disabled={!canRevert} onClick={onRevert}>
        <RevertIcon className="h-5 w-5" />
      </ToolbarButton>

      <ToolbarButton label="Undo" disabled={!canUndo} onClick={onUndo}>
        <Undo2 className="h-5 w-5" />
      </ToolbarButton>

      <ToolbarButton label="Redo" disabled={!canRedo} onClick={onRedo}>
        <Redo2 className="h-5 w-5" />
      </ToolbarButton>

      <ToolbarButton label="Redo+" disabled={!canRedoAll} onClick={onRedoAll}>
        <RedoPlusIcon className="h-5 w-5" />
      </ToolbarButton>

      <ToolbarButton
        label="Original"
        disabled={!canRevert}
        active={previewMode === 'original'}
        onPointerDown={onOriginalHoldStart}
        onPointerUp={onOriginalHoldEnd}
        onPointerLeave={onOriginalHoldEnd}
      >
        <Circle className="h-5 w-5" />
      </ToolbarButton>

      <ToolbarButton
        label="Compare"
        disabled={!canRevert}
        active={previewMode === 'compare'}
        onClick={onCompareToggle}
      >
        <CircleDashed className="h-5 w-5" />
      </ToolbarButton>
    </div>
  )
}
