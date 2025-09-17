export interface TForwarder {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string | null;
  name: string;
  fullName: string;
  taxCode: string | null;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  banks?: TForwarderBank[];
}

export interface TForwarderBank {
  id?: number;
  bankName: string;
  bankCode: string;
  bankFullName: string;
  branchName: string;
  branchCode: string;
  accountNumber: string;
  accountName: string;
  swiftCode: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  isDefault: boolean;
}

export interface TForwarderResponse {
  data: TForwarder[];
  meta: {
    message: string;
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface TForwarderRequest {
  code: string;
  name: string;
  fullName: string;
  taxCode?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  status: number;
  banks?: TForwarderBank[];
}

export interface TForwarderFilter {
  code?: string;
  name?: string;
  fullName?: string;
  taxCode?: string;
  address?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export type TForwarderStatus = 'active' | 'inactive' | 'all';
