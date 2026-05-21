import { Link } from 'react-router-dom'
import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type MetalButtonVariant = 'primary' | 'ghost' | 'outline' | 'rs'

const variantClass: Record<MetalButtonVariant, string> = {
  primary: 'metal-btn metal-btn-primary',
  ghost: 'metal-btn metal-btn-ghost',
  outline: 'metal-btn metal-btn-outline',
  rs: 'metal-btn metal-btn-rs',
}

interface MetalButtonBaseProps {
  children: ReactNode
  variant?: MetalButtonVariant
  className?: string
}

type MetalButtonAsButton = MetalButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: never }

type MetalButtonAsLink = MetalButtonBaseProps & {
  to: string
  onClick?: () => void
}

export function MetalButton({
  children,
  variant = 'primary',
  className,
  ...props
}: MetalButtonAsButton | MetalButtonAsLink) {
  const classes = clsx(variantClass[variant], className)

  if ('to' in props && props.to) {
    const { to, onClick } = props
    return (
      <Link to={to} className={classes} onClick={onClick}>
        <span className="metal-btn-inner">{children}</span>
      </Link>
    )
  }

  const { type = 'button', ...buttonProps } = props as MetalButtonAsButton
  return (
    <button type={type} className={classes} {...buttonProps}>
      <span className="metal-btn-inner">{children}</span>
    </button>
  )
}
