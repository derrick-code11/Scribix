import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/google-logo";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/context/auth-context";

export function LoginPage() {
  usePageTitle("Log in");
  const location = useLocation();
  const { session, loading, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flashMessage = (location.state as { message?: string } | null)?.message;

  if (!loading && session) return <Navigate to="/auth/callback" replace />;

  const handleGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-80px)] items-center justify-center px-4 sm:px-6">
      <div className="relative w-full max-w-md rounded-2xl border border-scribix-text/8 bg-scribix-panel p-8 shadow-sm sm:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text/45">
          Log in
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
          Back to <em className="not-italic text-scribix-primary">Scribix</em>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-scribix-text/65">
          Sign in with your Google account to access your dashboard, posts, and
          profile.
        </p>

        {flashMessage && (
          <p
            className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
            role="status"
          >
            {flashMessage}
          </p>
        )}

        <div className="mt-8">
          {error && (
            <p
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
              role="alert"
            >
              {error}
            </p>
          )}
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-3"
            disabled={busy || loading}
            onClick={handleGoogle}
          >
            <GoogleLogo className="h-5 w-5 shrink-0" />
            {busy ? "Redirecting\u2026" : "Continue with Google"}
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-scribix-text/60">
          No account?{" "}
          <Link
            to="/signup"
            className="font-medium text-scribix-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
