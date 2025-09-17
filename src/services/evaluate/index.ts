export interface EvaluateResponse {
  id: number;
  code: string;
  createdAt?: string;
  lastUpdatedAt?: string;
  createdBy?: number;
  lastUpdatedBy?: number;
  lastProgramUpdate?: string;
  status?: number;
  contractId?: number;
  supplierId?: number;
  goodId?: number;
  tonVien?: number;
  lotCode?: string;
  checkDate?: string;
  description?: string;
  nodeDecidedEvaluate?: string;
  qualityRate?: string;
  material?: string;
  userId?: number;
  roleId?: number;
}

export interface EvaluateRequest {
  code: string;
  status?: number; // 0 = Chờ duyệt
  createdBy?: number;
  contractId?: number;
  supplierId?: number;
  goodId?: number;
  tonVien?: number;
  lotCode?: string;
  checkDate?: string; // yyyy-MM-dd
  description?: string;
  nodeDecidedEvaluate?: string;
  qualityRate?: string;
  userId?: number;
  material?: string;
  roleId?: number;
}
