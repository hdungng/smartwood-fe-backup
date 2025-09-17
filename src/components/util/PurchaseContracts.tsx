import { Autocomplete, InputLabel, TextField } from '@mui/material';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { actionGetPurchaseContracts, purchaseContractSelector, TPurchaseContractState } from 'redux/PurchaseContract';
import { PurchaseContract } from 'types/contracts/purchase/logistic';

export const PurchaseContracts = ({
  label = 'Số hợp đồng',
  keyMatchSelect = 'id',
  value,
  onChange,
  labelKeySelect = 'code',
  error
}: {
  label?: string;
  labelKeySelect?: keyof PurchaseContract;
  value: any;
  keyMatchSelect?: keyof PurchaseContract;
  error?: string | null;
  onChange: (value: any) => void;
}) => {
  const dispatch = useDispatch();
  const { purchaseContracts }: TPurchaseContractState = useSelector(purchaseContractSelector);
  const intl = useIntl();
  useEffect(() => {
    dispatch(actionGetPurchaseContracts());
  }, []);

  return (
    <>
      <InputLabel>{label}</InputLabel>
      <Autocomplete
        options={purchaseContracts}
        getOptionLabel={(option: any) => `${option?.[labelKeySelect]}`}
        value={purchaseContracts.find((item: any) => `${item?.[keyMatchSelect]}` === `${value}`) || null}
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
