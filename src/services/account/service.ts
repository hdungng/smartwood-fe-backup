import { BaseService, getEndpoints } from 'services/core';
import { LoginResponse, UserProfile } from './response';
import { LogInRequest } from './request';

class Service extends BaseService {
  logIn = (payload: LogInRequest) => this.post<LogInRequest, LoginResponse>(getEndpoints().account.logIn, payload);

  getProfile = () => this.get<UserProfile>(getEndpoints().account.profile);
}

export default new Service();
