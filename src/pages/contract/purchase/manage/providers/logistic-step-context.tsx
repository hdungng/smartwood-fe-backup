import React from 'react';
import { SelectionOption } from 'types/common';

type LogisticStepContextProps = {
  unitOfMeasure?: string;
  onFetchRegion: (goodId: number) => Promise<SelectionOption[]>;
  onFetchSupplier: (goodId: number, region: string) => Promise<SelectionOption[]>;
  onFetchGoodType: (goodId: number, region: string, supplierId: number) => Promise<SelectionOption[]>;
};

export const LogisticStepContext = React.createContext({} as LogisticStepContextProps);

export const useLogisticStepContext = () => {
  const context = React.useContext(LogisticStepContext);
  if (!context) {
    throw new Error('useLogisticStepContext must be used within a ContractStepProvider');
  }
  return context;
};