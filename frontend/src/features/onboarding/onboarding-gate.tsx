import { Navigate } from 'react-router-dom'
import { FullScreenSpinner } from '@/components/full-screen-spinner'
import { useAuth } from '@/hooks/use-auth'
import { OnboardingPage } from '@/features/onboarding/onboarding-page'

export function OnboardingGate() {
  const { onboarding, isLoading } = useAuth()

  if (isLoading) {
    return <FullScreenSpinner />
  }
  if (onboarding?.is_complete) {
    return <Navigate to="/dashboard" replace />
  }
  return <OnboardingPage />
}
