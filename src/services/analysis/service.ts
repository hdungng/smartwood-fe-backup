import { BaseService, getEndpoints } from 'services/core';
import { GetSummaryAnalysisBusinessPlanResponse } from './response';
import { GetSummaryAnalysisBusinessPlanRequest } from './request';

class Service extends BaseService {
  getSummaryBusinessPlan = (payload: GetSummaryAnalysisBusinessPlanRequest) =>
    this.post<Omit<GetSummaryAnalysisBusinessPlanRequest, 'id'>, GetSummaryAnalysisBusinessPlanResponse>(
      getEndpoints().analysis.getSummaryBusinessPlan(payload.id),
      payload
    );
}

export default new Service();
