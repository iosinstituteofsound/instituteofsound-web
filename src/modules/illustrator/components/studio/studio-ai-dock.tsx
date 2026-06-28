import { AI_ACTIONS } from '@/modules/illustrator/components/studio/studio-data'
import { StudioGlass } from '@/modules/illustrator/components/studio/studio-glass'

export function StudioAiDock() {
  return (
    <div data-testid="studio-ai-dock">
      <StudioGlass className="mas-ai-dock">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--mas-muted)]">AI Studio</p>
        <div className="mas-ai-dock__grid">
          {AI_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <button key={action.id} type="button" className="mas-ai-card">
                <span className="mas-ai-card__icon">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <span>
                  <span className="mas-ai-card__title">{action.title}</span>
                  <p className="mas-ai-card__desc">{action.desc}</p>
                </span>
              </button>
            )
          })}
        </div>
      </StudioGlass>
    </div>
  )
}
