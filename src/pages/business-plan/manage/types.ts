import { CostFormProps } from './schema';

export enum BusinessPlanStep {
  Initialize,
  Supplier,
  Cost,
}

export type ManageURLParams = { contractCode: string; id: string };

export type CostKeySection = keyof CostFormProps;

export type SupplierDefaultValue = {
  goodType?: string | null;
  exportPort?: string | null;
};