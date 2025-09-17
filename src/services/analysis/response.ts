export type GetSummaryAnalysisBusinessPlanResponse = {
  businessPlanId: number;
  totalRevenueExcludingVAT: number;
  actualBusinessProfit: number;
  profitMarginPercentage: number;
  breakEvenPrice: number;
  secondaryCurrency: string;
  totalRevenueExcludingVATSecondaryCurrency: number;
  breakEvenPriceSecondaryCurrency: number;
  actualBusinessProfitSecondaryCurrency: number;
  profitMarginPercentageSecondaryCurrency: number;
  unit: string;
  totalRevenueExcludingVATSecondaryCurrencyPerUnit: number;
  actualBusinessProfitSecondaryCurrencyPerUnit: number;
};
