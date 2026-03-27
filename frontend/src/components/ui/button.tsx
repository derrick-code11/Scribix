import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "border border-scribix-border-strong bg-scribix-primary text-scribix-primary-fg shadow-sm hover:bg-scribix-primary/92 hover:-translate-y-px hover:shadow-md active:translate-y-0",
  secondary:
    "border border-scribix-border-strong bg-scribix-panel text-scribix-text shadow-sm hover:bg-scribix-border-subtle hover:-translate-y-px hover:border-scribix-border-strong active:translate-y-0",
  ghost:
    "text-scribix-text/80 hover:bg-scribix-border-subtle active:translate-y-px",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-sm font-medium font-mono tracking-tight transition-[opacity,background-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scribix-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-scribix-bg disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
