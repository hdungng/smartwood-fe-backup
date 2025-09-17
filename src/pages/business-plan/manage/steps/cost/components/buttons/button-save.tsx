import React from 'react';
import { useSubmitState } from '../hook';
import { useFormContext } from 'react-hook-form';
import { CostFormProps } from '../../../../schema';
import { CustomButton } from 'components/buttons';

type Props = {
  label: string;
  id: string;
};

const ButtonSave = ({ label, id }: Props) => {
  const {
    formState: { isSubmitting }
  } = useFormContext<CostFormProps>();
  const { isEnabled } = useSubmitState();

  return (
    <CustomButton value={id} disabled={isSubmitting || !isEnabled} variant="contained" type="submit" color="primary">
      {label}
    </CustomButton>
  );
};

export default ButtonSave;