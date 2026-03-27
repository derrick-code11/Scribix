import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

export function AuthCallbackPage() {
  const { loading, session, onboarding } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      navigate("/login", { replace: true });
      return;
    }

    if (!onboarding || !onboarding.is_complete) {
      navigate("/onboarding", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, session, onboarding, navigate]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-scribix-bg">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-scribix-text/20 border-t-scribix-primary" />
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-scribix-text/50">
          Signing you in&hellip;
        </p>
      </div>
    </div>
  );
}
