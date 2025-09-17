// Response từ API Evaluate (theo Swagger)
export interface EvaluateResponse {
  id: number;
  code: string;
  material: string;
  lotCode: string;
  description?: string;
  checkDate?: string;
  createdAt?: string;
  createdBy?: number;
  userId?: number;
  qualityRate?: string;
  nodeDecidedEvaluate?: string;
  roleId?: number; // ID của vai trò người dùng
}

// Response chung của API
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
