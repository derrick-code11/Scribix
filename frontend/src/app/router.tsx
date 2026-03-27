import { createBrowserRouter } from "react-router-dom";
import { MarketingLayout } from "@/app/layouts/marketing-layout";
import { PublicLayout } from "@/app/layouts/public-layout";
import { AppLayout } from "@/app/layouts/app-layout";
import { ProtectedRoute } from "@/app/guards/protected-route";
import { OnboardingGuard } from "@/app/guards/onboarding-guard";
import { LandingPage } from "@/features/landing/landing-page";
import { LoginPage } from "@/features/auth/login-page";
import { SignupPage } from "@/features/auth/signup-page";
import { AuthCallbackPage } from "@/features/auth/auth-callback";
import { OnboardingPage } from "@/features/onboarding/onboarding-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { PublicProfilePage } from "@/features/public-profile/public-profile-page";
import { PublicPostPage } from "@/features/public-post/public-post-page";
import { TermsPage } from "@/features/legal/terms-page";
import { PrivacyPage } from "@/features/legal/privacy-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MarketingLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "terms", element: <TermsPage /> },
      { path: "privacy", element: <PrivacyPage /> },
    ],
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/onboarding", element: <OnboardingPage /> },
          {
            element: <OnboardingGuard />,
            children: [
              { path: "/dashboard", element: <DashboardPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/:username",
    element: <PublicLayout />,
    children: [
      { index: true, element: <PublicProfilePage /> },
      { path: ":slug", element: <PublicPostPage /> },
    ],
  },
]);
