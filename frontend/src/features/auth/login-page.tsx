import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/google-logo";
import { setOAuthReturnPath } from "@/features/auth/oauth-return-page";
import { usePageTitle } from "@/hooks/use-page-title";

export function LoginPage() {
  usePageTitle("Log in");
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const flashMessage = (location.state as { message?: string } | null)?.message;
  const returnTo =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const handleGoogle = async () => {
    setFormError(null);
    try {
      setOAuthReturnPath(returnTo);
      await loginWithGoogle({
        redirectTo: `${window.location.origin}/auth/complete`,
      });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : "Google sign-in didn’t start";
      setFormError(msg);
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
          Sign in with your Google account. Your browser keeps a session over
          HTTPS so you stay logged in on this device.
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
          {formError && (
            <p
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {formError}
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
