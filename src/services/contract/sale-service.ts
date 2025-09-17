import { BaseService, getEndpoints } from 'services/core';
import {
  ListSaleContractResponse
} from './response';
import { ListSaleContractRequest } from './request';

class SaleService extends BaseService {
  listSaleContract = (request: ListSaleContractRequest) =>
    this.get<ListSaleContractResponse[]>(getEndpoints().contracts.listSalesContract, request);

  listSaleContractAvailable = (request: ListSaleContractRequest) =>
    this.get<ListSaleContractResponse[]>(getEndpoints().contracts.listSaleContractAvailable, request);
}

export default new SaleService();
