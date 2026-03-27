import type { ReactNode } from "react";

export function SettingsCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-scribix-border bg-scribix-panel p-6 shadow-sm transition-[box-shadow,border-color] hover:border-scribix-border-strong hover:shadow-md sm:p-8 ${className}`}
    >
      <h2 className="font-mono text-xs uppercase tracking-wider text-scribix-text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}
