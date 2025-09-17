import { Entity } from '../core';

export type ListRoleRequest = {};

export type CreateRoleRequest = {
  name: string;
  description?: string;
  permissions: number[]
}

export type UpdateRoleRequest = CreateRoleRequest & Entity<number>;

export type AssignRoleForUserRequest = {
  roleIds: number[];
  regions: string[];
}

export type ListUserPermissionRequest = {
  roleId?: number;
  region?: string;
}