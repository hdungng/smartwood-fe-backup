import type { TextFieldProps } from '@mui/material/TextField';
import { AutocompleteProps, StackProps, TypographyProps, MenuItemProps } from '@mui/material';
import { DatePickerProps } from '@mui/lab';
import { Dayjs } from 'dayjs';
import React, { ReactNode } from 'react';
import { NumericFormatProps as BaseNumericFormatProps } from 'react-number-format';

export type MaxLengthInputProps = {
  maxLength?: number;
  showLength?: boolean;
};

export type BaseInputProps = MaxLengthInputProps & TextFieldProps;

export type InputLabelProps = {
  label?: string;
  required?: boolean;
};

export type InputLabelSlotProps = Omit<TypographyProps, 'label'>;

export type FormInputLabelSlotProps = {
  container?: StackProps;
  label?: InputLabelSlotProps;
};

export type InputTextProps = Omit<BaseInputProps, 'onChange' | 'type'> &
  InputLabelProps & {
    onChange?: (value: string | number) => void;
    required?: boolean;
    readOnly?: boolean;
    slotProps?: Pick<BaseInputProps, 'slotProps'> & FormInputLabelSlotProps;
  };

export type NumericFormatProps = Pick<
  BaseNumericFormatProps,
  | 'thousandSeparator'
  | 'decimalScale'
  | 'decimalSeparator'
  | 'allowLeadingZeros'
  | 'allowNegative'
  | 'allowedDecimalSeparators'
  | 'max'
  | 'min'
  | 'isAllowed'
  | 'onBlur'
>;

export type InputNumberProps = Omit<InputTextProps, 'onChange'> & {
  onChange?: (value: string) => void;
  slotProps?: Pick<InputTextProps, 'slotProps'> & {
    number?: NumericFormatProps;
  };
};

export type NumberFormatProps = NumericFormatProps & {
  onChange: (event: { target: { value: string } }) => void;
};

export type InputAutocompleteProps<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined
> = Omit<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, 'renderInput' | 'onChange'> &
  InputLabelProps & {
    placeholder?: string;
    error?: boolean;
    helperText?: string;
    fullWidth?: boolean;
    onChange?: (value: T) => void;
    onSearch?: (value: string) => Promise<T[]>;
    slotProps?: Pick<AutocompleteProps<Dynamic, undefined, undefined, undefined>, 'slotProps'> &
      FormInputLabelSlotProps & {
        textfield?: TextFieldProps;
      };
  };

export type InputSelectProps<TData> = Omit<InputTextProps, 'onChange'> & {
  options: TData[];
  defaultOptionLabel?: string;
  labelOption?: string;
  valueOption?: string;
  defaultOption?: boolean;
  onChange?: (data: string | number) => void;
  renderLabel?: (data: TData) => React.ReactNode;
  slotProps?: Pick<InputTextProps, 'slotProps'> & {
    item?: MenuItemProps;
  };
};

export type DatePickerDayjs = DatePickerProps<Dayjs>;

export type InputDatePickerProps = DatePickerDayjs &
  InputLabelProps & {
    placeholder?: string;
    error?: boolean;
    helperText?: ReactNode;
    fullWidth?: boolean;
    customProps?: FormInputLabelSlotProps & {
      textField?: TextFieldProps;
    };
    // slotProps?: Pick<DatePickerDayjs, 'slotProps'> &
  };
