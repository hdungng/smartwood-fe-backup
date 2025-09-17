export interface ReportItem {
  id: number;
  code: string;
  createdAt: string;
  lastUpdatedAt: string;
  status: number;
  createdBy: number | null;
  lastUpdatedBy: number | null;
  lastProgramUpdate: string | null;
  lastUpdatedProgram: string | null;
  contractId: number | null;
  customerId: number;
  statusRequestPayment: number;
  statusContract: number;
  checkDate: string | null;
}
