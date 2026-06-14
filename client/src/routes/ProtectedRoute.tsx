import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, AuthState } from '@/features/auth/stores/auth.store';
import { isRouteAllowed } from '../config/access';
import { ROUTES } from '../config/routes';
import { toast } from '@/stores/toastStore';

const ProtectedRoute: React.FC = () => {
  const { user, isInitialized, isLoading } = useAuthStore();
  const location = useLocation();
  const accessDeniedShown = useRef(false);

  if (!isInitialized || isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // Handle strictly based on user state
  const state = user.state;
  const path = location.pathname;

  if (state === AuthState.EMAIL_NOT_VERIFIED && path !== '/verify-otp') {
    return <Navigate to="/verify-otp" replace />;
  }

  if (state === AuthState.PROFILE_INCOMPLETE) {
    // Strictly redirect based on registrationStep
    if (user.registrationStep === 1 && path !== '/register/profile') return <Navigate to="/register/profile" replace />;
    if (user.registrationStep === 2 && path !== '/register/documents') return <Navigate to="/register/documents" replace />;
    // Steps 3 and 4 both go to waiting-approval (payment info is now there)
    if ((user.registrationStep === 3 || user.registrationStep === 4) && path !== '/waiting-approval') return <Navigate to="/waiting-approval" replace />;
  }

  if (state === AuthState.WAITING_APPROVAL && path !== '/waiting-approval') {
    return <Navigate to="/waiting-approval" replace />;
  }

  if (state === AuthState.REVISION_REQUIRED && path !== '/register/revision') {
    return <Navigate to="/register/revision" replace />;
  }

  if (state === AuthState.REJECTED && path !== '/registration-rejected') {
    return <Navigate to="/registration-rejected" replace />;
  }

  if (state === AuthState.INACTIVE && path !== '/account-inactive') {
    return <Navigate to="/account-inactive" replace />;
  }

  if (state === AuthState.ACTIVE) {
    // If they are active but trying to access onboarding pages, redirect to dashboard
    if (path.startsWith('/register') || path === '/verify-otp' || path === '/waiting-approval') {
      const defaultPath = user.role === 'member' ? '/app/member/dashboard' : '/app';
      return <Navigate to={defaultPath} replace />;
    }

    // Role Access Guard for /app/* routes
    if (path.startsWith('/app') && !isRouteAllowed(path, user.role)) {
      // @ts-ignore
      const defaultPath = ROUTES.DASHBOARD[user.role] || '/app';
      if (path !== defaultPath) {
        // Defer toast to after render to avoid setState-during-render React warning
        setTimeout(() => toast.error('Anda tidak memiliki akses ke halaman ini.'), 0);
        return <Navigate to={defaultPath} replace />;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
