import React, { createContext, useContext, useMemo, useCallback } from 'react';

// project imports
import useAuth from 'hooks/useAuth';
import { RoleBasic, ScreenPermission } from 'services/authority';

// types
export interface RoleContextType {
  availableRoles: RoleBasic[];
  currentPermission: ScreenPermission[];
  hasPermission: (permissions: ScreenPermission[] | ScreenPermission) => boolean;
}

const RoleContext = createContext<RoleContextType | null>(null);

export const RoleProvider = ({ children }: { children: React.ReactElement }) => {
  const { user } = useAuth();

  // All available roles for testing
  const availableRoles = useMemo(() => user?.roles || [], [user?.roles]);

  const currentPermission = useMemo(() => (user?.permissions || []).map((x) => x.code), [user?.permissions]);

  const hasPermission = useCallback(
    (permissions: ScreenPermission[] | ScreenPermission) => {
      if (Array.isArray(permissions)) {
        return permissions.some((permission) => currentPermission?.includes(permission));
      }
      return [permissions].some((permission) => currentPermission?.includes(permission));
    },
    [currentPermission]
  );

  const value: RoleContextType = {
    availableRoles,
    currentPermission,
    hasPermission
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export default RoleContext;
