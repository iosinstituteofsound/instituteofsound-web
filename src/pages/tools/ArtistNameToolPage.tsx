import { useState } from 'react'
import { ToolActionButton, ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import { CopyOutput } from '@/components/tools/CopyOutput'
import { generateArtistNames } from '@/lib/tools/artistName'

export default function ArtistNameToolPage() {
  const [names, setNames] = useState<string[]>(() => generateArtistNames(12))

  const regenerate = () => setNames(generateArtistNames(12))
  const output = names.map((n, i) => `${i + 1}. ${n}`).join('\n')

  return (
    <ToolShell
      toolId="artist-name"
      title="Artist Name Generator"
      subtitle="Curated underground word banks — roll fresh names instantly."
    >
      <ToolWorkspace
        outputLabel="Name deck"
        controls={
          <div className="ios-tools-fields">
            <p className="text-sm text-muted leading-relaxed">
              Each roll pulls from gothic, industrial, and archival word banks. No AI — unlimited
              refreshes.
            </p>
            <ToolActionButton onClick={regenerate}>Roll 12 new names</ToolActionButton>
          </div>
        }
        output={
          <>
            <div className="ios-tools-name-grid">
              {names.map((name, i) => (
                <div key={name} className="ios-tools-name-card">
                  <span className="ios-tools-name-card-num">{String(i + 1).padStart(2, '0')}</span>
                  {name}
                </div>
              ))}
            </div>
            <CopyOutput value={output} label="Copy all names" />
          </>
        }
      />
    </ToolShell>
  )
}
