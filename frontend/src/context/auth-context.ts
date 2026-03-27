import { createContext } from "react";
import type { MeResponse, ProfileSummary } from "@/lib/types";

export type AuthContextValue = {
  token: string | null;
  /** True after initial `getSession()` completes (avoids auth guard flash). */
  isSessionReady: boolean;
  user: MeResponse["user"] | null;
  profile: ProfileSummary | null;
  onboarding: MeResponse["onboarding"] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: (options?: { redirectTo?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refetchSession: () => Promise<unknown>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
