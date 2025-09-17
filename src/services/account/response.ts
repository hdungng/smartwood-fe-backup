import { PermissionBasic, RoleBasic } from '../authority';
import { EntityWithName } from '../core';

export type UserProfile = EntityWithName<string> & {
  email?: string;
  avatar?: string;
  image?: string;
  role?: string;
  tier?: string;
  roles?: RoleBasic[];
  regions?: string[];
  permissions?: PermissionBasic[];
};

export type LoginResponse = {
  token?: {
    accessToken: string;
  }
  user?: UserProfile;
};