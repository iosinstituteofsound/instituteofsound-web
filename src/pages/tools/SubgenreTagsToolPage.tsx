import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { CopyOutput } from '@/components/tools/CopyOutput'
import { ToolSelectField } from '@/components/tools/ToolSelectField'
import { ToolActionButton, ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import {
  SUBGENRE_CATEGORIES,
  buildTagCopy,
  formatHashtags,
} from '@/lib/tools/subgenreTags'

type CopyMode = 'bio' | 'prompt' | 'submission'

export default function SubgenreTagsToolPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [mode, setMode] = useState<CopyMode>('bio')

  const toggle = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const list = useMemo(() => [...selected], [selected])
  const body = useMemo(() => buildTagCopy(list, mode), [list, mode])
  const hashtags = useMemo(() => formatHashtags(list), [list])

  const exportAll = [body, '', 'Hashtags:', hashtags].filter(Boolean).join('\n')

  return (
    <ToolShell
      toolId="subgenre-tags"
      title="Subgenre Tag Picker"
      subtitle="Metal & underground tags for bios, AI prompts, and IOS submissions."
    >
      <ToolWorkspace
        outputLabel="Tag output"
        controls={
          <div className="ios-tools-fields">
            <ToolSelectField
              id="tag-mode"
              label="Output style"
              value={mode}
              onChange={(v) => setMode(v as CopyMode)}
              options={[
                { value: 'bio', label: 'Artist bio blurb' },
                { value: 'prompt', label: 'Music prompt block' },
                { value: 'submission', label: 'Submission notes' },
              ]}
            />
            {SUBGENRE_CATEGORIES.map((cat) => (
              <div key={cat.id} className="ios-tools-tag-category">
                <p className="ios-tools-tag-category-label">{cat.label}</p>
                <div className="ios-tools-tag-pick-grid">
                  {cat.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={clsx(
                        'ios-tools-tag-pick',
                        selected.has(tag) && 'ios-tools-tag-pick-on'
                      )}
                      onClick={() => toggle(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <ToolActionButton variant="ghost" onClick={() => setSelected(new Set())}>
              Clear all
            </ToolActionButton>
          </div>
        }
        output={
          list.length > 0 ? (
            <>
              <div className="ios-tools-tag-row">
                {list.slice(0, 8).map((t) => (
                  <span key={t} className="ios-tools-tag ios-tools-tag-accent">
                    {t}
                  </span>
                ))}
                {list.length > 8 && (
                  <span className="ios-tools-tag">+{list.length - 8} more</span>
                )}
              </div>
              <div className="ios-tools-output-block">{body}</div>
              {hashtags && (
                <p className="text-xs text-muted font-mono mt-3 break-words">{hashtags}</p>
              )}
              <CopyOutput value={exportAll} label="Copy tags + text" className="mt-4" />
            </>
          ) : (
            <div className="ios-tools-empty">
              <div className="ios-tools-empty-icon">#</div>
              Select tags to build copy
            </div>
          )
        }
      />
    </ToolShell>
  )
}
