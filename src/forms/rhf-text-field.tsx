import { Controller, useFormContext } from 'react-hook-form';
import { Input, InputTextProps } from 'components/@extended/input';

export type RHFTextFieldProps = InputTextProps & {
  name: string;
};

export function RHFTextField({ name, ...otherProps }: RHFTextFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Input.Text {...field} error={!!error?.message} helperText={error?.message || otherProps?.helperText} {...otherProps} />
      )}
    />
  );
}
