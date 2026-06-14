import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { hasEditorialAccess } from '@/lib/auth/roles'
import {
  acknowledgeEditorCongratulations,
  getMyEditorApplication,
} from '@/lib/editor-applications/service'
import { EditorCongratulationsModal } from './EditorCongratulationsModal'

export function EditorCongratsGate() {
  const { user, refreshUser } = useAuth()
  const [open, setOpen] = useState(false)

  const check = useCallback(async () => {
    if (!user || !hasEditorialAccess(user.authorization)) return
    try {
      const app = await getMyEditorApplication(user.id)
      if (app?.status === 'approved' && app.congratsPending) {
        await refreshUser()
        setOpen(true)
      }
    } catch {
      /* ignore */
    }
  }, [user, refreshUser])

  useEffect(() => {
    void check()
  }, [check])

  const handleClose = async () => {
    setOpen(false)
    if (!user) return
    try {
      await acknowledgeEditorCongratulations(user.id)
      await refreshUser()
    } catch {
      /* ignore */
    }
  }

  return <EditorCongratulationsModal open={open} onClose={() => void handleClose()} />
}
