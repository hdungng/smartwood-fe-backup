import { useRole } from 'contexts';
import React, { useMemo } from 'react';
import { ScreenPermission } from 'services/authority';

type Props = {
  permissions?: ScreenPermission[];
  permission?: ScreenPermission;
  children: React.ReactNode;
};

const PermissionGuard = ({ permissions, permission, children }: Props) => {
  const { hasPermission } = useRole();

  const requestRoles = useMemo(() => {
    const result = permissions || [];
    if (permission && !result.includes(permission)) {
      result.push(permission);
    }

    return result;
  }, [permissions, permission]);

  if (hasPermission(requestRoles)) {
    return <>{children}</>;
  }

  return null;
};

export default PermissionGuard;
