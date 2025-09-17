import { BaseService, getEndpoints } from 'services/core';
import { ListRegionRequest } from './request';

class Service extends BaseService {
  listRegion = (request?: ListRegionRequest) =>
    this.get<string[]>(getEndpoints().regions.listRegion, request);
}

export default new Service();
