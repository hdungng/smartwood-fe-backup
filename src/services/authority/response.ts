import { Entity, EntityWithName } from '../core';
import { ScreenPermission } from './enum';

export type RoleBasic = EntityWithName<number> & {
  code: string;
};

export type PermissionBasic = Entity<number> & {
  code: ScreenPermission;
};

export type ListRoleResponse = EntityWithName<number> & {
  code: string;
  description?: string;
  permissions: PermissionBasic[];
};

export type ListUserPermissionResponse = EntityWithName<number> & {
  email: string;
  roleIds: number[];
  regions: string[];
}
