import { ROUTES } from '../config/routes';
import { AuthState } from '@/features/auth/stores/auth.store';

export const getAuthRedirectPath = (user: any): string => {
  if (!user) return ROUTES.AUTH.LOGIN;

  const state = user.state;
  if (state === AuthState.EMAIL_NOT_VERIFIED) return '/verify-otp';
  if (state === AuthState.PROFILE_INCOMPLETE) {
    if (user.registrationStep === 1) return '/register/profile';
    if (user.registrationStep === 2) return '/register/documents';
    if (user.registrationStep === 3 || user.registrationStep === 4) return '/waiting-approval';
    return '/register/profile';
  }
  if (state === AuthState.WAITING_APPROVAL) return '/waiting-approval';
  if (state === AuthState.REVISION_REQUIRED) return '/register/revision';
  if (state === AuthState.REJECTED) return '/registration-rejected';
  if (state === AuthState.INACTIVE) return '/account-inactive';

  // Default redirect for active users based on their role
  const role = user.role;
  // @ts-ignore
  return ROUTES.DASHBOARD[role] || '/app';
};
