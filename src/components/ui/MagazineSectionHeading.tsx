import clsx from 'clsx'

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
    <header className={clsx('mb-10 md:mb-12 metal-section-header', isMH && 'metal-section-header-mh')}>
      <div className="metal-rule-stack">
        <span style={{ background: isMH ? 'var(--color-mh-red)' : 'var(--color-rs-red)' }} />
        <span />
        <span />
      </div>
      <p
        className={clsx(
          'metal-kicker',
          isMH ? 'text-mh-red' : 'text-rs-red'
        )}
      >
        {kicker}
      </p>
      <h2
        className={clsx(
          'mt-2 leading-[0.92] tracking-tight text-signal',
          isMH
            ? 'font-metal text-4xl md:text-6xl lg:text-7xl'
            : 'font-serif text-4xl md:text-5xl lg:text-6xl font-bold'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted mt-3 max-w-2xl text-base md:text-lg leading-relaxed">{subtitle}</p>
      )}
      <div className="transmission-line mt-6 max-w-xs" />
    </header>
  )
}
