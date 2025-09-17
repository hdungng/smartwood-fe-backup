import { BusinessPlan, ItemCode } from 'services/business-plan';
import { CostDetailItemFormProps, OptionalCostDetailItemFormProps } from './schema';

export type ItemCurrencyConfigProps = {
  defaultValue?: number;
  value?: number;
  disabled?: boolean;
  disabledConversion?: boolean;
  factor?: number;
};

export type ItemPercentConfigProps = {
  defaultValue?: number;
  onCalculateByPercent?: (percent: number) => number;
}

export type ItemCodeConfigProps = {
  autoCalculate?: boolean;
  local?: ItemCurrencyConfigProps;
  foreign?: ItemCurrencyConfigProps;
  percent?: ItemPercentConfigProps
};

export const ITEM_CODE_CONFIGS: Record<ItemCode, ItemCodeConfigProps> = {
  AmsFee: {},
  BrokerageFee: { autoCalculate: true, local: { disabled: true }, foreign: { disabled: true } },
  ClearanceCost: {},
  CoFee: {},
  CustomsReceptionFee: {},
  CustomsSupervisionFee: {},
  CustomsTeamFee: {},
  DhlFee: {},
  DoFee: {},
  EarlyUnloadingFee: {},
  ExchangeRateCost: {},
  FumigationPerContainer: {},
  FumigationPerLot: {},
  InfrastructureFee: {},
  JumboBagFee: {},
  OtherCost: {},
  PalletFee: {},
  QuarantineFee: {},
  SealFee: {},

  InterestCost: { autoCalculate: true, local: { disabled: true }, foreign: { disabled: true } },
  TaxRefundCost: { autoCalculate: true, local: { disabled: true }, foreign: { disabled: true } },
  ThcFee: { autoCalculate: true, local: { disabled: true, disabledConversion: true } },
  VatInterestCost: { autoCalculate: true, local: { disabled: true }, foreign: { disabled: true } },

  TotalFreightEbs: {},
  TruckingCost: {},
  TtFee: { autoCalculate: true, local: { disabled: true, disabledConversion: true } },
  LocalCharges: { autoCalculate: true, local: { disabled: true }, foreign: { disabled: true } },

  QcCost: {},
  CommissionCost: { autoCalculate: true, local: { disabled: true, disabledConversion: true } },
  BrokerageCost: { autoCalculate: true, local: { disabled: true, disabledConversion: true } },
  GeneralManagementCost: { autoCalculate: true, local: { disabled: true, disabledConversion: true } }
};

export const calculateLocalCharges = (
  costItems: (CostDetailItemFormProps | OptionalCostDetailItemFormProps)[],
  businessPlanDetail?: BusinessPlan
) => {
  const estimatedTotalBookings = businessPlanDetail?.businessPlanTransactionInfoItem?.estimatedTotalBookings || 0;
  const estimatedTotalContainers = Math.ceil(businessPlanDetail?.businessPlanTransactionInfoItem?.estimatedTotalContainers || 0);

  const totalByTotalContainers =
    calculateTotalAmount(costItems, [
      ItemCode.EarlyUnloadingFee,
      ItemCode.ThcFee,
      ItemCode.SealFee,
      ItemCode.InfrastructureFee,
      ItemCode.CustomsSupervisionFee,
      ItemCode.FumigationPerContainer,
      ItemCode.QuarantineFee,
      ItemCode.PalletFee,
      ItemCode.JumboBagFee
    ]) * estimatedTotalContainers;
  const totalByTotalBookings =
    calculateTotalAmount(costItems, [ItemCode.FumigationPerLot, ItemCode.TtFee, ItemCode.CoFee, ItemCode.DoFee, ItemCode.AmsFee]) *
    estimatedTotalBookings;

  return totalByTotalContainers + totalByTotalBookings || 0;
};

export const calculateAmountCostManagement = (
  costItems: (CostDetailItemFormProps | OptionalCostDetailItemFormProps)[],
  itemCode: ItemCode,
  total?: number,
  rate?: number
) => {
  const manageCostAmountConversion = getAmountConversion(costItems, itemCode);
  if (manageCostAmountConversion === 0 || !rate || rate === 0 || !total || total === 0) {
    return 0;
  }

  return Number(manageCostAmountConversion) * Number(rate) * Number(total);
};

export const calculateAmountConversionCostManagement = (
  costItems: (CostDetailItemFormProps | OptionalCostDetailItemFormProps)[],
  itemCode: ItemCode,
  total?: number,
  rate?: number
) => {
  const manageCostAmount = getAmount(costItems, itemCode);
  if (!rate || rate === 0 || !total || total === 0) {
    return 0;
  }

  return Number(manageCostAmount) / Number(rate) / Number(total);
};

export const getAmount = (costItems: (CostDetailItemFormProps | OptionalCostDetailItemFormProps)[], itemCode: ItemCode) => {
  const item = costItems.find((item) => item.itemCode === itemCode);
  return item?.amount || 0;
};

export const getAmountConversion = (costItems: (CostDetailItemFormProps | OptionalCostDetailItemFormProps)[], itemCode: ItemCode) => {
  const item = costItems.find((item) => item.itemCode === itemCode);
  return item?.amountConversion || 0;
};

export const calculateTotalAmount = (costItems: (CostDetailItemFormProps | OptionalCostDetailItemFormProps)[], itemCodes: ItemCode[]) => {
  return itemCodes.reduce((total, itemCode) => {
    return total + getAmount(costItems, itemCode);
  }, 0);
};
