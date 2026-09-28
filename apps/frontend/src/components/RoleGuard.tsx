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
  const allowedRoleList = allowedRoles.map((role) => role.toUpperCase());
  const currentRole = user?.role?.toUpperCase();

  if (!user || !allowedRoleList.includes(currentRole ?? '')) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }

    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
