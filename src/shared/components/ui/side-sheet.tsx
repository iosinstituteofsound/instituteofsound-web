import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '@/shared/lib/cn'

interface SideSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: React.ReactNode
}

export function SideSheet({ open, onOpenChange, title, children }: SideSheetProps) {
  return (
    <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange} direction="left">
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <DrawerPrimitive.Content
          className={cn(
            'side-sheet fixed inset-y-0 left-0 z-50 flex h-full w-[min(18rem,88vw)] flex-col border-r bg-background',
          )}
        >
          {title ? (
            <div className="side-sheet__header">
              <DrawerPrimitive.Title className="side-sheet__title">{title}</DrawerPrimitive.Title>
            </div>
          ) : null}
          <div className="side-sheet__body">{children}</div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  )
}
