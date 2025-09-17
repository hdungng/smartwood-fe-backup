import InputText from './input-text';
import InputAutocomplete from './input-autocomplete';
import InputSelect from './input-select';
import InputDatePicker from './input-date-picker';
import InputNumber from './input-number';

export const Input = {
  Text: InputText,
  Select: InputSelect,
  Autocomplete: InputAutocomplete,
  DatePicker: InputDatePicker,
  Number: InputNumber
};

export * from './types';
