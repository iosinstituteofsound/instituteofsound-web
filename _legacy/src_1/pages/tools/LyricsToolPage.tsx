import { useMemo, useState } from 'react'
import { CopyOutput } from '@/components/tools/CopyOutput'
import { ToolDropCta } from '@/components/tools/ToolDropCta'
import { ToolTextAreaField } from '@/components/tools/ToolSelectField'
import { ToolCallout, ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import { analyzeLyrics, formatLyricsExport } from '@/lib/tools/lyrics'

const PLACEHOLDER = `Verse one line here
Another line with rhyme time
Chorus hits harder
Echo the last word`

export default function LyricsToolPage() {
  const [text, setText] = useState('')

  const analysis = useMemo(() => analyzeLyrics(text), [text])
  const exportText = useMemo(() => formatLyricsExport(analysis), [analysis])

  return (
    <ToolShell
      toolId="lyrics"
      title="Lyric Rhyme & Syllable Counter"
      subtitle="Count syllables, spot end-rhymes, and map verse structure — no AI."
    >
      <ToolWorkspace
        outputLabel="Line analysis"
        controls={
          <div className="ios-tools-fields">
            <ToolTextAreaField
              id="lyrics-input"
              label="Lyrics"
              value={text}
              onChange={setText}
              placeholder={PLACEHOLDER}
              rows={12}
            />
          </div>
        }
        output={
          text.trim() ? (
            <>
              <div className="ios-tools-tag-row">
                <span className="ios-tools-tag ios-tools-tag-accent">{analysis.lines.length} lines</span>
                <span className="ios-tools-tag">{analysis.totalSyllables} syllables</span>
                <span className="ios-tools-tag">avg {analysis.avgSyllables}</span>
              </div>
              <ToolCallout>{analysis.structureHint}</ToolCallout>
              {analysis.rhymeGroups.length > 0 && (
                <div className="ios-tools-rhyme-groups">
                  {analysis.rhymeGroups.slice(0, 6).map((g) => (
                    <div key={g.key} className="ios-tools-rhyme-group">
                      <span className="ios-tools-rhyme-key">·{g.key}·</span>
                      <span className="text-xs text-muted">lines {g.lines.join(', ')}</span>
                    </div>
                  ))}
                </div>
              )}
              <ul className="ios-tools-line-list">
                {analysis.lines.map((l) => (
                  <li key={l.lineNumber} className="ios-tools-line-item">
                    <span className="ios-tools-line-meta">
                      L{l.lineNumber} · {l.syllables}syl
                    </span>
                    <span className="ios-tools-line-text">{l.text}</span>
                    {l.endWord && (
                      <span className="ios-tools-line-end">/{l.endWord}/</span>
                    )}
                  </li>
                ))}
              </ul>
              <CopyOutput value={exportText} label="Copy analysis" className="mt-4" />
              <ToolDropCta
                toolName="Lyrics Lab"
                detail={`${analysis.lines.length} lines · ${analysis.structureHint}`}
              />
            </>
          ) : (
            <div className="ios-tools-empty">
              <div className="ios-tools-empty-icon">✎</div>
              Paste lyrics to count syllables and find rhymes
            </div>
          )
        }
      />
    </ToolShell>
  )
}
