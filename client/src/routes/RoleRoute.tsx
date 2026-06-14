import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from '../config/routes';

interface RoleRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { role } = useAuthStore();

  if (!role || !allowedRoles.includes(role)) {
    // @ts-ignore
    const defaultPath = ROUTES.DASHBOARD[role] || '/app';
    return <Navigate to={defaultPath} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
