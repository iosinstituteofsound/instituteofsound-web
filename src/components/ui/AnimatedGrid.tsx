import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AnimatedGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

const colClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function AnimatedGrid({
  children,
  columns = 3,
  className = '',
}: AnimatedGridProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className={`grid gap-6 md:gap-8 ${colClasses[columns]} ${className}`}
    >
      {children}
    </motion.div>
  )
}

export const gridItemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
}
