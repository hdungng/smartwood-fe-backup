export type GetExportReportRequest = {
  code?: string;
  status?: number;
  supplierName?: string;
  customerName?: string;
  orderCode?: string;
  materialName?: string;
  exportDate?: string;      // ISO string, ví dụ: '2025-08-01'
  fromDate?: string;        // format yyyy-MM-dd
  toDate?: string;          // format yyyy-MM-dd
  page?: number;
  size?: number;
};
