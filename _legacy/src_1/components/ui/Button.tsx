import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'metal'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
  className?: string
  to?: string
  href?: string
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'ios-btn ios-btn-primary',
  secondary: 'ios-btn ios-btn-secondary',
  ghost: 'ios-btn ios-btn-ghost',
  metal: 'ios-btn ios-btn-metal',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className, children, to, href, type = 'button', ...props },
  ref
) {
  const cn = clsx(variantClass[variant], className)

  if (to) {
    return (
      <Link to={to} className={cn}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={cn}>
        {children}
      </a>
    )
  }

  return (
    <button ref={ref} type={type} className={cn} {...props}>
      {children}
    </button>
  )
})
