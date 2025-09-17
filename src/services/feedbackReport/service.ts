import { BaseService, getEndpoints } from 'services/core';
import { CreateFeedbackReportRequest } from './request';
import { FeedbackReportItem, CreateFeedbackReportResponse } from './response';

class FeedbackReportService extends BaseService {
  getFeedbackReports = (reportId?: number) =>
    reportId
      ? this.get<FeedbackReportItem[]>(getEndpoints().feedbackReports.getByReportId(reportId))
      : this.get<FeedbackReportItem[]>(getEndpoints().feedbackReports.getAll);

  createFeedbackReport = (data: CreateFeedbackReportRequest) =>
    this.post<CreateFeedbackReportResponse>(getEndpoints().feedbackReports.create, data,data);
}

export default new FeedbackReportService();