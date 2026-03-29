import { Link, Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";
import { usePublicHeaderScrollHidden } from "@/hooks/use-public-header-scroll";

export function PublicLayout() {
  const headerHidden = usePublicHeaderScrollHidden();

  return (
    <div className="min-h-dvh bg-grain bg-scribix-bg">
      <header
        className={`fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-transform duration-300 ease-out will-change-transform sm:px-5 sm:pt-4 ${
          headerHidden
            ? "pointer-events-none -translate-y-[calc(100%+0.75rem)]"
            : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full border border-scribix-border bg-scribix-panel/90 px-4 py-2.5 shadow-sm backdrop-blur-xl sm:gap-4 sm:px-6 sm:py-3">
          <BrandLogo
            to="/"
            size="md"
            className="shrink-0 rounded-full border border-transparent px-1 py-0.5 transition-colors hover:border-scribix-border/60"
          />
          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/signup"
              className="rounded-sm border border-scribix-border-strong bg-scribix-primary px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-wider text-scribix-primary-fg shadow-sm transition-[opacity,transform,box-shadow] duration-200 hover:bg-scribix-primary/92 hover:shadow active:scale-[0.98] sm:px-4 sm:text-xs"
            >
              Start writing
            </Link>
          </nav>
        </div>
      </header>

      <main className="pb-16 pt-21 sm:pt-23">
        <Outlet />
      </main>
    </div>
  );
}
