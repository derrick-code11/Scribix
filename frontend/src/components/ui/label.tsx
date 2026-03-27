import type { LabelHTMLAttributes, ReactNode } from 'react'

export function Label({
  children,
  className = '',
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label
      className={`block text-xs font-mono uppercase tracking-wider text-scribix-text/55 ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}
