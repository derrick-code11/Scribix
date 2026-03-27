import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-scribix-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-scribix-text/20 border-t-scribix-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
