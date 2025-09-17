import { createContext, useContext } from 'react';
import { BusinessPlan } from 'services/business-plan';
import { BusinessPlanStep } from './types';

type BusinessPlanManageContextProps = {
  mode: PageMode;
  currentStep: BusinessPlanStep;
  fieldOnlyView: boolean;
  totalWeightSupplier: number;
  setTotalWeightSupplier: (quantity: number) => void;
  totalCostSupplier: number;
  setTotalCostSupplier: (quantity: number) => void;
  onRefetchDetail: (id: number) => Promise<void>;
  businessPlan?: BusinessPlan;
};

export const BusinessPlanManageContext = createContext<BusinessPlanManageContextProps | undefined>(undefined);

export const useBusinessPlanManageContext = () => {
  const context = useContext(BusinessPlanManageContext);
  if (!context) {
    throw new Error('useBusinessPlanManageContext must be used within a Provider');
  }
  return context;
};
