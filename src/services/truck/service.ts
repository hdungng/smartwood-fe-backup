import { BaseService, getEndpoints, PaginationResult } from 'services/core';
import { ListTruckResponse } from './response';
import { ListTruckRequest } from './request';

class Service extends BaseService {
  listTrucks = (request?: ListTruckRequest) => this.get<PaginationResult<ListTruckResponse>>(getEndpoints().trucks.listTrucks, request);
}

export default new Service();
