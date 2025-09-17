import { BaseService, getEndpoints } from 'services/core';
import { ListConfigResponse } from './response';
import { ListConfigRequest } from './request';

class Service extends BaseService {
  listConfig = (request?: ListConfigRequest) => this.get<ListConfigResponse[]>(getEndpoints().configs.listConfig, request);
}

export default new Service();
