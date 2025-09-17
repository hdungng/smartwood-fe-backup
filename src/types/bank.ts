export interface BankFormData {
  code: string;
  name: string;
  fullName: string;
  swiftCode: string;
  bankCode: string;
  branchName: string;
  branchCode: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  country: string;
  city: string;
  currency: string;
  isDefault: number;
}

export interface Bank extends BankFormData {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate?: string | null;
  lastUpdatedProgram?: string | null;
  refId: number;
  refType: string;
  status: number;
}

export interface TBank extends Bank {}

export interface BankParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: number;
  refId?: number;
  refType?: string;
  name?: string;
  code?: string;
  bankCode?: string;
  swiftCode?: string;
  country?: string;
  city?: string;
  currency?: string;
  isDefault?: number;
}

export interface BankProps {
  modal: boolean;
}

export interface BankList extends Bank {
  customerName?: string;
  customerCode?: string;
}
