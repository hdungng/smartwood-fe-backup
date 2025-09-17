// src/services/feedbackReport/request.ts
export interface CreateFeedbackReportRequest {
  reportId: number;
  feedbackContent: string;
  reportType?: string;
  code?: string;
  status?: number;
}
