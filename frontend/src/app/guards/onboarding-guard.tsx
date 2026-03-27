import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

export function OnboardingGuard() {
  const { onboarding, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-scribix-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-scribix-text/20 border-t-scribix-primary" />
      </div>
    );
  }

  if (!onboarding?.is_complete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
