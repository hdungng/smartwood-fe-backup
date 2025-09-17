// src/services/feedbackReport/response.ts
export interface FeedbackReportItem {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  reportType: string;
  reportId: number;
  feedbackContent: string;
}

export interface CreateFeedbackReportResponse {
  data: FeedbackReportItem;
}
