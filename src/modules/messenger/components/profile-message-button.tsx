import { MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/app/stores/auth-store'
import { openMessengerPopup } from '@/modules/messenger/lib/messenger-popup-open'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

type ProfileMessageButtonProps = {
  userId: string
  className?: string
}

export function ProfileMessageButton({ userId, className }: ProfileMessageButtonProps) {
  const viewerId = useAuthStore((s) => s.userId)
  if (!viewerId || viewerId === userId) return null

  return (
    <Button
      type="button"
      size="sm"
      className={cn(
        'h-9 rounded-lg border border-white/20 bg-white/12 px-4 text-[13px] font-semibold text-white shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/20',
        className,
      )}
      onClick={() => void openMessengerPopup({ userId })}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      Message
    </Button>
  )
}
