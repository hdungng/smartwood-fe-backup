// service.ts
import { BaseService, getEndpoints } from 'services/core';
import { Supplier } from './response';
import { ListSupplierRequest } from './request';

class SupplierService extends BaseService {
  listSuppliers = (request?: ListSupplierRequest) =>
    this.get<Supplier[]>(getEndpoints().suppliers.listSuppliers, request);
}

export default new SupplierService();
