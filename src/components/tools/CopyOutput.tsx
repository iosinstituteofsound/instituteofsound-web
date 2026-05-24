import { useState } from 'react'
import clsx from 'clsx'

interface CopyOutputProps {
  value: string
  label?: string
  className?: string
  emptyMessage?: string
}

export function CopyOutput({
  value,
  label = 'Copy output',
  className,
  emptyMessage = 'Adjust settings to generate output.',
}: CopyOutputProps) {
  const [copied, setCopied] = useState(false)
  const hasContent = value.trim().length > 0

  const copy = async () => {
    if (!hasContent) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={clsx('ios-tools-terminal', className)}>
      <div className="ios-tools-terminal-bar" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="ios-tool-scroll ios-tools-terminal-body" data-lenis-prevent>
        {hasContent ? (
          <pre>{value}</pre>
        ) : (
          <div className="ios-tools-empty">
            <div className="ios-tools-empty-icon">◇</div>
            {emptyMessage}
          </div>
        )}
      </div>
      <div className="ios-tools-copy-row">
        <button
          type="button"
          onClick={() => void copy()}
          disabled={!hasContent}
          className="ios-tools-action"
        >
          {copied ? 'Copied to clipboard' : label}
        </button>
      </div>
    </div>
  )
}
