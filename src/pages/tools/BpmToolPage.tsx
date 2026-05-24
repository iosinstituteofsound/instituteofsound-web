import { useState } from 'react'
import { AudioFileUpload } from '@/components/tools/AudioFileUpload'
import { BpmGauge } from '@/components/tools/BpmGauge'
import { ToolCallout, ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import { detectBpmFromBuffer } from '@/lib/tools/audio/bpm'
import { decodeAudioFile } from '@/lib/tools/audio/decode'

export default function BpmToolPage() {
  const [busy, setBusy] = useState(false)
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<ReturnType<typeof detectBpmFromBuffer> | null>(null)
  const [error, setError] = useState('')

  const analyze = async (file: File) => {
    setBusy(true)
    setError('')
    setFileName(file.name)
    try {
      const buffer = await decodeAudioFile(file)
      setResult(detectBpmFromBuffer(buffer))
    } catch {
      setError('Could not decode this file. Try WAV or MP3.')
      setResult(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolShell
      toolId="bpm"
      title="BPM Finder"
      subtitle="Detect approximate tempo from uploaded audio — best on drum-heavy sections."
    >
      <ToolWorkspace
        outputLabel="Tempo readout"
        controls={
          <div className="ios-tools-fields">
            <AudioFileUpload onFile={(f) => void analyze(f)} busy={busy} />
            {fileName && (
              <p className="text-xs text-muted font-mono truncate">Loaded: {fileName}</p>
            )}
            {error && <p className="text-sm text-mh-red">{error}</p>}
            <ToolCallout>
              Tip: Use a 30–60 second clip with a clear kick or snare. For live accuracy, pair with
              Tap Tempo (TLS-07).
            </ToolCallout>
          </div>
        }
        output={
          result ? (
            <>
              <BpmGauge bpm={result.bpm} confidence={result.confidence} />
              <ToolCallout>{result.message}</ToolCallout>
            </>
          ) : (
            <div className="ios-tools-empty">
              <div className="ios-tools-empty-icon">♩</div>
              Upload audio to analyze BPM
            </div>
          )
        }
      />
    </ToolShell>
  )
}
