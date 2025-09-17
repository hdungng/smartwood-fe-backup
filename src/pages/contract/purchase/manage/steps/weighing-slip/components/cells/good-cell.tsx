import { getActualTowingPropertyName } from './utils';
import { SelectionOption } from 'types/common';
import { ActualTowingCell } from './actual-towing-cell';
import { useGlobal } from 'contexts';
import { useEffect } from 'react';
import { useContractPurchaseManageContext } from '../../../../providers';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';
import { Input } from 'components/@extended/input';

const GoodCell = ({ index }: IndexProps) => {
  const { businessPlan } = useContractPurchaseManageContext();
  const { goodOptions } = useGlobal();
  const { control, setValue } = useFormContext<WeighingSlipFormProps>();

  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean;

  useEffect(() => {
    if (!businessPlan || goodOptions.length === 0 || saved) return;

    const defaultGood = goodOptions.find((good) => good.value === businessPlan?.draftPo?.goodId);
    setValue(getActualTowingPropertyName('good', index), (defaultGood || null) as SelectionOption);
  }, [businessPlan, goodOptions, saved]);

  const selectedGood = useWatch({
    control,
    name: getActualTowingPropertyName('good', index)
  }) as SelectionOption;

  return (
    <ActualTowingCell index={index}>
      <Input.Text value={selectedGood?.label} disabled />
    </ActualTowingCell>
  );
};

export default GoodCell;
