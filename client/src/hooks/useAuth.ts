import { useAuthStore } from '../features/auth/stores/auth.store';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';

export const useAuth = () => {
  const { user, role, login, logout, isLoading, error } = useAuthStore();
  const isDeveloper = (useAuthStore() as any).isDeveloper;
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  return {
    user,
    role,
    login,
    logout: handleLogout,
    isLoading,
    error,
    isAuthenticated: !!user || isDeveloper,
  };
};
