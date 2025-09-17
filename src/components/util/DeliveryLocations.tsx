import { Autocomplete, InputLabel, TextField } from '@mui/material';
import { CODE_EXPORT_PORT } from 'constants/code';
import { useIntl } from 'react-intl';
import { useGlobal } from 'contexts';

type TDeliveryLocations = {
  key: string;
  value: string;
};

const DeliveryLocations = (props: {
  label?: string;
  labelKeySelect?: keyof TDeliveryLocations;
  value: any;
  keyMatchSelect?: keyof TDeliveryLocations;
  onChange: (value: any) => void;
  error?: string | null;
}) => {
  const { label = 'Chọn điểm giao hàng', keyMatchSelect = 'value', value, onChange, labelKeySelect = 'key', error } = props;
  const { configs: configList} = useGlobal()
  const list = configList?.find((item) => item.code === CODE_EXPORT_PORT)?.data ?? [];
  const intl = useIntl();

  return (
    <>
      <InputLabel>{label}</InputLabel>
      <Autocomplete
        options={list}
        getOptionLabel={(option: any) => `${option?.[labelKeySelect]}`}
        value={list.find((item: any) => `${item?.[keyMatchSelect]}` === `${value}`) || null}
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

export default DeliveryLocations;
