import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout';
import { AppLayout } from '@/layouts/AppLayout';

// Route Guards
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute';

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { SignupPage } from '@/pages/public/SignupPage';
import { VerifyEmailPage } from '@/pages/public/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/public/ResetPasswordPage';

// Authenticated Pages
import { DashboardPage } from '@/pages/app/DashboardPage';
import { CalendarPage } from '@/pages/app/CalendarPage';
import { TrackPeriodPage } from '@/pages/app/TrackPeriodPage';
import { HistoryPage } from '@/pages/app/HistoryPage';
import { InsightsPage } from '@/pages/app/InsightsPage';
import { ProfilePage } from '@/pages/app/ProfilePage';

export const router = createBrowserRouter([
  // Public Route Group
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
        ],
      },
      { path: '/verify-email', element: <VerifyEmailPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // Authenticated Protected App Route Group
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'calendar', element: <CalendarPage /> },
          { path: 'track', element: <TrackPeriodPage /> },
          { path: 'history', element: <HistoryPage /> },
          { path: 'insights', element: <InsightsPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
    ],
  },

  // Fallback / Catch-all Route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
