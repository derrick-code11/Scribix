import { Navigate, Outlet } from "react-router-dom";
import { FullScreenSpinner } from "@/components/full-screen-spinner";
import { useAuth } from "@/context/auth-context";

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return <FullScreenSpinner />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
