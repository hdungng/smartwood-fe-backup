// src/services/evaluate/service.ts
import axios from 'axios';
import { EVALUATE_API, SUPPLIER_API, GOOD_API, USER_API, ROLE_API,ACCOUNT_API } from 'api/constants';
import { get } from 'lodash-es';

export interface CreateEvaluateRequest {
  code: string;
  status: number; // 0 = Chờ duyệt
  lastUpdatedProgram?: string;
  contractId?: number;
  supplierId: number;
  goodId: number;
  tonVien?: number;
  lotCode?: string;
  checkDate?: string; // yyyy-MM-dd
  description?: string;
  nodeDecided_Evaluate?: string;
  qualityRate?: string;
  material?: string;
  userId?: number;
  roleId?: number;
}

export interface EvaluateResponse {
  id: number;
  code: string;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy?: number;
  lastUpdatedProgram?: string;
  status: number;
  // contractId?: number;
  supplierId: number;
  goodId: number;
  tonVien?: number;
  lotCode?: string;
  checkDate?: string;
  description?: string;
  nodeDecided_Evaluate?: string;
  qualityRate?: string;
  material?: string;
  userId?: number;
  roleId?: number;
}
export interface UpdateEvaluateRequest {
  status: number; // 1 = Chờ duyệt, 2 = Đã duyệt, 0 = Không duyệt
  nodeDecided_Evaluate?: string; // Ánh xạ sang nodeDecided_Evaluate
  lastUpdatedProgram?: string; // Thêm trường này nếu backend yêu cầu
}
export const evaluateService = {
  getSuppliers: () => axios.get(SUPPLIER_API.COMMON),
  getGoods: () => axios.get(GOOD_API.COMMON),
  getUsers: () => axios.get(USER_API.COMMON),
  getRoles: () => axios.get(ROLE_API.COMMON),
  getAccount: () => axios.get(ACCOUNT_API.COMMON),

  createEvaluate: (data: CreateEvaluateRequest) => {
    return axios.post(EVALUATE_API.COMMON, data).catch((error) => {
      console.error('Lỗi khi tạo báo cáo:', error);
      throw error;
    });
  },

  getEvaluates: async (): Promise<EvaluateResponse[]> => {
    const res = await axios.get<EvaluateResponse[]>(EVALUATE_API.COMMON);
    return res.data;
  },
updateEvaluate: (id: number, data: UpdateEvaluateRequest) => {
    return axios.put(`${EVALUATE_API.COMMON}/${id}`, data).catch((error) => {
      console.error('Lỗi khi cập nhật báo cáo:', error);
      throw error;
    });
  }


};

// Nếu muốn import trực tiếp từ bên ngoài
export const { getSuppliers, getGoods, getUsers, getRoles, createEvaluate, getEvaluates } = evaluateService;
