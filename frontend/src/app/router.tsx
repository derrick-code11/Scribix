import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/app/layouts/app-shell'
import { MarketingLayout } from '@/app/layouts/marketing-layout'
import { PublicLayout } from '@/app/layouts/public-layout'
import { GuestOnly, RequireAuth, RequireOnboardingComplete } from '@/app/guards'
import { OnboardingGate } from '@/features/onboarding/onboarding-gate'
import { LandingPage } from '@/features/landing/landing-page'
import { LoginPage } from '@/features/auth/login-page'
import { SignupPage } from '@/features/auth/signup-page'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { SettingsPage } from '@/features/settings/settings-page'
import { EditorRoute } from '@/features/editor/editor-route'
import { PublicProfilePage } from '@/features/public-profile/public-profile-page'
import { PublicPostPage } from '@/features/public-post/public-post-page'
import { TermsPage } from '@/features/legal/terms-page'
import { PrivacyPage } from '@/features/legal/privacy-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MarketingLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: 'login',
        element: (
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        ),
      },
      {
        path: 'signup',
        element: (
          <GuestOnly>
            <SignupPage />
          </GuestOnly>
        ),
      },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      { path: 'onboarding', element: <OnboardingGate /> },
      {
        element: <RequireOnboardingComplete />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'editor', element: <Navigate to="/dashboard" replace /> },
              { path: 'editor/:postId', element: <EditorRoute /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/:username',
    element: <PublicLayout />,
    children: [
      { index: true, element: <PublicProfilePage /> },
      { path: ':slug', element: <PublicPostPage /> },
    ],
  },
])
