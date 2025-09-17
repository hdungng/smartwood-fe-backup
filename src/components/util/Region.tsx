import { Autocomplete, InputLabel, TextField } from '@mui/material';
import { CODE_REGION } from 'constants/code';
import { useIntl } from 'react-intl';
import { useGlobal } from '../../contexts';

type TRegion = {
  key: string;
  value: string;
};

const Region = (props: {
  label?: string;
  labelKeySelect?: keyof TRegion;
  value: any;
  keyMatchSelect?: keyof TRegion;
  onChange: (value: any) => void;
  error?: string | null;
}) => {
  const { label = 'Khu vực', keyMatchSelect = 'value', value, onChange, labelKeySelect = 'key', error } = props;
  const { configs: configList } = useGlobal();
  const list = configList?.find((item) => item.code === CODE_REGION)?.data ?? [];
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

export default Region;
