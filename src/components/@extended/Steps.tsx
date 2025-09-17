import Stepper, { StepperProps } from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import React, { Fragment, ReactNode } from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Button, StackProps } from '@mui/material';
import { CustomButton } from 'components/buttons';

export type StepperInfoProps = {
  key: number;
  label: string;
  component: React.ReactNode;
};

export type StepTriggerAction = 'next' | 'back' | 'complete';

type StepsProps = {
  steps: StepperInfoProps[];
  activeStep?: number;
  slotProps?: {
    root?: BoxProps;
    stepper?: StepperProps;
    step?: React.ComponentProps<typeof Step>;
    stepLabel?: React.ComponentProps<typeof StepLabel>;
  };
  slots?: {
    control?: (step: StepperInfoProps) => ReactNode;
  };
};

export const Steps = ({ steps, activeStep, slotProps = {}, slots = {} }: StepsProps) => {
  return (
    <Box {...slotProps?.root}>
      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }} {...slotProps?.stepper}>
        {steps.map((step, index) => (
          <Step key={`step-${step.key}`} {...slotProps?.step}>
            {slots?.control?.(step) || <StepLabel {...slotProps?.stepLabel}>{step.label}</StepLabel>}
          </Step>
        ))}
      </Stepper>

      {steps.map((step) => (
        <Fragment key={`step-component-${step.key}`}>{step.key === activeStep && step.component}</Fragment>
      ))}
    </Box>
  );
};

export type StepActionHandler = {
  onNext?: AsyncVoidFunction | VoidFunction | ((data?: DynamicObject) => Promise<void> | void);
  onBack?: AsyncVoidFunction | VoidFunction;
};

type StepActionProps = StepActionHandler & {
  label?: {
    back?: string;
    next?: string;
  };
  slots?: {
    back?: ReactNode;
    next?: ReactNode;
  };
  slotProps?: {
    root?: StackProps;
    back?: Omit<React.ComponentProps<typeof Button>, 'onClick'>;
    next?: Omit<React.ComponentProps<typeof Button>, 'onClick'>;
  };
};

export const StepAction = (props: StepActionProps) => {
  const { onNext, onBack = () => {}, label = {}, slots = {}, slotProps = {} } = props;

  return (
    <Stack direction="row" justifyContent="space-between" mt={4} {...slotProps?.root}>
      {slots?.back || (
        <CustomButton onClick={onBack} onEnter={onBack} {...slotProps?.back}>
          {label?.back || 'Quay lại'}
        </CustomButton>
      )}

      {slots?.next || (
        <CustomButton variant="contained" color="primary" {...slotProps?.next} {...(slotProps?.next?.type !== 'submit' && { onClick: onNext })}>
          {label?.next || 'Tiếp tục'}
        </CustomButton>
      )}
    </Stack>
  );
};
