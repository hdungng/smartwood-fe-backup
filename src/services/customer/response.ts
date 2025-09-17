// src/services/customer/response.ts
export interface Customer {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number | null;
  lastUpdatedBy: number | null;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string | null;
  name: string;
  represented: string;
  fax: string;
  phone: string;
  address: string;
  email: string;
  taxCode: string;
  banks: any[];
}