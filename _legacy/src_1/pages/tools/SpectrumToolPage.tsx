import { useState } from 'react'
import { AudioFileUpload } from '@/components/tools/AudioFileUpload'
import { SpectrumCanvas } from '@/components/tools/SpectrumCanvas'
import { ToolActionButton, ToolCallout, ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import { decodeAudioFile } from '@/lib/tools/audio/decode'
import {
  computeSpectrumBands,
  dominantBandLabel,
  type SpectrumBand,
} from '@/lib/tools/audio/spectrum'
import { useMicAnalyser } from '@/hooks/useAudioTools'

type Mode = 'mic' | 'file'

export default function SpectrumToolPage() {
  const [mode, setMode] = useState<Mode>('mic')
  const [bands, setBands] = useState<SpectrumBand[] | null>(null)
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const mic = useMicAnalyser(mode === 'mic')

  const analyzeFile = async (file: File) => {
    setBusy(true)
    setMode('file')
    setFileName(file.name)
    try {
      const buffer = await decodeAudioFile(file)
      setBands(computeSpectrumBands(buffer))
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolShell
      toolId="spectrum"
      title="Frequency Analyzer"
      subtitle="Live mic spectrum or uploaded file breakdown — sub to air bands."
    >
      <ToolWorkspace
        outputLabel="Spectrum"
        controls={
          <div className="ios-tools-fields">
            <div className="ios-tools-mode-toggle">
              <ToolActionButton
                variant={mode === 'mic' ? 'primary' : 'ghost'}
                onClick={() => {
                  setMode('mic')
                  setBands(null)
                }}
              >
                Live mic
              </ToolActionButton>
              <ToolActionButton variant={mode === 'file' ? 'primary' : 'ghost'} onClick={() => setMode('file')}>
                Upload file
              </ToolActionButton>
            </div>
            {mode === 'file' && (
              <AudioFileUpload onFile={(f) => void analyzeFile(f)} busy={busy} label="Upload for band analysis" />
            )}
            {mode === 'mic' && mic.error && <p className="text-sm text-mh-red">{mic.error}</p>}
            {mode === 'mic' && !mic.error && (
              <ToolCallout>Allow microphone access — spectrum updates in real time.</ToolCallout>
            )}
            {fileName && mode === 'file' && (
              <p className="text-xs text-muted font-mono truncate">Analyzed: {fileName}</p>
            )}
          </div>
        }
        output={
          <>
            <SpectrumCanvas
              active
              analyser={mode === 'mic' && mic.ready ? mic.analyserRef.current : null}
              bands={mode === 'file' ? bands ?? undefined : undefined}
            />
            {bands && mode === 'file' && (
              <ToolCallout>Dominant energy: {dominantBandLabel(bands)} band</ToolCallout>
            )}
            {mode === 'mic' && mic.ready && (
              <ToolCallout>Live input — move mic near source for best readout.</ToolCallout>
            )}
          </>
        }
      />
    </ToolShell>
  )
}
