import { motion } from 'framer-motion'

interface SectionHeadingProps {
  label: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`mb-16 ${align === 'center' ? 'text-center' : ''}`}
    >
      <span className="text-xs tracking-[0.3em] text-neon uppercase font-medium">
        {label}
      </span>
      <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mt-3 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted mt-4 max-w-xl text-lg">{subtitle}</p>
      )}
      <div className="transmission-line mt-8 max-w-xs" />
    </motion.div>
  )
}
