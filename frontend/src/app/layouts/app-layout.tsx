import { Link, Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-grain bg-scribix-bg">
      <header className="border-b border-scribix-text/8 bg-scribix-panel/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            to="/dashboard"
            className="font-display text-lg tracking-tight text-scribix-text"
          >
            Scribix
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
