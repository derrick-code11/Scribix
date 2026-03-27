import { Link, Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";

export function PublicLayout() {
  return (
    <div className="min-h-dvh bg-grain bg-scribix-bg">
      <header className="border-b border-scribix-text/8 bg-scribix-panel/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-scribix-text/10 bg-scribix-panel px-4 py-1.5 font-display text-lg tracking-tight text-scribix-text shadow-sm"
          >
            Scribix
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/signup"
              className="rounded-sm bg-scribix-primary px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-scribix-primary-fg shadow-sm transition-colors hover:bg-scribix-primary/92"
            >
              Start writing
            </Link>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
