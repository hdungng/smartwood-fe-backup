import { Entity } from '../core';
import { ItemCode } from '../business-plan';

export type AnalysisBusinessPlanItem = {
  itemCode: ItemCode;
  amount: number
}

export type GetSummaryAnalysisBusinessPlanRequest = Entity<number> & {
  logistics: AnalysisBusinessPlanItem[];
  customs: AnalysisBusinessPlanItem[];
  finance: AnalysisBusinessPlanItem[];
  management: AnalysisBusinessPlanItem[];
  other: AnalysisBusinessPlanItem[];
}