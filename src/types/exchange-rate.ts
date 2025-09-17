import { SearchParams } from './common';

export interface TExchangeRate {
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
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  effectiveDate: string;
  expiryDate: string;
  rateType: string;
  source: string;
  buyRate: number;
  sellRate: number;
}

export interface ExchangeRateFilters {
  search: string;
  status?: string;
  rateType?: string;
  source?: string;
  name?: string;
  code?: string;
  fromCurrency?: string;
  toCurrency?: string;
}

export interface CreateExchangeRateData {
  code: string;
  name: string;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  effectiveDate: string;
  expiryDate: string;
  rateType: string;
  source: string;
  buyRate: number;
  sellRate: number;
}

export interface UpdateExchangeRateData extends CreateExchangeRateData {
  id: number;
}

export interface ExchangeRateParams extends SearchParams<CreateExchangeRateData> {
  rateType?: string;
  source?: string;
  name?: string;
  code?: string;
  fromCurrency?: string;
  toCurrency?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}
