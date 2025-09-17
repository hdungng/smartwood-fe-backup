import { BaseService, getEndpoints } from 'services/core';
import { ListGoodBySupplierResponse, ListGoodResponse, ListSupplierByGoodResponse } from './response';
import { ListGoodBySupplierRequest } from './request';

class Service extends BaseService {
  listAllGood = () => this.get<ListGoodResponse[]>(getEndpoints().goods.listGood);

  listSupplierByGood = (goodId: number) => this.get<ListSupplierByGoodResponse[]>(getEndpoints().goods.listSupplierByGood(goodId));

  listGoodBySupplier = (request: ListGoodBySupplierRequest) => this.get<ListGoodBySupplierResponse[]>(getEndpoints().goods.listGoodBySupplier, request);
}

export default new Service();
