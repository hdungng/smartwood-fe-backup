import { BaseService, getEndpoints } from 'services/core';
import { ListGoodTypeRequest } from './request';

class Service extends BaseService {
  listGoodType = (request?: ListGoodTypeRequest) =>
    this.get<string[]>(getEndpoints().goodTypes.listGoodType, request);
}

export default new Service();
