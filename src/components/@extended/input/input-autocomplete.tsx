import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { InputAutocompleteProps } from './types';
import InputLabel from './input-label';
import { ForwardedRef, forwardRef, JSX } from 'react';

const InputAutocompleteBase = <
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  {
    onChange,
    placeholder,
    error,
    label,
    required,
    helperText,
    fullWidth,
    onSearch,
    ...otherProps
  }: InputAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
  ref: ForwardedRef<HTMLDivElement>
) => {
  return (
    <Stack
      spacing={1}
      sx={{
        ...otherProps?.slotProps?.container?.sx,
        ...(fullWidth && {
          width: '100%'
        })
      }}
      {...otherProps?.slotProps?.container}
    >
      <InputLabel label={label} required={required} {...otherProps?.slotProps?.label} />
      <Autocomplete
        noOptionsText="Không tìm thấy kết quả"
        {...otherProps}
        onChange={(_, newValue) => onChange?.(newValue as T)}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder || label}
            error={error}
            helperText={helperText}
            inputRef={ref}
            {...otherProps?.slotProps?.textfield}
          />
        )}
        slotProps={{
          popupIndicator: {
            title: 'Mở',
            ...otherProps?.slotProps?.popupIndicator
          },
          ...otherProps?.slotProps
        }}
      />
    </Stack>
  );
};

const InputAutocomplete = forwardRef(InputAutocompleteBase) as <
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>(
  props: InputAutocompleteProps<T, Multiple, DisableClearable, FreeSolo> & { ref?: ForwardedRef<HTMLDivElement> }
) => JSX.Element;

export default InputAutocomplete;
