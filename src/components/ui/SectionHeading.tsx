import { Reveal } from '@/components/ui/Reveal'

interface SectionHeadingProps {
  label: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  /** Page-level title — use h1 once per route for SEO hierarchy. */
  titleAs?: 'h1' | 'h2'
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = 'left',
  titleAs = 'h2',
}: SectionHeadingProps) {
  const TitleTag = titleAs
  return (
    <Reveal className={`mb-16 magazine-section-head ${align === 'center' ? 'text-center' : ''}`}>
      <span className="ios-kicker">{label}</span>
      <TitleTag className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold mt-4 tracking-tight uppercase">
        {title}
      </TitleTag>
      {subtitle && (
        <p className={`text-muted mt-4 text-lg max-w-xl ${align === 'center' ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
      <div className={`transmission-line mt-8 ${align === 'center' ? 'mx-auto' : ''}`} />
    </Reveal>
  )
}
