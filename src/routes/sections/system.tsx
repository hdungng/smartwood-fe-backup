import { routing } from '../routing';
import Loadable from 'components/Loadable';
import { lazy } from 'react';
import { PageGuard } from 'components/guards';

const RoleManagement = Loadable(lazy(() => import('pages/authority/role')));
const UserPermissionManagement = Loadable(lazy(() => import('pages/authority/user-permission')));

export const systemRoutes = [
  {
    path: routing.system.authority.role,
    element: (
      <PageGuard permission='ROLE_VIEW'>
        <RoleManagement />
      </PageGuard>
    )
  },
  {
    path: routing.system.authority.permission,
    element: (
      <PageGuard permission='PERMISSION_VIEW'>
        <UserPermissionManagement />
      </PageGuard>
    )
  }
];
