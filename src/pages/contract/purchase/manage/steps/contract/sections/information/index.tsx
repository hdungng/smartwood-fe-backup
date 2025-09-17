import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Field } from 'forms';
import { useEffect } from 'react';
import { SelectionOption } from 'types/common';
import { SaleContractMetaData } from '../../../../types';
import { ListSaleContractResponse } from 'services/contract';
import { useContractPurchaseManageContext } from '../../../../providers';
import { SMARTWOOD_SELECTIONS } from 'constants/smartwood';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps } from '../../../../schema';

type Props = {
  saleContracts: ListSaleContractResponse[];
  saleContractOptions: SelectionOption[];
};

const InformationSection = ({ saleContracts, saleContractOptions }: Props) => {
  const { fieldOnlyView, onChangeSaleContract, mode, purchaseContract } = useContractPurchaseManageContext();
  const { control } = useFormContext<LogisticFormProps>();

  const selectedSaleContract = useWatch({
    control,
    name: 'saleContract'
  }) as Nullable<SelectionOption<SaleContractMetaData>>;

  useEffect(() => {
    if (!selectedSaleContract || saleContracts.length === 0) return;

    const currentSaleContract = saleContracts.find((item) => item.id === selectedSaleContract.value);
    onChangeSaleContract(currentSaleContract);
  }, [selectedSaleContract, saleContracts]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2, mt: 4 }}>
        Kế hoạch đóng hàng
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
          <Field.Autocomplete
            options={saleContractOptions}
            name="saleContract"
            label="Mã hợp đồng bán"
            required
            readOnly={fieldOnlyView || saleContracts.length === 0 || (mode === 'create' && !!purchaseContract) || mode === 'edit'}
            isOptionEqualToValue={(option, value) => option.value === value.value}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
          <Field.Text
            readOnly={fieldOnlyView || (mode === 'create' && !!purchaseContract) || mode === 'edit'}
            required
            name="code"
            label="Số hợp đồng"
            maxLength={100}
            showLength={false}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
          <Field.DatePicker readOnly={fieldOnlyView} required name="date" label="Ngày ký hợp đồng" placeholder="Chọn ngày ký hợp đồng" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
          <Field.Autocomplete
            readOnly={fieldOnlyView}
            options={SMARTWOOD_SELECTIONS}
            name="buyer"
            label="Tên bên mua"
            placeholder="Chọn bên mua"
            required
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default InformationSection;
