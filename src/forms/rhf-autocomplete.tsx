import { Controller, useFormContext } from 'react-hook-form';
import { Input, InputAutocompleteProps } from 'components/@extended/input';

export type RHFAutocompleteProps<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined
> = InputAutocompleteProps<T, Multiple, DisableClearable, FreeSolo> & {
  name: string;
};

export const RHFAutocomplete = <
  T,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false
>({
  name,
  ...other
}: RHFAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Input.Autocomplete {...other} {...field} error={!!error?.message} helperText={error?.message || other?.helperText} />
      )}
    />
  );
};

export default RHFAutocomplete;
