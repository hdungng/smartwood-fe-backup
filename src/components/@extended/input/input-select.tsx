import React from 'react';

import InputText from './input-text';
import { SelectionOption } from 'types/common';
import { InputSelectProps } from './types';
import { MenuItem } from '@mui/material';

const InputSelect = <TData extends SelectionOption>({
  options,
  defaultOptionLabel,
  labelOption = 'label',
  valueOption = 'value',
  onChange,
  renderLabel,
  slotProps = {},
  ...otherProps
}: InputSelectProps<TData>) => {
  const handleChange = (value: string | number) => onChange?.(value);

  const { item: itemSlotProps, ...inputProps } = slotProps || {};

  return (
    <InputText onChange={handleChange} slotProps={inputProps} {...otherProps} select>
      {defaultOptionLabel && (
        <MenuItem value="">
          <em>{defaultOptionLabel}</em>
        </MenuItem>
      )}
      {options.map((option: Dynamic) => (
        <MenuItem key={option[valueOption]} value={option[valueOption]} disabled={option.disabled} {...itemSlotProps}>
          {renderLabel ? renderLabel(option) : option[labelOption]}
        </MenuItem>
      ))}
    </InputText>
  );
};

export default InputSelect;
