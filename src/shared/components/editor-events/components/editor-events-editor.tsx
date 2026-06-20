import { EditorEventsDesk } from '@/shared/components/editor-events/components/editor-events-desk'
import { useEditorEventsEditor } from '@/shared/components/editor-events/hooks/use-editor-events-editor'
import type { EditorEventsEditorProps } from '@/shared/components/editor-events/types'
import { Loader } from '@/shared/components/feedback/loader'

export function EditorEventsEditor({
  enabled = true,
  className,
  labels,
  onSaved,
  children,
}: EditorEventsEditorProps) {
  const editor = useEditorEventsEditor({ enabled, onSaved })

  if (!enabled) return null
  if (editor.isLoading) return <Loader />

  return (
    <>
      {children}
      <EditorEventsDesk
        events={editor.events}
        filter={editor.filter}
        onFilterChange={editor.setFilter}
        selectedId={editor.selectedId}
        onSelect={editor.setSelectedId}
        draft={editor.draft}
        onDraftChange={editor.setDraft}
        isCreating={editor.isCreating}
        onStartCreate={editor.startCreate}
        onSave={editor.save}
        onDelete={editor.selectedId ? editor.remove : undefined}
        isSaving={editor.isSaving}
        isDeleting={editor.isDeleting}
        className={className}
        labels={labels}
      />
    </>
  )
}
