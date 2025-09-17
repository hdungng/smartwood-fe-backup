import React, { useMemo } from 'react';

import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import InputLabel from './input-label';

import type { InputTextProps } from './types';
import Stack from '@mui/material/Stack';

const InputText = React.forwardRef(
  (
    {
      maxLength,
      label,
      value,
      onChange,
      readOnly,
      placeholder,
      required,
      showLength = true,
      fullWidth = true,
      ...restProps
    }: InputTextProps,
    ref
  ) => {
    const showMaxLengthText = useMemo(() => !!maxLength && showLength, [maxLength, showLength]);

    return (
      <Stack
        spacing={1}
        sx={{
          ...restProps?.slotProps?.container?.sx,
          ...(fullWidth && {
            width: '100%'
          })
        }}
        {...restProps?.slotProps?.container}
      >
        <InputLabel label={label} required={required} {...restProps?.slotProps?.label} />
        <TextField
          fullWidth={fullWidth}
          variant="outlined"
          inputRef={ref}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          {...restProps}
          placeholder={placeholder || label}
          slotProps={{
            ...restProps?.slotProps,
            htmlInput: {
              readOnly,
              maxLength,
              autoComplete: 'off',
              ...restProps?.slotProps?.htmlInput
            },
            inputLabel: {
              ...restProps?.slotProps?.inputLabel,
              shrink: false
            },
            input: {
              ...restProps?.slotProps?.input,
              endAdornment:
                restProps?.slotProps?.input || showMaxLengthText ? (
                  <>
                    {showMaxLengthText && (
                      <InputAdornment position="end">
                        <Typography
                          variant="caption"
                          component="span"
                          sx={{
                            color: 'text.secondary'
                          }}
                        >
                          {`${value}`.length} / {maxLength}
                        </Typography>
                      </InputAdornment>
                    )}
                    {(restProps?.slotProps?.input as Dynamic)?.endAdornment}
                  </>
                ) : null
            }
          }}
        />
      </Stack>
    );
  }
);

export default InputText;
