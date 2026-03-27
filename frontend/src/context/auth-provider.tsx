import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { AuthContext, type AuthContextValue } from "@/context/auth-context";
import { UNAUTHORIZED_EVENT } from "@/lib/api-client";
import * as api from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { ApiError } from "@/lib/api-error";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const onUnauthorized = () => {
      setSession(null);
      queryClient.removeQueries({ queryKey: ["me"] });
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [queryClient]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setSessionReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  const token = session?.access_token ?? null;

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: api.fetchMe,
    enabled: sessionReady && !!token,
    retry: false,
  });

  const loginWithGoogle = useCallback(async (options?: { redirectTo?: string }) => {
    const redirectTo =
      options?.redirectTo ?? `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
    if (error) {
      throw new ApiError(error.message, error.code ?? undefined, 400);
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    queryClient.removeQueries({ queryKey: ["me"] });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    const data = meQuery.data;
    const isLoading = !!token && meQuery.isPending;
    return {
      token,
      isSessionReady: sessionReady,
      user: data?.user ?? null,
      profile: data?.profile ?? null,
      onboarding: data?.onboarding ?? null,
      isLoading,
      isAuthenticated: !!token && !!data,
      loginWithGoogle,
      logout,
      refetchSession: () =>
        queryClient.invalidateQueries({ queryKey: ["me"] }),
    };
  }, [
    token,
    sessionReady,
    meQuery.data,
    meQuery.isPending,
    loginWithGoogle,
    logout,
    queryClient,
  ]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
