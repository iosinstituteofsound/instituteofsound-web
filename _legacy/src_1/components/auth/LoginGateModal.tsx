import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLoginGate } from '@/context/LoginGateContext'
import { useAuth } from '@/context/AuthContext'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { IosBrandLockup } from '@/components/layout/IosBrandLockup'

export function LoginGateModal() {
  const { open, closeLoginGate, hint } = useLoginGate()
  const { user } = useAuth()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLoginGate()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closeLoginGate])

  if (user) return null

  return (
    <AnimatePresence>
      {open && (
        <div
          className="login-gate-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-gate-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLoginGate()
          }}
        >
          <motion.div
            className="login-gate-panel ios-card"
            tabIndex={-1}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <IosBrandLockup size="sm" className="mb-4" to={false} />
            <p className="ios-kicker">Network access</p>
            <h2 id="login-gate-title" className="font-display text-2xl font-bold mt-2">
              Login to continue
            </h2>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              {hint ??
                'Home, Academy, and Toolkit stay open. Everything else on the wire needs your operator account.'}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <GoogleSignInButton intent="member" bare />
              <Link to="/register" className="ios-btn ios-btn-ghost w-full text-center" onClick={closeLoginGate}>
                New here? Join with Google
              </Link>
              <button type="button" className="ios-btn ios-btn-ghost w-full" onClick={closeLoginGate}>
                Not now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
