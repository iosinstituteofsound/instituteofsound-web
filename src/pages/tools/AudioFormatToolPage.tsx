import { useState } from 'react'
import clsx from 'clsx'
import { AudioFileUpload } from '@/components/tools/AudioFileUpload'
import { CopyOutput } from '@/components/tools/CopyOutput'
import { ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import {
  analyzeAudioFormat,
  audioFormatVerdict,
  formatAudioFormatExport,
  type AudioFormatReport,
} from '@/lib/tools/audioFormat'

export default function AudioFormatToolPage() {
  const [report, setReport] = useState<AudioFormatReport | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const scan = async (file: File) => {
    setBusy(true)
    setError('')
    try {
      setReport(await analyzeAudioFormat(file))
    } catch {
      setError('Could not read this file. Try WAV, MP3, or FLAC.')
      setReport(null)
    } finally {
      setBusy(false)
    }
  }

  const verdict = report ? audioFormatVerdict(report) : null
  const exportText = report ? formatAudioFormatExport(report) : ''

  return (
    <ToolShell
      toolId="audio-format"
      title="Sample Rate & Bit Depth Checker"
      subtitle="Inspect sample rate, channels, duration, and WAV bit depth — file stays local."
    >
      <ToolWorkspace
        outputLabel="Format report"
        controls={
          <div className="ios-tools-fields">
            <AudioFileUpload onFile={(f) => void scan(f)} busy={busy} label="Upload bounce or master" />
            {error && <p className="text-sm text-mh-red">{error}</p>}
          </div>
        }
        output={
          report && verdict ? (
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
              <dl className="ios-tools-format-dl">
                <div>
                  <dt>Sample rate</dt>
                  <dd>{report.sampleRate} Hz</dd>
                </div>
                <div>
                  <dt>Channels</dt>
                  <dd>{report.channelLabel}</dd>
                </div>
                <div>
                  <dt>Bit depth</dt>
                  <dd>{report.bitDepth != null ? `${report.bitDepth}-bit` : '—'}</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{report.durationLabel}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>.{report.extension}</dd>
                </div>
              </dl>
              <p className="text-xs text-muted mt-3">{report.bitDepthNote}</p>
              <CopyOutput value={exportText} label="Copy format report" className="mt-4" />
            </>
          ) : (
            <div className="ios-tools-empty">
              <div className="ios-tools-empty-icon">◎</div>
              Upload audio to inspect format
            </div>
          )
        }
      />
    </ToolShell>
  )
}
