import BaseService from 'services/core/base-service';
import {
  AssignRoleForUserRequest,
  CreateRoleRequest,
  ListRoleRequest,
  ListUserPermissionRequest,
  UpdateRoleRequest
} from './request';
import { ListRoleResponse, ListUserPermissionResponse, PermissionBasic } from './response';
import { getEndpoints } from '../core';

class AuthorityService extends BaseService {
  listPermission = () => this.get<PermissionBasic[]>(getEndpoints().permissions.listPermission);

  listRole = (request?: ListRoleRequest) => this.get<ListRoleResponse[]>(getEndpoints().roles.listRole, request);

  createRole = (payload: CreateRoleRequest) => this.post<CreateRoleRequest, ApiResultEmpty>(getEndpoints().roles.createRole, payload);

  deleteRole = (roleId: number) => this.delete<ApiResultEmpty>(getEndpoints().roles.deleteRole(roleId));

  updateRole = (payload: UpdateRoleRequest) =>
    this.put<UpdateRoleRequest, ApiResultEmpty>(getEndpoints().roles.updateRole(payload.id), payload);

  listUserPermission = (request?: ListUserPermissionRequest) => this.get<ListUserPermissionResponse[]>(getEndpoints().user.getAll, request);

  assignPermissionForUser = (userId: number, payload: AssignRoleForUserRequest) =>
    this.post<AssignRoleForUserRequest, ApiResultEmpty>(getEndpoints().userRoles.assignPermission(userId), payload);
}

export default new AuthorityService();
