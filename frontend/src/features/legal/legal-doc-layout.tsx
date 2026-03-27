import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const UPDATED = "March 27, 2026";

export function LegalDocLayout({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text/45">
        Legal
      </p>
      <h1 className="mt-3 font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-scribix-text/55">
        Last updated {UPDATED}
      </p>
      <div className="mt-10 space-y-8 text-sm leading-relaxed text-scribix-text/80">
        {children}
      </div>
      {footer}
    </div>
  );
}

export function LegalDocFooterLinks({
  otherTo,
  otherLabel,
}: {
  otherTo: string;
  otherLabel: string;
}) {
  return (
    <p className="mt-12 text-sm text-scribix-text/55">
      <Link to={otherTo} className="text-scribix-primary hover:underline">
        {otherLabel}
      </Link>
      {" · "}
      <Link to="/" className="text-scribix-primary hover:underline">
        Home
      </Link>
    </p>
  );
}
