// Request payload khi tạo báo cáo chất lượng
export interface CreateEvaluateRequest {
  code: string;
  material: string;
  lotCode: string;
  description?: string;
  checkDate?: string; // ISO string
  qualityRate?: string; // 'a', 'b', 'd', 'pending', etc.
  nodeDecidedEvaluate?: string; // Lý do
  createdBy?: number;
  pelletQualityImages?: string; // JSON string chứa URL ảnh
  materialImages?: string; // JSON string chứa URL ảnh
  roleId?: number; // ID của vai trò người dùng 
  userId?: number; // ID của người dùng
}

// Payload khi phê duyệt
export interface ApproveEvaluateRequest {
  status: number; // 'a' hoặc 'd'
  nodeDecidedEvaluate: string;
  lastUpdatedBy: number;
}
