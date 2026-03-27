import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-scribix-primary text-scribix-primary-fg shadow-sm hover:bg-scribix-primary/92 hover:-translate-y-px hover:shadow active:translate-y-0",
  secondary:
    "border border-scribix-text/15 bg-transparent text-scribix-text hover:bg-scribix-text/[0.03] hover:-translate-y-px active:translate-y-0",
  ghost:
    "text-scribix-text/80 hover:bg-scribix-text/[0.04] active:translate-y-px",
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
