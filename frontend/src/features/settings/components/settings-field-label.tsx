import type { ReactNode } from "react";

export function SettingsFieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-scribix-text-muted">
      {children}
    </label>
  );
}
