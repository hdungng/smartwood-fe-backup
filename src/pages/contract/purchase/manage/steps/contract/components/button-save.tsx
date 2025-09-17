import { Button } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps } from '../../../schema';
import { useMemo } from 'react';
import { useAllRowsInitialized } from './hook';

type Props = {
  id: string;
  label: string;
};

const ButtonSave = ({ id, label }: Props) => {
  const {
    control,
    formState: { isSubmitting, isValid, isDirty }
  } = useFormContext<LogisticFormProps>();
  const { initialized } = useAllRowsInitialized();

  const logistics = useWatch<LogisticFormProps>({
    control,
    name: 'logistics'
  }) as LogisticFormProps['logistics'];

  const conditionRangeTotalWeight = useWatch<LogisticFormProps>({
    control,
    name: 'conditionRangeTotalWeight'
  }) as boolean;

  const conditionPriceAverage = useWatch<LogisticFormProps>({
    control,
    name: 'conditionPriceAverage'
  }) as boolean;

  const hasItemOverQuantity = useMemo(() => (logistics || []).some((item) => item.hasOverQuantity), [logistics]);

  const hasItemConflictDate = useMemo(() => (logistics || []).some((item) => item.hasConflict), [logistics]);

  const disabledBtnSubmit = useMemo(() => {
    return (
      (!isValid && isDirty) ||
      !isDirty ||
      !conditionRangeTotalWeight ||
      !conditionPriceAverage ||
      hasItemConflictDate ||
      hasItemOverQuantity ||
      !initialized
    );
  }, [
    isValid,
    isDirty,
    logistics,
    conditionRangeTotalWeight,
    conditionPriceAverage,
    hasItemConflictDate,
    initialized,
    hasItemOverQuantity
  ]);

  return (
    <Button value={id} loading={isSubmitting} disabled={disabledBtnSubmit} variant="contained" type="submit" color="primary">
      {label}
    </Button>
  );
};

export default ButtonSave;
