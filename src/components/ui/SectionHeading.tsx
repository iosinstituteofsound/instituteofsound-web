import { Reveal } from '@/components/ui/Reveal'

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
    <Reveal className={`mb-16 metal-section-header ${align === 'center' ? 'text-center' : ''}`}>
      <div className={`metal-rule-stack ${align === 'center' ? 'mx-auto items-center' : ''}`}>
        <span />
        <span />
        <span />
      </div>
      <span className="metal-kicker">{label}</span>
      <h2 className="metal-title-display text-signal mt-3">{title}</h2>
      {subtitle && (
        <p className="text-muted mt-4 max-w-xl text-lg leading-relaxed">{subtitle}</p>
      )}
      <div className={`transmission-line mt-8 ${align === 'center' ? 'mx-auto' : ''}`} />
    </Reveal>
  )
}
