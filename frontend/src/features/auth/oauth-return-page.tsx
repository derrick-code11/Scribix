import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FullScreenSpinner } from "@/components/full-screen-spinner";
import { useAuth } from "@/hooks/use-auth";

const STORAGE_KEY = "scribix_oauth_return";

/** Allowed post-login paths after Google OAuth from the log-in page. */
function sanitizeReturnPath(raw: string | null): string {
  if (!raw || typeof raw !== "string") return "/dashboard";
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return "/dashboard";
  return t;
}

export function OAuthReturnPage() {
  const navigate = useNavigate();
  const { isSessionReady, token } = useAuth();

  useEffect(() => {
    if (!isSessionReady) return;
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    const next = sanitizeReturnPath(sessionStorage.getItem(STORAGE_KEY));
    sessionStorage.removeItem(STORAGE_KEY);
    navigate(next, { replace: true });
  }, [isSessionReady, token, navigate]);

  return <FullScreenSpinner />;
}

export function setOAuthReturnPath(path: string) {
  sessionStorage.setItem(STORAGE_KEY, sanitizeReturnPath(path));
}
