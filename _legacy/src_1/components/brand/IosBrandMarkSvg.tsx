import clsx from 'clsx'

type Props = {
  className?: string
  /** ~25% faster loops — loader / hero */
  animated?: boolean
}

/** Burning wordmark — layered fire animates inside the logo silhouette only. */
export function IosBrandMarkSvg({ className, animated = false }: Props) {
  return (
    <span
      role="img"
      aria-label="Institute of Sound"
      className={clsx('ios-brand-mark__burn', animated && 'ios-brand-mark__burn--intense', className)}
    >
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-base" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-smolder" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-coal-core" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-magma-vein" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-molten-pool" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-lava" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-plasma-thread" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-ember" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-heat-shimmer" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-spark-rise" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-crackle" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-flare" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-chroma" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-rainbow" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-prism" aria-hidden="true" />
      <span className="ios-brand-mark__burn-layer ios-brand-mark__burn-fusion-pulse" aria-hidden="true" />
    </span>
  )
}
