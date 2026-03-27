import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

export function MarketingLayout() {
  return (
    <div className="min-h-dvh bg-grain bg-scribix-bg">
      <header className="sticky top-0 z-50 px-4 pt-4 pb-2 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full border border-scribix-text/8 bg-scribix-panel/95 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6"
        >
          <Link
            to="/"
            className="font-display text-lg tracking-tight text-scribix-text"
          >
            Scribix
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="font-mono text-xs uppercase tracking-wider text-scribix-text/70 transition-colors hover:text-scribix-text"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-sm bg-scribix-primary px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-scribix-primary-fg shadow-sm transition-[opacity,transform] duration-200 hover:bg-scribix-primary/92 active:scale-[0.98]"
            >
              Start writing
            </Link>
          </nav>
        </motion.div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-auto border-t border-scribix-text/8 bg-scribix-surface-muted">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:grid-cols-3 sm:px-6">
          <div>
            <p className="font-display text-lg text-scribix-text">Scribix</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-scribix-text/60">
              Publish writing to your own Scribix URL and drop post embeds on
              your portfolio or marketing site.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-scribix-text/45">
              Site
            </p>
            <ul className="mt-4 space-y-3 text-sm text-scribix-text/70">
              <li>
                <a
                  href="/#features"
                  className="transition-colors hover:text-scribix-text"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="/#faq"
                  className="transition-colors hover:text-scribix-text"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-scribix-text/45">
                Legal
              </p>
              <ul className="mt-4 space-y-3 text-sm text-scribix-text/70">
                <li>
                  <Link
                    to="/terms"
                    className="transition-colors hover:text-scribix-text"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="transition-colors hover:text-scribix-text"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <p className="text-right text-sm text-scribix-text/55 sm:shrink-0 sm:pt-1">
              © {new Date().getFullYear()} Scribix
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
