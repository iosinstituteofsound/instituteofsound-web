import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={clsx('ios-input', className)} {...props} />
  }
)

interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
}

export function FieldLabel({ className, children, ...props }: FieldLabelProps) {
  return (
    <label className={clsx('ios-label', className)} {...props}>
      {children}
    </label>
  )
}
