import { useMemo, useState } from 'react'
import { CopyOutput } from '@/components/tools/CopyOutput'
import { ToolNumberField } from '@/components/tools/ToolSelectField'
import { ToolActionButton, ToolCallout, ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import {
  calculateSetlist,
  createSongId,
  formatSetlistExport,
  type SetlistSong,
} from '@/lib/tools/setlist'

function emptySong(): SetlistSong {
  return { id: createSongId(), title: '', minutes: 4, seconds: 0 }
}

export default function SetlistToolPage() {
  const [songs, setSongs] = useState<SetlistSong[]>([
    { id: createSongId(), title: 'Opener', minutes: 4, seconds: 30 },
    { id: createSongId(), title: 'Single', minutes: 3, seconds: 45 },
    { id: createSongId(), title: 'Closer', minutes: 5, seconds: 0 },
  ])
  const [encoreMin, setEncoreMin] = useState(5)
  const [breakMin, setBreakMin] = useState(10)

  const result = useMemo(
    () => calculateSetlist(songs, encoreMin, breakMin),
    [songs, encoreMin, breakMin]
  )
  const exportText = useMemo(() => formatSetlistExport(result), [result])

  const updateSong = (id: string, patch: Partial<SetlistSong>) => {
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  return (
    <ToolShell
      toolId="setlist"
      title="Setlist Calculator"
      subtitle="Add songs, encore buffer, and changeover time — see total stage minutes."
    >
      <ToolWorkspace
        outputLabel="Set timing"
        controls={
          <div className="ios-tools-fields">
            <div className="ios-tools-setlist-rows">
              {songs.map((song, i) => (
                <div key={song.id} className="ios-tools-setlist-row">
                  <span className="ios-tools-setlist-num">{i + 1}</span>
                  <input
                    type="text"
                    value={song.title}
                    onChange={(e) => updateSong(song.id, { title: e.target.value })}
                    placeholder="Song title"
                    className="ios-input flex-1 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={song.minutes}
                    onChange={(e) => updateSong(song.id, { minutes: Number(e.target.value) || 0 })}
                    className="ios-input w-14 text-sm"
                    aria-label="Minutes"
                  />
                  <span className="text-muted text-xs">m</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={song.seconds}
                    onChange={(e) => updateSong(song.id, { seconds: Number(e.target.value) || 0 })}
                    className="ios-input w-14 text-sm"
                    aria-label="Seconds"
                  />
                  <span className="text-muted text-xs">s</span>
                  <button
                    type="button"
                    className="ios-tools-row-remove"
                    onClick={() => setSongs((prev) => prev.filter((s) => s.id !== song.id))}
                    aria-label="Remove song"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <ToolActionButton onClick={() => setSongs((prev) => [...prev, emptySong()])}>
              Add song
            </ToolActionButton>
            <ToolNumberField
              id="encore"
              label="Encore buffer (minutes)"
              min={0}
              max={120}
              value={encoreMin}
              onChange={setEncoreMin}
            />
            <ToolNumberField
              id="breaks"
              label="Breaks / changeover (minutes)"
              min={0}
              max={120}
              value={breakMin}
              onChange={setBreakMin}
            />
          </div>
        }
        output={
          <>
            <div className="ios-tools-setlist-totals">
              <div className="ios-tools-setlist-total-card">
                <span className="ios-tools-setlist-total-k">Set</span>
                <span className="ios-tools-setlist-total-v">{result.formatted.set}</span>
              </div>
              <div className="ios-tools-setlist-total-card">
                <span className="ios-tools-setlist-total-k">+ Encore</span>
                <span className="ios-tools-setlist-total-v">{result.formatted.encore}</span>
              </div>
              <div className="ios-tools-setlist-total-card">
                <span className="ios-tools-setlist-total-k">+ Breaks</span>
                <span className="ios-tools-setlist-total-v">{result.formatted.breaks}</span>
              </div>
              <div className="ios-tools-setlist-total-card ios-tools-setlist-total-card-main">
                <span className="ios-tools-setlist-total-k">Total</span>
                <span className="ios-tools-setlist-total-v">{result.formatted.total}</span>
              </div>
            </div>
            <ToolCallout>
              {result.songCount} songs · {result.formatted.set} of music before buffers.
            </ToolCallout>
            <CopyOutput value={exportText} label="Copy setlist" className="mt-4" />
          </>
        }
      />
    </ToolShell>
  )
}
