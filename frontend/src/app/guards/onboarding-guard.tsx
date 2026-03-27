import { Navigate, Outlet } from "react-router-dom";
import { FullScreenSpinner } from "@/components/full-screen-spinner";
import { useAuth } from "@/context/auth-context";

export function OnboardingGuard() {
  const { onboarding, loading } = useAuth();

  if (loading) {
    return <FullScreenSpinner />;
  }

  if (!onboarding?.is_complete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
