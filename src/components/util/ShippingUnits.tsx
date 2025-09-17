import { Autocomplete, InputLabel, TextField } from '@mui/material';
import { useGlobal } from 'contexts/GlobalContext';
import { useIntl } from 'react-intl';
import { TShippingUnit } from 'types/shippingUnit';

const ShippingUnits = (props: {
  label?: string;
  labelKeySelect: keyof TShippingUnit;
  value: any;
  keyMatchSelect: keyof TShippingUnit;
  onChange: (value: any) => void;
  error?: string | null;
}) => {
  const { label = 'Đơn vị vận chuyển', keyMatchSelect, value, onChange, labelKeySelect, error } = props;
  const global = useGlobal();
  const { shippingUnits } = global;
  const intl = useIntl();

  return (
    <>
      <InputLabel>{label}</InputLabel>
      <Autocomplete
        options={shippingUnits}
        getOptionLabel={(option: any) => `${option?.[labelKeySelect]}`}
        value={shippingUnits.find((item: any) => `${item?.[keyMatchSelect]}` === `${value}`) || null}
        onChange={(e, newValue: any) => {
          onChange(newValue?.[keyMatchSelect]);
        }}
        renderInput={(params) => (
          <TextField {...params} placeholder={`Chọn ${label}`} error={!value && Boolean(error)} helperText={!value && error} />
        )}
        componentsProps={{
          popupIndicator: {
            title: intl.formatMessage({
              id: 'open_dropdown_text'
            })
          }
        }}
      />
    </>
  );
};

export default ShippingUnits;
