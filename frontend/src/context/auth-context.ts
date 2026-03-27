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
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refetchSession: () => Promise<unknown>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
