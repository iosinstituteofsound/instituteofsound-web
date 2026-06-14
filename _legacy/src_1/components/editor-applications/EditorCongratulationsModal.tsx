import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface EditorCongratulationsModalProps {
  open: boolean
  onClose: () => void
}

export function EditorCongratulationsModal({ open, onClose }: EditorCongratulationsModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-congrats-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/80"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-md border border-mh-red/40 bg-void p-6 md:p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="flex justify-end -mt-2 -mr-2 mb-2">
              <button
                type="button"
                onClick={onClose}
                className="ios-btn ios-btn-ghost !text-xs"
              >
                Close
              </button>
            </div>
            <p className="ios-kicker text-mh-red">Approved</p>
            <h2 id="editor-congrats-title" className="font-serif text-2xl md:text-3xl font-bold mt-2">
              Welcome to the editorial desk
            </h2>
            <p className="text-muted text-sm mt-4 leading-relaxed">
              Your application has been approved. You now have editor access — review submissions,
              write features and reviews, and help shape underground coverage on Institute of Sound.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                to="/editor/dashboard"
                onClick={onClose}
                className="ios-btn ios-btn-primary text-center flex-1"
              >
                Open editorial desk
              </Link>
              <button type="button" onClick={onClose} className="ios-btn ios-btn-ghost flex-1">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
