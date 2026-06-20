import { EditorSubmissionsDesk } from '@/shared/components/editor-submissions/components/editor-submissions-desk'
import { useEditorSubmissionsEditor } from '@/shared/components/editor-submissions/hooks/use-editor-submissions-editor'
import type { EditorSubmissionsEditorProps } from '@/shared/components/editor-submissions/types'
import { Loader } from '@/shared/components/feedback/loader'

export function EditorSubmissionsEditor({
  enabled = true,
  className,
  labels,
  enabledFilters,
  onReviewed,
  children,
}: EditorSubmissionsEditorProps) {
  const editor = useEditorSubmissionsEditor({ enabled, onReviewed })

  if (!enabled) return null
  if (editor.isLoading) return <Loader />

  return (
    <>
      {children}
      <EditorSubmissionsDesk
        submissions={editor.submissions}
        filter={editor.filter}
        onFilterChange={editor.setFilter}
        selectedId={editor.selectedId}
        onSelect={editor.setSelectedId}
        editorNotes={editor.editorNotes}
        onEditorNotesChange={editor.setEditorNotes}
        onReview={editor.review}
        isReviewing={editor.isReviewing}
        className={className}
        labels={labels}
        enabledFilters={enabledFilters}
      />
    </>
  )
}
