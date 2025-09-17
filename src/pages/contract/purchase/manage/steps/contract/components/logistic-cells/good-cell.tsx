import React from 'react';
import { LogisticCell } from './logistic-cell';
import { useGlobal } from 'contexts';
import { useContractPurchaseManageContext } from '../../../../providers';
import { Input } from 'components/@extended/input';

const GoodCell = ({ index }: IndexProps) => {
  const { selectedGoodId } = useContractPurchaseManageContext();
  const { goodMap } = useGlobal();

  return (
    <LogisticCell index={index}>
      <Input.Text value={goodMap.get(selectedGoodId)?.label || ''} readOnly />
    </LogisticCell>
  );
};

export default GoodCell;
