import { useFormContext, useWatch } from 'react-hook-form';
import { SupplierFormProps } from '../../../schema';
import { useMemo } from 'react';
import { CustomButton } from 'components/buttons';

type Props = {
  label: string;
  id: string;
};

const ButtonSave = ({ label, id }: Props) => {
  const {
    control,
    formState: { isValid, isSubmitting }
  } = useFormContext<SupplierFormProps>();

  const conditionRangeTotalWeight = useWatch({
    control,
    name: 'conditionRangeTotalWeight'
  }) as boolean;

  const hasDuplicateRow = useWatch({
    control,
    name: 'hasDuplicateRow'
  }) as boolean;

  const btnDisabled = useMemo(
    () => !isValid || !conditionRangeTotalWeight || hasDuplicateRow || isSubmitting,
    [isValid, conditionRangeTotalWeight, hasDuplicateRow, isSubmitting]
  );

  return (
    <CustomButton value={id} disabled={btnDisabled} variant="contained" type="submit" color="primary">
      {label}
    </CustomButton>
  );
};

export default ButtonSave;
