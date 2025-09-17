import { BaseService, getEndpoints } from 'services/core';
import { GetDetailDraftPoResponse } from './response';
import { GetDetailDraftPoRequest } from './request';

class Service extends BaseService {
  getDetailDraftPo = (request: GetDetailDraftPoRequest) =>
    this.get<GetDetailDraftPoResponse[]>(getEndpoints().draftPos.getDetailDraftPo, {
      ...request
    });
}

export default new Service();
