import { Controller, useFormContext } from 'react-hook-form';
import { Input, InputSelectProps } from 'components/@extended/input';
import { SelectionOption } from '../types/common';

export type RHFSelectProps<TData> = InputSelectProps<TData> & {
  name: string;
};

export const RHFSelect = <TData extends SelectionOption>({ name, ...other }: RHFSelectProps<TData>) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Input.Select {...field} error={!!error} helperText={error?.message || other?.helperText} {...other} />
      )}
    />
  );
};

export default RHFSelect;
