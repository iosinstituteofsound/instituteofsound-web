import { useMemo, useState } from 'react'
import {
  ToolCallout,
  ToolPipeline,
  ToolPipelineStep,
  ToolShell,
  ToolWorkspace,
} from '@/components/tools/ToolShell'
import { CopyOutput } from '@/components/tools/CopyOutput'
import { ToolSelectField } from '@/components/tools/ToolSelectField'
import {
  buildVocalChain,
  formatVocalChainText,
  VOCAL_ENVIRONMENTS,
  VOCAL_GENRES,
  VOCAL_STYLES,
  type VocalChainInput,
  type VocalEnvironment,
  type VocalGenre,
  type VocalStyle,
} from '@/lib/tools/vocalChain'

export default function VocalChainToolPage() {
  const [input, setInput] = useState<VocalChainInput>({
    style: 'scream',
    environment: 'home_studio',
    genre: 'metal',
  })

  const { steps, environmentNote } = useMemo(() => buildVocalChain(input), [input])
  const output = useMemo(
    () => formatVocalChainText(input, steps, environmentNote),
    [input, steps, environmentNote]
  )

  return (
    <ToolShell
      toolId="vocal-chain"
      title="Vocal Chain Builder"
      subtitle="Visual signal-flow map with settings for scream, clean, rap, and more."
    >
      <ToolWorkspace
        outputLabel="Signal chain"
        controls={
          <div className="ios-tools-fields">
            <ToolSelectField
              id="style"
              label="Vocal style"
              value={input.style}
              onChange={(v) => setInput((s) => ({ ...s, style: v as VocalStyle }))}
              options={VOCAL_STYLES.map((o) => ({ value: o.id, label: o.label }))}
            />
            <ToolSelectField
              id="genre"
              label="Genre context"
              value={input.genre}
              onChange={(v) => setInput((s) => ({ ...s, genre: v as VocalGenre }))}
              options={VOCAL_GENRES.map((o) => ({ value: o.id, label: o.label }))}
            />
            <ToolSelectField
              id="env"
              label="Recording setup"
              value={input.environment}
              onChange={(v) => setInput((s) => ({ ...s, environment: v as VocalEnvironment }))}
              options={VOCAL_ENVIRONMENTS.map((o) => ({ value: o.id, label: o.label }))}
            />
          </div>
        }
        output={
          <>
            <ToolCallout>{environmentNote}</ToolCallout>
            <ToolPipeline>
              {steps.map((step) => (
                <ToolPipelineStep
                  key={step.order}
                  step={step.order}
                  title={step.name}
                  purpose={step.purpose}
                  settings={step.settings}
                  tip={step.tips}
                />
              ))}
            </ToolPipeline>
            <CopyOutput value={output} label="Copy full chain" className="mt-4" />
          </>
        }
      />
    </ToolShell>
  )
}
