export interface GetReportRequest {
  code?: string;
  status?: number;
  contractId?: number;
  customerId?: number;
  checkDate?: string; // định dạng yyyy-MM-dd hoặc ISO 8601
  statusRequestPayment?: number;
  statusContract?: number;
}
