import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { IosBrandLockup } from '@/components/layout/IosBrandLockup'

const STORAGE_KEY = 'ios_manifesto_ack'

const MANIFESTO = {
  kicker: 'Transmission 001',
  headline: 'The tragedy of the Indian music industry',
  lead: 'is not the lack of talent — it is the existence of gatekeepers who deliberately choose comfort over greatness.',
  sections: [
    {
      emphasis: false,
      text: 'Some of the biggest labels in the country parade themselves as visionaries while continuously pushing disposable noise, recycled formulas, and manufactured faces, pretending it represents the future of music. Meanwhile, artists with real emotion, originality, pain, poetry, and identity are left unheard because they do not fit the industry’s safe little machine.',
    },
    {
      emphasis: false,
      text: 'And then come the media corporations and curators — people who no longer shape culture, but chase it like cowards. Instead of discovering revolutionary voices, they wait for algorithms to decide what is “trending,” then aggressively force the same shallow sound into every ear until mediocrity becomes normal.',
    },
    {
      emphasis: true,
      text: 'A generation full of extraordinary artists is being buried under corporate politics, artificial hype, playlist manipulation, and branding games. The saddest part is that many of the people running these systems still dare to call themselves pioneers.',
    },
    {
      emphasis: false,
      text: 'If an industry loses the ability to recognize truth, originality, and artistic soul, then no amount of awards, charts, PR campaigns, or billion-view numbers can hide its creative bankruptcy.',
    },
  ],
  epilogue: 'History never remembers the gatekeepers. It remembers the artists they tried to silence.',
}

function shouldShowOnPath(pathname: string) {
  if (pathname.startsWith('/desk')) return false
  if (pathname.startsWith('/editor/join')) return false
  if (pathname.startsWith('/editor/login')) return false
  if (pathname.startsWith('/editor/apply')) return false
  if (pathname.startsWith('/tools')) return false
  if (pathname.startsWith('/auth')) return false
  if (pathname.startsWith('/dashboard')) return false
  return true
}

export function ManifestoGateModal() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!shouldShowOnPath(pathname)) return
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    } catch {
      /* private mode */
    }
    const t = window.setTimeout(() => setOpen(true), 600)
    return () => window.clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const dismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="ios-manifesto-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manifesto-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="ios-manifesto-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            aria-hidden
          />

          <motion.article
            className="ios-manifesto-panel"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="ios-manifesto-close"
              onClick={dismiss}
              aria-label="Close message"
            >
              <span className="ios-manifesto-close-icon" aria-hidden>
                ×
              </span>
              Close
            </button>

            <div className="ios-manifesto-accent-bar" aria-hidden />

            <header className="ios-manifesto-header">
              <IosBrandLockup to="/" size="sm" className="mb-5" onClick={dismiss} />
              <p className="ios-manifesto-kicker">{MANIFESTO.kicker}</p>
              <h2 id="manifesto-title" className="ios-manifesto-headline">
                {MANIFESTO.headline}
              </h2>
              <p className="ios-manifesto-lead">{MANIFESTO.lead}</p>
            </header>

            <div className="ios-manifesto-body">
              {MANIFESTO.sections.map((block, i) => (
                <p
                  key={i}
                  className={block.emphasis ? 'ios-manifesto-p ios-manifesto-p-emphasis' : 'ios-manifesto-p'}
                >
                  {block.text}
                </p>
              ))}
            </div>

            <blockquote className="ios-manifesto-epilogue">
              <span className="ios-manifesto-epilogue-mark" aria-hidden>
                —
              </span>
              {MANIFESTO.epilogue}
            </blockquote>

            <footer className="ios-manifesto-footer">
              <Button type="button" variant="primary" onClick={dismiss} className="w-full sm:w-auto">
                Enter Institute of Sound
              </Button>
              <p className="ios-manifesto-footnote">
                Institute of Sound exists for artists the machine refuses to hear.
              </p>
            </footer>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
