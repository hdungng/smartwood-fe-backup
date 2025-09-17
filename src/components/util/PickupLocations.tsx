import { Autocomplete, InputLabel, TextField } from '@mui/material';
import { CODE_DESTINATION } from 'constants/code';
import { useIntl } from 'react-intl';
import { useGlobal } from 'contexts';

type TPickupLocations = {
  key: string;
  value: string;
};

const PickupLocations = (props: {
  label?: string;
  labelKeySelect?: keyof TPickupLocations;
  value: any;
  keyMatchSelect?: keyof TPickupLocations;
  onChange: (value: any) => void;
  error?: string | null;
}) => {
  const { label = 'Chọn điểm nhận hàng', keyMatchSelect = 'key', value, onChange, labelKeySelect = 'value', error } = props;
  const { configs: configList } = useGlobal();
  const list = configList?.find((item) => item.code === CODE_DESTINATION)?.data ?? [];
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

export default PickupLocations;
