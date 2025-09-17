import { CircularProgress, Autocomplete, TextField, Grid, Stack, InputLabel, Typography, Paper, Box, Divider } from '@mui/material';
import { useIntl } from 'react-intl';
import { FormikProps } from 'formik';
import { LogisticFormValues } from '../../types';
import { SaleContractOption } from 'types/sale-contract';

interface ContractInfoSectionProps {
  formik: FormikProps<LogisticFormValues>;
  saleContracts: SaleContractOption[];
  isLoadingCustomer: boolean;
  selectedSaleContract: any;
  maxCount: number;
  onSaleContractChange: (value: any) => void;
  onBookingNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ContractInfoSection = ({
  formik,
  saleContracts,
  isLoadingCustomer,
  selectedSaleContract,
  maxCount,
  onSaleContractChange,
  onBookingNumberChange
}: ContractInfoSectionProps) => {
  const intl = useIntl();

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, flexGrow: 1 }}>
          {intl.formatMessage({ id: 'contract_information' }) || 'Thông tin hợp đồng'}
        </Typography>
        <Divider sx={{ flexGrow: 1, ml: 2 }} />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'sale_contract_number' })}</InputLabel>
            <Autocomplete
              options={saleContracts}
              getOptionLabel={(option) => option.label || ''}
              value={saleContracts.find((option) => option.value === Number(formik.values.saleContractId)) || null}
              loading={isLoadingCustomer}
              disabled={isLoadingCustomer}
              onChange={(_, value) => onSaleContractChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="medium"
                  placeholder={intl.formatMessage({ id: 'contract_selected' })}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingCustomer && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'booking_number' })}</InputLabel>
            <TextField
              id="bookingNumber"
              name="bookingNumber"
              size="medium"
              placeholder="123456"
              fullWidth
              value={formik.values.bookingNumber}
              disabled={isLoadingCustomer}
              onChange={onBookingNumberChange}
              error={formik.touched.bookingNumber && Boolean(formik.errors.bookingNumber)}
              helperText={formik.touched.bookingNumber && formik.errors.bookingNumber}
              InputProps={{
                endAdornment: isLoadingCustomer && <CircularProgress size={20} />,
              }}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'code_booking' })}</InputLabel>
            <TextField
              slotProps={{ input: { readOnly: true } }}
              id="codeBooking"
              name="codeBooking"
              size="medium"
              placeholder="CM001-NAM-FX99-123456"
              fullWidth
              value={formik.values.codeBooking}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.codeBooking && Boolean(formik.errors.codeBooking)}
              helperText={formik.touched.codeBooking && formik.errors.codeBooking}
              disabled={isLoadingCustomer}
              sx={{ 
                '& .MuiInputBase-input': { 
                  backgroundColor: 'grey.50',
                  cursor: isLoadingCustomer ? 'wait' : 'not-allowed'
                } 
              }}
              InputProps={{
                endAdornment: isLoadingCustomer && <CircularProgress size={20} />,
              }}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>
              {intl.formatMessage({ id: 'number_of_cont' })}{' '}
              {selectedSaleContract && (
                <Typography variant="caption" sx={{ color: 'primary.main' }}>
                  (Tối đa: {maxCount} cont)
                </Typography>
              )}
            </InputLabel>
            <TextField
              id="containerQuantity"
              name="containerQuantity"
              type="number"
              size="medium"
              placeholder={intl.formatMessage({ id: 'number_of_cont' })}
              fullWidth
              value={formik.values.containerQuantity ?? ''}
              inputProps={{ min: 0, max: selectedSaleContract ? maxCount : undefined }}
              disabled={isLoadingCustomer}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  formik.setFieldValue('containerQuantity', undefined);
                  return;
                }
                let next = Number(raw);
                if (!Number.isFinite(next)) next = 0;
                if (selectedSaleContract && maxCount > 0 && next > maxCount) next = maxCount;
                if (next < 0) next = 0;
                formik.setFieldValue('containerQuantity', next);
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.containerQuantity && Boolean(formik.errors.containerQuantity)}
              helperText={formik.touched.containerQuantity && formik.errors.containerQuantity}
              InputProps={{
                endAdornment: isLoadingCustomer && <CircularProgress size={20} />,
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};