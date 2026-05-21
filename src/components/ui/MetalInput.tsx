import clsx from 'clsx'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function MetalInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx('metal-input', className)} {...props} />
}

export function MetalTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx('metal-input metal-textarea', className)} {...props} />
}
