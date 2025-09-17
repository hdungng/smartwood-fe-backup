import { createContext, useContext } from 'react';
import { ListSaleContractResponse, PurchaseContractDetailResponse } from 'services/contract';
import { SelectionOption } from 'types/common';
import { FormProps, LogisticItemFormProps } from '../schema';
import { BusinessPlan } from 'services/business-plan';
import { CodeBookingMetaData } from '../types';

type ContractPurchaseManageContextProps = {
  mode: PageMode;
  fieldOnlyView: boolean;
  purchaseContract?: PurchaseContractDetailResponse;
  onRefetchDetail: (id: number) => Promise<void>;
  onChangeSaleContract: (saleContract?: ListSaleContractResponse) => void;
  selectedGoodId: number;

  logistics?: LogisticItemFormProps[];
  codeBookingOptions: SelectionOption<CodeBookingMetaData>[];
  saleContract?: ListSaleContractResponse;
  globalForm?: FormProps;
  businessPlan?: BusinessPlan;
  onChangeBusinessPlan: (businessPlan?: BusinessPlan) => void;
  defaultWeightContainer?: number;
};

export const ContractPurchaseManageContext = createContext<ContractPurchaseManageContextProps | undefined>(undefined);

export const useContractPurchaseManageContext = () => {
  const context = useContext(ContractPurchaseManageContext);
  if (!context) {
    throw new Error('useContractPurchaseManageContext must be used within a Provider');
  }
  return context;
};
