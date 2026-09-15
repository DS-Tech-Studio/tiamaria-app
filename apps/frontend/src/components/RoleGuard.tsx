import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types/auth';

interface RoleGuardProps {
  allowedRoles: Role[];
  children?: ReactNode;
  fallback?: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children, fallback }: RoleGuardProps) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
