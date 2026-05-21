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
    <header className="mb-10 md:mb-12 magazine-section-head">
      <div className={isMH ? 'mh-rule' : 'magazine-rule'} />
      <p className={`ios-kicker mt-4 ${isMH ? '' : 'ios-kicker-rs'}`}>{kicker}</p>
      <h2
        className={`mt-3 leading-[0.92] tracking-tight ${
          isMH
            ? 'font-display text-4xl md:text-6xl font-extrabold uppercase'
            : 'font-serif text-4xl md:text-5xl lg:text-6xl font-bold'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted mt-4 max-w-2xl text-base md:text-lg leading-relaxed">{subtitle}</p>
      )}
      <div className="transmission-line mt-6 max-w-[10rem]" />
    </header>
  )
}
