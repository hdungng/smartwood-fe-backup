import Stack from '@mui/material/Stack';
import InputLabel from './input-label';
import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { InputDatePickerProps } from './types';
import TextField from '@mui/material/TextField';
import { dateHelper, formatPatterns } from 'utils';

const InputDatePicker = ({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
  placeholder,
  fullWidth,
  slotProps,
  ...otherProps
}: InputDatePickerProps) => {
  const { label: labelProps, textField: textFieldProps, container: containerProps, ...otherSlotProps } = slotProps || {};

  return (
    <Stack
      spacing={1}
      sx={{
        ...containerProps?.sx,
        ...(fullWidth && {
          width: '100%'
        })
      }}
      {...containerProps}
    >
      <InputLabel label={label} required={required} {...labelProps} />

      <DatePicker
        format={formatPatterns.date}
        {...otherProps}
        value={dateHelper.normalizeDateValue(value)}
        onChange={(newValue) => onChange?.(dateHelper.normalizeDateValue(newValue))}
        enableAccessibleFieldDOMStructure={false}
        slotProps={{
          ...otherSlotProps,
          textField: {
            fullWidth,
            helperText,
            error,
            placeholder,
            ...textFieldProps
          }
        }}
        slots={{
          textField: TextField
        }}
      />
    </Stack>
  );
};

export default InputDatePicker;
