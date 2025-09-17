import { Button } from '@mui/material';
import React from 'react';
import { useSubmitState } from '../hook';
import { useFormContext } from 'react-hook-form';
import { CostFormProps } from '../../../../schema';
import { StepActionHandler } from 'components/@extended/Steps';
import { useConfirmLeave } from 'hooks';

type Props = StepActionHandler;

const ButtonSave = ({ onBack }: Props) => {
  const {
    formState: { isSubmitting }
  } = useFormContext<CostFormProps>();
  const { hasFieldChanged } = useSubmitState();
  const { confirmLeave } = useConfirmLeave(hasFieldChanged);

  const handleBack = async () => {
    await confirmLeave(() => onBack?.());
  };

  return (
    <Button onClick={handleBack} disabled={isSubmitting}>
      Quay lại
    </Button>
  );
};

export default ButtonSave;
