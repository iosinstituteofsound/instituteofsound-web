import { WirePicksBuilder } from '@/shared/components/wire-picks/components/wire-picks-builder'
import { useWirePicksEditor } from '@/shared/components/wire-picks/hooks/use-wire-picks-editor'
import type { WirePicksEditorProps } from '@/shared/components/wire-picks/types'
import { Loader } from '@/shared/components/feedback/loader'

export function WirePicksEditor({
  enabled = true,
  className,
  labels,
  enabledSourceTabs,
  defaultSourceTab,
  defaultSection,
  releasePageLimit,
  instanceId,
  onSaved,
  children,
}: WirePicksEditorProps) {
  const editor = useWirePicksEditor({ enabled, onSaved })

  if (!enabled) return null
  if (editor.isLoading) return <Loader />

  return (
    <>
      {children}
      <WirePicksBuilder
        items={editor.items}
        candidates={editor.candidates}
        onChange={editor.setItems}
        onSave={editor.save}
        isSaving={editor.isSaving}
        className={className}
        labels={labels}
        enabledSourceTabs={enabledSourceTabs}
        defaultSourceTab={defaultSourceTab}
        defaultSection={defaultSection}
        releasePageLimit={releasePageLimit}
        instanceId={instanceId}
      />
    </>
  )
}
