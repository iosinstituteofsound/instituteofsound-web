/** @deprecated Use Drawer from `@/shared/components/ui/drawer` directly. */
import * as React from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/shared/components/ui/drawer'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: React.ReactNode
}

export function Sheet({ open, onOpenChange, title, children }: SheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {title && (
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
        )}
        <div className="p-4">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
