import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { FullScreenSpinner } from '@/components/full-screen-spinner'
import { useAuth } from '@/hooks/use-auth'

export function RequireAuth() {
  const { token, isLoading } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (isLoading) {
    return <FullScreenSpinner />
  }
  return <Outlet />
}

export function RequireOnboardingComplete() {
  const { onboarding, isLoading } = useAuth()

  if (isLoading) {
    return <FullScreenSpinner />
  }
  if (!onboarding?.is_complete) {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { token, isLoading, isAuthenticated, onboarding } = useAuth()

  if (token && isLoading) {
    return <FullScreenSpinner />
  }
  if (isAuthenticated && onboarding) {
    if (!onboarding.is_complete) {
      return <Navigate to="/onboarding" replace />
    }
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

