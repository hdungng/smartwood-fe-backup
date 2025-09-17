export interface GoodSupplier {
  id: number;
  code: string;
  createdAt: string;
  lastUpdatedAt: string;
  status: number;
  createdBy?: number;
  lastUpdatedBy?: number;
  lastUpdatedProgram?: string;
  goodId: number;
  supplierId: number;
  unitPrice?: number;
  goodType?: string;
  startDate?: string;
  endDate?: string;
  goodName?: string;
  goodCode?: string;
  supplierName?: string;
  supplierCode?: string;
}

export interface CreateGoodSupplier {
  goodId: number;
  supplierId: number;
  unitPrice?: number;
  goodType?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateGoodSupplier {
  unitPrice?: number;
  goodType?: string;
  startDate?: string;
  endDate?: string;
}

export interface GoodSupplierFilter {
  code?: string;
  goodId?: number;
  goodName?: string;
  supplierId?: number;
  goodType?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  status?: number;
  page: number;
  size: number;
}

export interface GoodSupplierPageInfor {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  canNext: boolean;
  canPrevious: boolean;
}

export interface SingleGoodSupplier {
  data: GoodSupplier;
  meta: {
    message: string;
  };
}

export interface PagedResult<T> {
  meta: GoodSupplierPageInfor;
  data: T[];
}
