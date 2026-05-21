import type { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { getPerformanceProfile } from '@/lib/performance'

type RevealProps = HTMLMotionProps<'div'> & {
  children: ReactNode
  className?: string
  delay?: number
}

/** Framer reveal on desktop; static render on low-end (no layout thrash) */
export function Reveal({ children, className, delay = 0, ...rest }: RevealProps) {
  if (getPerformanceProfile() === 'lite') {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
