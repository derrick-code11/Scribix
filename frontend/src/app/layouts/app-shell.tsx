import { Link, NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/hooks/use-auth'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors duration-200 ${
    isActive
      ? 'bg-scribix-surface-tint text-scribix-text'
      : 'text-scribix-text/60 hover:bg-scribix-text/[0.04] hover:text-scribix-text'
  }`

export function AppShell() {
  const { profile, logout } = useAuth()
  const handleLogout = () => logout()

  return (
    <div className="min-h-dvh bg-grain bg-scribix-bg">
      <header className="sticky top-0 z-40 border-b border-scribix-text/8 bg-scribix-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-full border border-scribix-text/10 bg-scribix-panel px-4 py-1.5 font-display text-lg tracking-tight text-scribix-text shadow-sm transition-shadow hover:border-scribix-text/15"
          >
            Scribix
          </Link>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <NavLink to="/dashboard" className={navLinkClass}>
              Posts
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              Settings
            </NavLink>
            {profile && (
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg px-3 py-2 font-mono text-xs uppercase tracking-wider text-scribix-text/60 transition-colors hover:bg-scribix-text/4 hover:text-scribix-text"
              >
                Public page
              </a>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 font-mono text-xs uppercase tracking-wider text-scribix-text/50 transition-colors hover:text-scribix-text"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
