import { useMemo, useState } from 'react'
import { BpmGauge, TapPad } from '@/components/tools/BpmGauge'
import {
  ToolActionButton,
  ToolCallout,
  ToolShell,
  ToolWorkspace,
} from '@/components/tools/ToolShell'
import { ToolNumberField } from '@/components/tools/ToolSelectField'
import { useMetronome, useTapTempo } from '@/hooks/useAudioTools'

export default function TapTempoToolPage() {
  const { bpm: tappedBpm, tap, reset, tapCount } = useTapTempo()
  const [manualBpm, setManualBpm] = useState(120)
  const activeBpm = tappedBpm ?? manualBpm
  const metronome = useMetronome(activeBpm)

  const status = useMemo(() => {
    if (tappedBpm) return `Locked from ${tapCount} taps`
    return 'Tap at least 2 beats or set BPM manually'
  }, [tappedBpm, tapCount])

  return (
    <ToolShell
      toolId="tap-tempo"
      title="Tap Tempo & Metronome"
      subtitle="Tap the pulse, lock BPM, and practice with a studio click."
    >
      <ToolWorkspace
        outputLabel="Metronome"
        controls={
          <div className="ios-tools-fields">
            <TapPad onTap={tap} tapCount={tapCount} />
            <ToolNumberField
              id="manual-bpm"
              label="Manual BPM"
              min={30}
              max={300}
              value={manualBpm}
              onChange={setManualBpm}
            />
            <div className="flex gap-2">
              <ToolActionButton onClick={metronome.toggle}>
                {metronome.playing ? 'Stop click' : 'Start click'}
              </ToolActionButton>
              <ToolActionButton variant="ghost" onClick={reset}>
                Reset taps
              </ToolActionButton>
            </div>
            <ToolCallout>{status}</ToolCallout>
          </div>
        }
        output={
          <>
            <BpmGauge bpm={activeBpm} label={tappedBpm ? 'Tapped tempo' : 'Current BPM'} />
            <div className="ios-tools-metronome-visual" data-playing={metronome.playing || undefined}>
              <span className="ios-tools-metronome-pulse" />
              <p className="text-xs text-muted text-center mt-4 uppercase tracking-widest">
                {metronome.playing ? 'Click running' : 'Click stopped'}
              </p>
            </div>
          </>
        }
      />
    </ToolShell>
  )
}
