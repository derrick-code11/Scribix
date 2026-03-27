import { createBrowserRouter } from 'react-router-dom'
import { MarketingLayout } from '@/app/layouts/marketing-layout'
import { PublicLayout } from '@/app/layouts/public-layout'
import { LandingPage } from '@/features/landing/landing-page'
import { LoginPage } from '@/features/auth/login-page'
import { SignupPage } from '@/features/auth/signup-page'
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
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
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
