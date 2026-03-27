const dimClass = {
  sm: "h-9 w-9 min-h-9 min-w-9",
  md: "h-14 w-14 min-h-14 min-w-14",
  lg: "h-20 w-20 min-h-20 min-w-20",
} as const;

const initialClass = {
  sm: "text-xs",
  md: "text-lg",
  lg: "text-2xl",
} as const;

export function AuthorAvatar({
  photoUrl,
  name,
  size = "md",
  className = "",
}: {
  photoUrl: string | null | undefined;
  name: string;
  size?: keyof typeof dimClass;
  className?: string;
}) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "?";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className={`shrink-0 rounded-full object-cover ring-2 ring-scribix-border/50 ${dimClass[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-scribix-surface-muted font-display text-scribix-text/70 ring-2 ring-scribix-border/40 ${dimClass[size]} ${initialClass[size]} ${className}`}
      aria-hidden
    >
      {initial}
    </div>
  );
}
