import { useFormContext } from 'react-hook-form';
import React from 'react';
import { WeighingSlipFormProps } from '../../../schema';
import { CustomButton } from 'components/buttons';

type Props = {
  id: string;
  label: string;
  disabled?: boolean;
};

const ButtonSave = ({ label, id, disabled }: Props) => {
  const {
    formState: { isSubmitting, isValid, isDirty }
  } = useFormContext<WeighingSlipFormProps>();

  return (
    <CustomButton
      value={id}
      disabled={isSubmitting || (!isValid && isDirty) || !isDirty || disabled}
      variant="contained"
      type="submit"
      color="primary"
    >
      {label}
    </CustomButton>
  );
};

export default ButtonSave;
