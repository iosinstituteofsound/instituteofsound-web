import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useCreateTicket } from '@/modules/support/hooks/use-create-ticket'
import { buildWebDiagnostics } from '@/modules/support/lib/web-diagnostics'
import {
  SAFETY_CATEGORIES,
  SAFETY_CATEGORY_LABELS,
  type SafetyCategory,
  type TicketTarget,
} from '@/modules/support/types/support.types'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'

type ReportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: TicketTarget
  subject: string
  diagnosticsRoute?: string
}

export function ReportDialog({
  open,
  onOpenChange,
  target,
  subject,
  diagnosticsRoute,
}: ReportDialogProps) {
  const createTicket = useCreateTicket()
  const [category, setCategory] = useState<SafetyCategory>('spam')
  const [body, setBody] = useState('')

  useEffect(() => {
    if (!open) return
    setCategory('spam')
    setBody('')
  }, [open])

  const canSubmit = body.trim().length >= 10

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit || createTicket.isPending) return

    createTicket.mutate(
      {
        kind: 'safety',
        category,
        subject,
        body: body.trim(),
        target,
        diagnostics: buildWebDiagnostics(
          diagnosticsRoute ? { route: diagnosticsRoute } : undefined,
        ),
      },
      {
        onSuccess: () => {
          toast.success('Report submitted. Thanks for helping keep the community safe.')
          onOpenChange(false)
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : 'Could not submit report. Try again.'
          toast.error(message)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Report</DialogTitle>
            <DialogDescription>
              We review safety reports carefully. The person you report will not see who submitted
              this.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              {target.type} · {target.id}
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <div className="flex flex-wrap gap-2">
                {SAFETY_CATEGORIES.map((id) => {
                  const selected = id === category
                  return (
                    <button
                      key={id}
                      type="button"
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-transparent text-foreground hover:bg-muted',
                      )}
                      onClick={() => setCategory(id)}
                    >
                      {SAFETY_CATEGORY_LABELS[id]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-details">Details</Label>
              <Textarea
                id="report-details"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Describe what happened and why it violates community standards."
                rows={5}
                maxLength={8000}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createTicket.isPending}>
              {createTicket.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit report'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
