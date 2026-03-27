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

  const login = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw new ApiError(error.message, error.code ?? undefined, 400);
      }
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    [queryClient]
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) {
        throw new ApiError(error.message, error.code ?? undefined, 400);
      }
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      return { needsEmailConfirmation: !data.session };
    },
    [queryClient]
  );

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
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
      login,
      signup,
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
    login,
    signup,
    loginWithGoogle,
    logout,
    queryClient,
  ]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
