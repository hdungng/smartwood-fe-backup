import { SearchParams } from './common';

export interface TCost {
  id: number;
  createdAt: string;
  lastUpdatedAt: string | null;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string | null;

  itemCode: string;
  costType: string; // finance | logistics | customs | management | other
  name: string;
  amount: number;
  currency: string; // VND | USD | %
  effectiveFrom: string; // ISO datetime string
  effectiveTo: string; // ISO datetime string
}

export interface CostFilters {
  search: string;
  status?: string;
  itemCode?: string;
  costType?: string;
  name?: string;
  currency?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface CreateCostData {
  itemCode: string;
  costType: string;
  name: string;
  amount: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface UpdateCostData extends CreateCostData {
  id: number;
}

export interface CostParams extends SearchParams<CreateCostData> {
  itemCode?: string;
  costType?: string;
  name?: string;
  currency?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}


