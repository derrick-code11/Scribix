import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/google-logo";
import { usePageTitle } from "@/hooks/use-page-title";

export function LoginPage() {
  usePageTitle("Log in");
  const location = useLocation();
  const [notice, setNotice] = useState<string | null>(null);

  const flashMessage = (location.state as { message?: string } | null)?.message;

  const handleGoogle = () => {
    setNotice(
      "Sign-in isn’t connected yet. This page is only the layout for a future Google sign-in flow."
    );
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
          Sign in with Google will live here. For now you can browse public
          profiles and posts.
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
          {notice && (
            <p
              className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
              role="status"
            >
              {notice}
            </p>
          )}
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-3"
            onClick={handleGoogle}
          >
            <GoogleLogo className="h-5 w-5 shrink-0" />
            Continue with Google
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
