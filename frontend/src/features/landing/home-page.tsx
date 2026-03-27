import { Navigate } from "react-router-dom";
import { FullScreenSpinner } from "@/components/full-screen-spinner";
import { useAuth } from "@/hooks/use-auth";
import { LandingPage } from "@/features/landing/landing-page";

/**
 * Marketing home: logged-out users see the landing page; signed-in users are
 * sent to onboarding or the dashboard.
 */
export function HomePage() {
  const { isSessionReady, token, isLoading, isAuthenticated, onboarding } =
    useAuth();

  if (!isSessionReady) {
    return <FullScreenSpinner />;
  }
  if (token && isLoading) {
    return <FullScreenSpinner />;
  }
  if (isAuthenticated) {
    if (!onboarding?.is_complete) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <LandingPage />;
}
