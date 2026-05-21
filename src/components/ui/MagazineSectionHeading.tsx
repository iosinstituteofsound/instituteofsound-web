interface MagazineSectionHeadingProps {
  kicker: string
  title: string
  subtitle?: string
  variant?: 'rolling-stone' | 'metal-hammer'
}

export function MagazineSectionHeading({
  kicker,
  title,
  subtitle,
  variant = 'rolling-stone',
}: MagazineSectionHeadingProps) {
  const isMH = variant === 'metal-hammer'

  return (
    <header className="mb-10 md:mb-12">
      <div className={isMH ? 'mh-rule mb-4' : 'magazine-rule mb-4'} />
      <p
        className={`text-[11px] tracking-[0.25em] uppercase font-semibold ${
          isMH ? 'text-mh-red' : 'text-rs-red'
        }`}
      >
        {kicker}
      </p>
      <h2
        className={`mt-2 leading-[0.95] tracking-tight ${
          isMH
            ? 'font-display text-4xl md:text-6xl font-extrabold uppercase'
            : 'font-serif text-4xl md:text-5xl lg:text-6xl font-bold'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted mt-3 max-w-2xl text-base md:text-lg">{subtitle}</p>
      )}
    </header>
  )
}
