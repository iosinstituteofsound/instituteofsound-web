import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EDITOR_TERMS_SECTIONS } from '@/lib/editor-applications/terms'

interface EditorTermsModalProps {
  open: boolean
  onClose: () => void
}

export function EditorTermsModal({ open, onClose }: EditorTermsModalProps) {
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
          aria-labelledby="editor-terms-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/80"
            aria-label="Close terms"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-lg max-h-[85vh] flex flex-col border border-border bg-void shadow-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 shrink-0">
              <div>
                <p className="ios-kicker text-xs">Editorial desk</p>
                <h2 id="editor-terms-title" className="font-serif text-xl font-bold mt-1">
                  Terms & conditions
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="ios-btn ios-btn-ghost !text-xs shrink-0"
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 space-y-6 text-sm text-muted leading-relaxed">
              <p className="text-foreground">
                By applying to join the Institute of Sound editorial desk, you agree to the
                following. This is voluntary, unpaid work at present; compensation policies may
                change in the future with notice.
              </p>
              {EDITOR_TERMS_SECTIONS.map((section) => (
                <section key={section.title}>
                  <h3 className="text-foreground font-semibold text-xs uppercase tracking-widest mb-2">
                    {section.title}
                  </h3>
                  {section.paragraphs.map((p) => (
                    <p key={p.slice(0, 40)} className="mb-2 last:mb-0">
                      {p}
                    </p>
                  ))}
                </section>
              ))}
            </div>
            <div className="border-t border-border px-5 py-4 shrink-0">
              <button type="button" onClick={onClose} className="ios-btn ios-btn-primary w-full">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
