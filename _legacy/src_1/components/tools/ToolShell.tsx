import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { TOOL_MAP, type ToolId } from '@/lib/tools/registry'
import { ToolIcon } from '@/components/tools/ToolIcon'

interface ToolShellProps {
  toolId: ToolId
  title: string
  subtitle?: string
  children: ReactNode
}

export function ToolShell({ toolId, title, subtitle, children }: ToolShellProps) {
  const meta = TOOL_MAP[toolId]

  return (
    <div className="ios-tools-page">
      <div className="ios-tools-page-inner">
        <Link to="/tools" className="ios-tools-back">
          <span aria-hidden>←</span> Toolkit
        </Link>

        <header className={`ios-tools-hero ios-tools-accent-${meta.accent}`}>
          <div className="ios-tools-hero-grid">
            <div className="ios-tools-hero-icon" aria-hidden>
              <ToolIcon id={toolId} />
            </div>
            <div className="ios-tools-hero-copy">
              <p className="ios-tools-code">{meta.code} · Phase {meta.phase}</p>
              <h1 className="ios-tools-hero-title">{title}</h1>
              {subtitle && <p className="ios-tools-hero-sub">{subtitle}</p>}
            </div>
            <div className="ios-tools-hero-stat">
              <span className="ios-tools-stat-value">{meta.stat.value}</span>
              <span className="ios-tools-stat-label">{meta.stat.label}</span>
            </div>
          </div>
          <div className="ios-tools-hero-features">
            {meta.features.map((f) => (
              <span key={f} className="ios-tools-feature-pill">
                {f}
              </span>
            ))}
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}

interface ToolWorkspaceProps {
  controls: ReactNode
  output: ReactNode
  outputLabel?: string
}

export function ToolWorkspace({ controls, output, outputLabel = 'Live output' }: ToolWorkspaceProps) {
  return (
    <div className="ios-tools-workspace">
      <div className="ios-tools-panel ios-tools-panel-input">
        <div className="ios-tools-panel-head">
          <span className="ios-tools-panel-dot ios-tools-panel-dot-in" />
          <span className="ios-tools-panel-title">Configure</span>
        </div>
        {controls}
      </div>
      <div className="ios-tools-panel ios-tools-panel-output">
        <div className="ios-tools-panel-head">
          <span className="ios-tools-panel-dot ios-tools-panel-dot-out" />
          <span className="ios-tools-panel-title">{outputLabel}</span>
          <span className="ios-tools-live-badge">Live</span>
        </div>
        {output}
      </div>
    </div>
  )
}

export function ToolPipeline({ children }: { children: ReactNode }) {
  return <ol className="ios-tools-pipeline">{children}</ol>
}

interface ToolPipelineStepProps {
  step: number
  title: string
  purpose: string
  settings: string
  tip: string
}

export function ToolPipelineStep({ step, title, purpose, settings, tip }: ToolPipelineStepProps) {
  return (
    <li className="ios-tools-pipeline-step">
      <div className="ios-tools-pipeline-node">{step}</div>
      <div className="ios-tools-pipeline-body">
        <h3>{title}</h3>
        <p className="ios-tools-pipeline-purpose">{purpose}</p>
        <p className="ios-tools-pipeline-settings">
          <span>Settings</span> {settings}
        </p>
        <p className="ios-tools-pipeline-tip">{tip}</p>
      </div>
    </li>
  )
}

export function ToolCallout({ children }: { children: ReactNode }) {
  return <div className="ios-tools-callout">{children}</div>
}

export function ToolActionButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={variant === 'primary' ? 'ios-tools-action' : 'ios-tools-action ios-tools-action-ghost'}
    >
      {children}
    </button>
  )
}
