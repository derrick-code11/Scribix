import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext, type AuthContextValue } from "@/context/auth-context";
import { UNAUTHORIZED_EVENT } from "@/lib/api-client";
import * as api from "@/lib/api";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/auth-storage";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      queryClient.removeQueries({ queryKey: ["me"] });
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [queryClient]);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: api.fetchMe,
    enabled: !!token,
    retry: false,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const { token: t } = await api.login({ email, password });
      setStoredToken(t);
      setToken(t);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    [queryClient],
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      const { token: t } = await api.signup({ email, password });
      setStoredToken(t);
      setToken(t);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    [queryClient],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const { token: t } = await api.googleAuth(idToken);
      setStoredToken(t);
      setToken(t);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    queryClient.removeQueries({ queryKey: ["me"] });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    const data = meQuery.data;
    const isLoading = !!token && meQuery.isPending;
    return {
      token,
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
