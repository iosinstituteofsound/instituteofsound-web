import { UserDetailPanel } from '@/modules/users/components/user-detail-panel'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'

interface UserDetailDialogProps {
  userId: string | null
  userName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailDialog({ userId, userName, open, onOpenChange }: UserDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{userName ? `${userName} — Details` : 'User Details'}</DialogTitle>
        </DialogHeader>
        {userId ? <UserDetailPanel userId={userId} /> : null}
      </DialogContent>
    </Dialog>
  )
}
