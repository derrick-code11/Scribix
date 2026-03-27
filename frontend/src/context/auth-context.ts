import { createContext } from "react";
import type { MeResponse, ProfileSummary } from "@/lib/types";

export type AuthContextValue = {
  token: string | null;
  user: MeResponse["user"] | null;
  profile: ProfileSummary | null;
  onboarding: MeResponse["onboarding"] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  refetchSession: () => Promise<unknown>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
