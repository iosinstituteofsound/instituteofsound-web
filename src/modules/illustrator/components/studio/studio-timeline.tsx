import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { LAYER_TREE } from '@/modules/illustrator/components/studio/studio-data'
import { StudioGlass } from '@/modules/illustrator/components/studio/studio-glass'

export function StudioTimeline() {
  return (
    <StudioGlass className="mas-timeline">
      <div className="mas-timeline__head">
        <div className="flex items-center gap-3">
          <button type="button" className="mas-icon-btn mas-icon-btn--active" aria-label="Play">
            <Play size={14} strokeWidth={1.75} fill="currentColor" />
          </button>
          <button type="button" className="mas-icon-btn" aria-label="Pause">
            <Pause size={14} strokeWidth={1.75} />
          </button>
          <button type="button" className="mas-icon-btn" aria-label="Skip back">
            <SkipBack size={14} strokeWidth={1.75} />
          </button>
          <button type="button" className="mas-icon-btn" aria-label="Skip forward">
            <SkipForward size={14} strokeWidth={1.75} />
          </button>
          <span className="mas-timeline__title">Timeline</span>
        </div>
        <span className="mas-timeline__time">00:45:12 / 03:21:00</span>
      </div>

      <div className="mas-timeline__body">
        <div className="mas-timeline__labels">
          {LAYER_TREE.filter((l) => !l.folder)
            .slice(0, 5)
            .map((layer) => (
              <div key={`tl-${layer.id}`} className="truncate py-1">
                {layer.label}
              </div>
            ))}
          <div className="mt-2 truncate text-[var(--mas-selection)]">Death is not the End.mp3</div>
        </div>

        <div className="mas-timeline__tracks">
          <div className="mas-timeline__playhead" style={{ left: '38%' }} aria-hidden />
          {LAYER_TREE.filter((l) => !l.folder)
            .slice(0, 4)
            .map((layer, i) => (
              <div key={`clip-${layer.id}`} className={`mas-clip${i === 0 ? ' mas-clip--active' : ''}`} />
            ))}
          <div className="mas-wave" aria-hidden />
        </div>
      </div>
    </StudioGlass>
  )
}
