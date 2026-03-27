import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { FullScreenSpinner } from "@/components/full-screen-spinner";
import { useAuth } from "@/context/auth-context";

export function AuthedRedirect({
  to = "/dashboard",
  children,
}: {
  to?: string;
  children: ReactNode;
}) {
  const { session, loading } = useAuth();

  if (loading) {
    return <FullScreenSpinner />;
  }

  if (session) {
    return <Navigate to={to} replace />;
  }

  return <>{children}</>;
}
