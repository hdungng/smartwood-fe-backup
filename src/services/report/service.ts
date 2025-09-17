// src/services/report/service.ts
import { BaseService, getEndpoints } from 'services/core';
import { GetReportRequest } from './request';
import { ReportItem } from './response';

class ReportService extends BaseService {
  getReports = (params?: GetReportRequest) =>
    this.get<ReportItem[]>(getEndpoints().report.getAll, params );
}

export default new ReportService();