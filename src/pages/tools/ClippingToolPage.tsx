import { useState } from 'react'
import clsx from 'clsx'
import { AudioFileUpload } from '@/components/tools/AudioFileUpload'
import { LevelMeterDisplay } from '@/components/tools/LevelMeterDisplay'
import { CopyOutput } from '@/components/tools/CopyOutput'
import { ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import { decodeAudioFile, formatDb } from '@/lib/tools/audio/decode'
import { analyzeLevels, clipVerdict, type LevelAnalysis } from '@/lib/tools/audio/levels'

export default function ClippingToolPage() {
  const [analysis, setAnalysis] = useState<LevelAnalysis | null>(null)
  const [verdict, setVerdict] = useState<ReturnType<typeof clipVerdict> | null>(null)
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)

  const scan = async (file: File) => {
    setBusy(true)
    setFileName(file.name)
    try {
      const buffer = await decodeAudioFile(file)
      const result = analyzeLevels(buffer)
      setAnalysis(result)
      setVerdict(clipVerdict(result))
    } finally {
      setBusy(false)
    }
  }

  const report = analysis
    ? [
        `Clip scan — ${fileName}`,
        `Peak: ${formatDb(analysis.peakDb)}`,
        `Clipped samples: ${analysis.clipCount} (${analysis.clipPercent.toFixed(4)}%)`,
        `Headroom: ${analysis.headroomDb.toFixed(1)} dB`,
        verdict?.label ?? '',
      ].join('\n')
    : ''

  return (
    <ToolShell
      toolId="clipping"
      title="Clip Detector"
      subtitle="Scan masters and bounces for digital clipping before you release."
    >
      <ToolWorkspace
        outputLabel="Clip scan"
        controls={
          <div className="ios-tools-fields">
            <AudioFileUpload onFile={(f) => void scan(f)} busy={busy} label="Upload mix or master" />
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
              <LevelMeterDisplay analysis={analysis} mode="clip" />
              <CopyOutput value={report} label="Copy scan report" className="mt-4" />
            </>
          ) : (
            <div className="ios-tools-empty">
              <div className="ios-tools-empty-icon">⚠</div>
              Upload audio to scan for clipping
            </div>
          )
        }
      />
    </ToolShell>
  )
}
