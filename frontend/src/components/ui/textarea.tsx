import type { TextareaHTMLAttributes } from 'react'

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-sm border border-scribix-border bg-scribix-panel px-4 py-3 text-sm text-scribix-text shadow-sm transition-[border-color,box-shadow] placeholder:text-scribix-text-muted hover:border-scribix-border-strong focus-visible:border-scribix-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scribix-primary/35 ${className}`}
      {...props}
    />
  )
}
