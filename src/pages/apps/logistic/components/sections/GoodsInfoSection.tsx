import { CircularProgress, TextField, Grid, Stack, InputLabel, Typography, Paper, Box, Divider } from '@mui/material';
import { useIntl } from 'react-intl';
import { FormikProps } from 'formik';
import { LogisticFormValues } from '../../types';
import { CODE_QUALITY_TYPE } from 'constants/code';

interface GoodsInfoSectionProps {
  formik: FormikProps<LogisticFormValues>;
  selectedSaleContract: any;
  isLoadingCustomer: boolean;
  getGoodNameById: (id?: number) => string;
  mapConfigObject: (code: any, value?: string) => string | undefined;
}

export const GoodsInfoSection = ({
  formik,
  selectedSaleContract,
  isLoadingCustomer,
  getGoodNameById,
  mapConfigObject
}: GoodsInfoSectionProps) => {
  const intl = useIntl();

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, flexGrow: 1 }}>
          {intl.formatMessage({ id: 'goods_information' }) || 'Thông tin hàng hóa'}
        </Typography>
        <Divider sx={{ flexGrow: 1, ml: 2 }} />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'goods_name' })}</InputLabel>
            <TextField
              id="goodId"
              name="goodId"
              size="medium"
              placeholder={intl.formatMessage({ id: 'goods_name' })}
              fullWidth
              value={selectedSaleContract?.goodName || getGoodNameById(selectedSaleContract?.goodId || formik.values.goodId) || ''}
              disabled={isLoadingCustomer}
              inputProps={{ readOnly: true }}
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

        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <Stack spacing={1}>
            <InputLabel sx={{ fontWeight: 500 }}>{intl.formatMessage({ id: 'quality_type', defaultMessage: 'Quality Type' })}</InputLabel>
            <TextField
              id="goodType"
              name="goodType"
              size="medium"
              placeholder={intl.formatMessage({ id: 'quality_type', defaultMessage: 'Quality Type' })}
              fullWidth
              value={mapConfigObject(CODE_QUALITY_TYPE, formik.values.goodType) || mapConfigObject(CODE_QUALITY_TYPE, selectedSaleContract?.goodType)}
              disabled={isLoadingCustomer}
              inputProps={{ readOnly: true }}
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
      </Grid>
    </Paper>
  );
};