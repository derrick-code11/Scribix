import type { InputHTMLAttributes } from 'react'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-sm border border-scribix-text/10 bg-scribix-panel px-4 py-2.5 text-sm text-scribix-text transition-shadow placeholder:text-scribix-text/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scribix-primary/35 ${className}`}
      {...props}
    />
  )
}
