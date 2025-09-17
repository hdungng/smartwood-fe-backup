import { Controller, useFormContext } from 'react-hook-form';
import { Input, InputNumberProps } from 'components/@extended/input';
import { regex } from '../utils';
import FieldHelperText from './field-helper-text';

export type RHFNumberFieldProps = InputNumberProps & {
  name: string;
};

export function RHFNumberField({ name, error, ...otherProps }: RHFNumberFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, ...otherField }, fieldState: { error: errorState } }) => (
        <Input.Number
          error={!!errorState?.message || error}
          {...otherProps}
          {...otherField}
          helperText={<FieldHelperText error={errorState?.message} helperText={otherProps?.helperText} />}
          onChange={(value) => {
            if (!value) {
              onChange(null);
              return;
            }
            const number = Number(value.replace(regex.REPLACE_NUMBER, ''));
            onChange(number);
          }}
        />
      )}
    />
  );
}
