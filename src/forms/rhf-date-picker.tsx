import { Controller, useFormContext } from 'react-hook-form';
import { Input, InputDatePickerProps } from 'components/@extended/input';
import FieldHelperText from './field-helper-text';

export type RHFDatePickerProps = InputDatePickerProps & {
  name: string;
};

export function RHFDatePicker({ name, error, ...otherProps }: RHFDatePickerProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error: errorState } }) => (
        <Input.DatePicker
          {...field}
          error={!!errorState?.message || !!error}
          helperText={<FieldHelperText error={errorState?.message} helperText={otherProps?.helperText} />}
          {...otherProps}
        />
      )}
    />
  );
}
