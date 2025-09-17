
// response.ts
export type Supplier = {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate?: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  website?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  supplierType: string;
  rating: number;
  costSpend: number;
  costRemain: number;
  region: string;
  province: string;
  district: string;
  banks: any[];
};

