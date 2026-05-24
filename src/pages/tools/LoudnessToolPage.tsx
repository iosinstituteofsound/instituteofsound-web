import { useState } from 'react'
import clsx from 'clsx'
import { AudioFileUpload } from '@/components/tools/AudioFileUpload'
import { LevelMeterDisplay } from '@/components/tools/LevelMeterDisplay'
import { CopyOutput } from '@/components/tools/CopyOutput'
import { ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import { decodeAudioFile, formatDb } from '@/lib/tools/audio/decode'
import { analyzeLevels, loudnessVerdict, type LevelAnalysis } from '@/lib/tools/audio/levels'

export default function LoudnessToolPage() {
  const [analysis, setAnalysis] = useState<LevelAnalysis | null>(null)
  const [verdict, setVerdict] = useState<ReturnType<typeof loudnessVerdict> | null>(null)
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)

  const measure = async (file: File) => {
    setBusy(true)
    setFileName(file.name)
    try {
      const buffer = await decodeAudioFile(file)
      const result = analyzeLevels(buffer)
      setAnalysis(result)
      setVerdict(loudnessVerdict(result.rmsDb))
    } finally {
      setBusy(false)
    }
  }

  const report = analysis
    ? [
        `Loudness readout — ${fileName}`,
        `RMS: ${formatDb(analysis.rmsDb)}`,
        `Peak: ${formatDb(analysis.peakDb)}`,
        `Crest factor: ${analysis.crestDb.toFixed(1)} dB`,
        verdict?.label ?? '',
      ].join('\n')
    : ''

  return (
    <ToolShell
      toolId="loudness"
      title="Loudness Meter"
      subtitle="RMS level, crest factor, and mix loudness guidance — no upload leaves your browser."
    >
      <ToolWorkspace
        outputLabel="Level meter"
        controls={
          <div className="ios-tools-fields">
            <AudioFileUpload onFile={(f) => void measure(f)} busy={busy} label="Upload track to measure" />
          </div>
        }
        output={
          analysis && verdict ? (
            <>
              <div
                className={clsx(
                  'ios-tools-verdict',
                  verdict.tone === 'hot' && 'ios-tools-verdict-hot',
                  verdict.tone === 'warn' && 'ios-tools-verdict-warn',
                  verdict.tone === 'ok' && 'ios-tools-verdict-ok'
                )}
              >
                {verdict.label}
              </div>
              <LevelMeterDisplay analysis={analysis} mode="loudness" />
              <CopyOutput value={report} label="Copy loudness report" className="mt-4" />
            </>
          ) : (
            <div className="ios-tools-empty">
              <div className="ios-tools-empty-icon">◉</div>
              Upload audio to measure loudness
            </div>
          )
        }
      />
    </ToolShell>
  )
}
