import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { fetchAuthMe } from '@/lib/auth-api'
import type { AuthMeResponse } from '@/lib/auth-api'

interface AuthState {
  session: Session | null
  user: AuthMeResponse['user'] | null
  profile: AuthMeResponse['profile'] | null
  onboarding: AuthMeResponse['onboarding'] | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  signInWithGoogle: (redirectTo?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    onboarding: null,
    loading: true,
  })

  const syncBackend = useCallback(async (session: Session | null) => {
    if (!session) {
      setState({ session: null, user: null, profile: null, onboarding: null, loading: false })
      return
    }

    try {
      const me = await fetchAuthMe()
      setState({
        session,
        user: me.user,
        profile: me.profile,
        onboarding: me.onboarding,
        loading: false,
      })
    } catch {
      setState({ session, user: null, profile: null, onboarding: null, loading: false })
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncBackend(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        syncBackend(session)
      },
    )

    return () => subscription.unsubscribe()
  }, [syncBackend])

  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    const target = redirectTo ?? `${window.location.origin}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: target },
    })
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState({ session: null, user: null, profile: null, onboarding: null, loading: false })
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!state.session) return
    try {
      const me = await fetchAuthMe()
      setState((prev) => ({
        ...prev,
        user: me.user,
        profile: me.profile,
        onboarding: me.onboarding,
      }))
    } catch {
      // silent
    }
  }, [state.session])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signInWithGoogle, signOut, refreshProfile }),
    [state, signInWithGoogle, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
