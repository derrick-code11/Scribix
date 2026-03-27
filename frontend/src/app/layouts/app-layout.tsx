import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/context/auth-context";

function GearIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={props.className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.65.87.325.162.72.163 1.048.004l1.197-.6a1.125 1.125 0 0 1 1.402.386l1.162 2.013a1.125 1.125 0 0 1-.326 1.448l-1.196.898c-.316.237-.49.626-.49 1.03 0 .404.174.793.49 1.03l1.197.898a1.125 1.125 0 0 1 .326 1.448l-1.162 2.013a1.125 1.125 0 0 1-1.402.386l-1.197-.6c-.328-.16-.723-.158-1.048.004-.337.184-.587.496-.65.87l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.649-.87a1.125 1.125 0 0 0-1.048.004l-1.197.6a1.125 1.125 0 0 1-1.402-.386l-1.162-2.013a1.125 1.125 0 0 1 .326-1.448l1.196-.898c.316-.237.49-.626.49-1.03 0-.404-.174-.793-.49-1.03l-1.196-.898a1.125 1.125 0 0 1-.326-1.448l1.162-2.013a1.125 1.125 0 0 1 1.402-.386l1.197.6c.328.16.723.158 1.048-.004.337-.184.587-.496.65-.87l.213-1.281Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const iconButtonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-sm text-scribix-text/60 transition-colors hover:bg-scribix-border-subtle hover:text-scribix-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scribix-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-scribix-bg";

  return (
    <div className="min-h-dvh bg-grain bg-scribix-bg">
      <header className="border-b border-scribix-border bg-scribix-panel/95 backdrop-blur-xl">
        <div className="flex w-full items-center justify-between gap-3 px-3 py-3.5 sm:px-4 md:px-5">
          <BrandLogo to="/dashboard" size="md" />

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {profile && (
              <>
                <span
                  className="hidden max-w-40 truncate font-mono text-[11px] text-scribix-text-muted sm:inline"
                  title={`@${profile.username}`}
                >
                  @{profile.username}
                </span>
                <div
                  className="hidden h-5 w-px shrink-0 bg-scribix-border sm:block"
                  aria-hidden
                />
              </>
            )}

            <Link
              to="/settings"
              className={iconButtonClass}
              aria-label="Settings"
              title="Settings"
            >
              <GearIcon className="h-[18px] w-[18px]" />
            </Link>

            <ThemeToggle />

            <button
              type="button"
              onClick={handleSignOut}
              className="hidden rounded-sm px-2.5 py-1.5 font-mono text-xs text-scribix-text-muted transition-colors hover:bg-scribix-border-subtle hover:text-scribix-text sm:block"
            >
              Sign out
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-sm text-scribix-text/60 transition-colors hover:bg-scribix-border-subtle sm:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 9h16.5m-16.5 6.75h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            className="border-t border-scribix-border px-3 py-3 sm:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1">
              {profile && (
                <p className="px-2 pb-2 font-mono text-[11px] text-scribix-text-muted">
                  @{profile.username}
                </p>
              )}
              <Link
                to="/settings"
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 font-mono text-xs text-scribix-text/70 transition-colors hover:bg-scribix-border-subtle"
                onClick={() => setMobileMenuOpen(false)}
              >
                <GearIcon className="h-4 w-4 opacity-80" />
                Settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void handleSignOut();
                }}
                className="px-2 py-1.5 text-left font-mono text-xs text-scribix-text/70 transition-colors hover:bg-scribix-border-subtle"
              >
                Sign out
              </button>
            </div>
          </nav>
        )}
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
