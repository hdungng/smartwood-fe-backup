import { Autocomplete, InputLabel, TextField } from '@mui/material';
import { useGlobal } from 'contexts/GlobalContext';
import { useIntl } from 'react-intl';
import { TGood } from 'types/good';

const Goods = (props: {
  label?: string;
  labelKeySelect: keyof TGood;
  value: any;
  keyMatchSelect: keyof TGood;
  onChange: (value: any) => void;
  error?: string | null;
}) => {
  const { label = 'Loại hàng hóa', keyMatchSelect, value, onChange, labelKeySelect, error } = props;
  const global = useGlobal();
  const { goods } = global;
  const intl = useIntl();

  return (
    <>
      <InputLabel>{label}</InputLabel>
      <Autocomplete
        options={goods}
        getOptionLabel={(option: any) => `${option?.[labelKeySelect]}`}
        value={goods.find((good: any) => `${good?.[keyMatchSelect]}` === `${value}`) || null}
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

export default Goods;
