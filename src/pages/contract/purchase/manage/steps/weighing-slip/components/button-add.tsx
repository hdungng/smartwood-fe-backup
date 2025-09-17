import Button from '@mui/material/Button';
import React, { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ActualTowingFormProps, WeighingSlipFormProps } from '../../../schema';
import { useContractPurchaseManageContext } from '../../../providers';

type Props = {
  onClick: VoidFunction;
};

const ButtonAdd = ({ onClick }: Props) => {
  const {
    control,
    formState: { isSubmitting }
  } = useFormContext<WeighingSlipFormProps>();
  const { globalForm } = useContractPurchaseManageContext();

  const actualTowing = useWatch({
    control,
    name: 'actualTowing'
  }) as ActualTowingFormProps[];

  const totalLogisticWeight = useMemo(() => globalForm?.logistic?.totalWeight || 0, [globalForm]);

  const totalActualWeight = useMemo(() => {
    return actualTowing.reduce((acc, cur) => acc + (cur.actualWeight || 0) + (cur.coverageQuantity || 0), 0);
  }, [actualTowing]);

  const btnDisabled = useMemo(
    () => isSubmitting || (totalActualWeight >= totalLogisticWeight),
    [isSubmitting, totalLogisticWeight, totalActualWeight]
  );

  return (
    <Button variant="contained" onClick={onClick} disabled={btnDisabled}>
      Thêm
    </Button>
  );
};

export default ButtonAdd;