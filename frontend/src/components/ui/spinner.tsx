export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-block size-8 animate-spin rounded-full border-2 border-scribix-primary border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
