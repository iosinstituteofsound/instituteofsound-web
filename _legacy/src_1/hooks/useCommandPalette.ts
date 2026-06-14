import { useEffect } from 'react'
import { useShell } from '@/context/ShellContext'

export function useCommandPalette() {
  const { openCommand, closeCommand, toggleCommand, commandOpen } = useShell()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggleCommand()
      }
      if (e.key === 'Escape') closeCommand()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggleCommand, closeCommand])

  return { commandOpen, openCommand, closeCommand, toggleCommand }
}
