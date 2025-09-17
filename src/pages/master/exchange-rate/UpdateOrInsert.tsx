import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project imports
import { openSnackbar } from 'api/snackbar';
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import useExchangeRate from 'api/exchange-rate';

// third-party
import { useFormik } from 'formik';

// types
import { SnackbarProps } from 'types/snackbar';
import { CreateExchangeRateData, TExchangeRate } from 'types/exchange-rate';
import { Status, statusOptions, getStatusLabel, getStatusColor } from 'constants/status';

// validation
import { exchangeRateSchema } from 'validations/exchange-rate.scheme';

// constants
import { CURRENCY_OPTIONS, RATE_TYPE_OPTIONS, SOURCE_OPTIONS } from 'sections/apps/exchange-rate/MetaData';

interface ExchangeRateUpdateOrInsertProps {
  mode?: 'create' | 'edit' | 'view';
}
const getCurrentDateTime = () => {
  const now = new Date();
  // Chuyển đổi sang định dạng YYYY-MM-DDTHH:MM
  return now.toISOString().slice(0, 16);
};
export default function ExchangeRateUpdateOrInsert({ mode = 'create' }: ExchangeRateUpdateOrInsertProps) {
  const navigate = useNavigate();
  const DEFAULT_CURRENCY = CURRENCY_OPTIONS[0]?.value || '';

  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const { getById, create, update } = useExchangeRate();

  const isEditing = mode === 'edit' && !!id;
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  const shouldFetchExchangeRate = (isEditing || isViewing) && !!id;
  const exchangeRateId = shouldFetchExchangeRate ? Number(id) : 0;

  // Use the getById hook for fetching data
  const { exchangeRate: exchangeRateData, exchangeRateLoading: fetchLoading, exchangeRateError: fetchError } = getById(exchangeRateId);

  const formik = useFormik({
    initialValues: {
  code: '',
  name: '',
  fromCurrency: DEFAULT_CURRENCY, // Thêm giá trị mặc định
  toCurrency: DEFAULT_CURRENCY,
  exchangeRate: 0,
  effectiveDate: getCurrentDateTime(),
  expiryDate: getCurrentDateTime(),
  rateType: RATE_TYPE_OPTIONS[0]?.value || '',
  source: SOURCE_OPTIONS[0]?.value || '',
  buyRate: 0,
  sellRate: 0,
  status: Status.ACTIVE
} as CreateExchangeRateData & { status: number },
    validationSchema: exchangeRateSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const { status, ...submitData } = values; // Remove status from create/update data

        if (isCreating) {
          await create(submitData);
        } else if (isEditing && exchangeRateData && id) {
          await update(Number(id), { id: Number(id), ...submitData });
        }

        const message = isCreating ? 'Tỷ giá đã được tạo thành công' : 'Tỷ giá đã được cập nhật thành công';
        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'success' }
        } as SnackbarProps);

        navigate('/master/exchange-rate');
      } catch (error) {
        console.error('Error saving exchange rate:', error);
        openSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi lưu dữ liệu tỷ giá',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    }
  });
// useEffect(() => {
//     console.log('Chế độ hiện tại:', mode);
//   }, [mode]);
//   useEffect(() => {
//     console.log('Lỗi biểu mẫu:', formik.errors);
//     console.log('Giá trị biểu mẫu:', formik.values);

//   }, [formik.errors, formik.values]);
  useEffect(() => {
    if (exchangeRateData && shouldFetchExchangeRate) {
      formik.setValues({
        code: exchangeRateData.code || '',
        name: exchangeRateData.name || '',
        fromCurrency: exchangeRateData.fromCurrency || '',
        toCurrency: exchangeRateData.toCurrency || '',
        exchangeRate: exchangeRateData.exchangeRate || 0,
        effectiveDate: exchangeRateData.effectiveDate || '',
        expiryDate: exchangeRateData.expiryDate || '',
        rateType: exchangeRateData.rateType || '',
        source: exchangeRateData.source || '',
        buyRate: exchangeRateData.buyRate || 0,
        sellRate: exchangeRateData.sellRate || 0,
        status: exchangeRateData.status ?? Status.ACTIVE
      });
      formik.validateForm();
    }
  }, [exchangeRateData, shouldFetchExchangeRate]);

  useEffect(() => {
    if (fetchError && shouldFetchExchangeRate) {
      console.error('Error fetching exchange rate data:', fetchError);
      openSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi tải dữ liệu tỷ giá',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  }, [fetchError, shouldFetchExchangeRate]);

  const getTitle = () => {
    if (isViewing) return 'Xem tỷ giá';
    if (isEditing) return 'Chỉnh sửa tỷ giá';
    return 'Tạo tỷ giá mới';
  };

  if (fetchLoading && (isEditing || isViewing)) {
    return (
      <MainCard title={getTitle()}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <div>Đang tải dữ liệu tỷ giá...</div>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title={getTitle()}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>
              Thông tin cơ bản
            </Typography>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="code">
                Mã tỷ giá{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="code"
                name="code"
                placeholder="Ví dụ: EXRATE001"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="name">
                Tên tỷ giá{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="name"
                name="name"
                placeholder="Ví dụ: USD to VND Official"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          {/* Currency Information */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Thông tin tiền tệ
            </Typography>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="fromCurrency">
                Tiền tệ nguồn{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <FormControl fullWidth error={formik.touched.fromCurrency && Boolean(formik.errors.fromCurrency)}>
                <Select
                  id="fromCurrency"
                  name="fromCurrency"
                  value={formik.values.fromCurrency}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {CURRENCY_OPTIONS.map((currency) => (
                    <MenuItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.fromCurrency && formik.errors.fromCurrency && <FormHelperText>{formik.errors.fromCurrency}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>

          {/* <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="toCurrency">
                Tiền tệ đích{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <FormControl fullWidth error={formik.touched.toCurrency && Boolean(formik.errors.toCurrency)}>
                <Select
                  id="toCurrency"
                  name="toCurrency"
                  value={formik.values.toCurrency}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {CURRENCY_OPTIONS.map((currency) => (
                    <MenuItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.toCurrency && formik.errors.toCurrency && <FormHelperText>{formik.errors.toCurrency}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid> */}
          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="toCurrency">
                Tiền tệ đích{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <FormControl fullWidth error={formik.touched.toCurrency && Boolean(formik.errors.toCurrency)}>
                <Select
                  id="toCurrency"
                  name="toCurrency"
                  value={formik.values.toCurrency}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {CURRENCY_OPTIONS.map((currency) => (
                    <MenuItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.toCurrency && formik.errors.toCurrency && <FormHelperText>{formik.errors.toCurrency}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>
          {/* Rate Information */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Thông tin tỷ giá
            </Typography>
          </Grid>

          {/* <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="exchangeRate">
                Tỷ giá{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="exchangeRate"
                name="exchangeRate"
                type="number"
                placeholder="0.00"
                value={formik.values.exchangeRate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.exchangeRate && Boolean(formik.errors.exchangeRate)}
                helperText={formik.touched.exchangeRate && formik.errors.exchangeRate}
                disabled={isViewing}
              />
            </Stack>
          </Grid> */}

          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="buyRate">
                Tỷ giá mua{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="buyRate"
                name="buyRate"
                type="number"
                placeholder="0.00"
                value={formik.values.buyRate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.buyRate && Boolean(formik.errors.buyRate)}
                helperText={formik.touched.buyRate && formik.errors.buyRate}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          <Grid size={4}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="sellRate">
                Tỷ giá bán{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="sellRate"
                name="sellRate"
                type="number"
                placeholder="0.00"
                value={formik.values.sellRate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sellRate && Boolean(formik.errors.sellRate)}
                helperText={formik.touched.sellRate && formik.errors.sellRate}
                disabled={isViewing}
              />
            </Stack>
          </Grid>

          {/* Date Information */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Thông tin thời gian
            </Typography>
          </Grid>

          {/* <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="effectiveDate">
                Ngày hiệu lực{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="effectiveDate"
                name="effectiveDate"
                type="datetime-local"
                value={formik.values.effectiveDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.effectiveDate && Boolean(formik.errors.effectiveDate)}
                helperText={formik.touched.effectiveDate && formik.errors.effectiveDate}
                disabled={isViewing}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Stack>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="expiryDate">
                Ngày hết hạn{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="expiryDate"
                name="expiryDate"
                type="datetime-local"
                value={formik.values.expiryDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                helperText={formik.touched.expiryDate && formik.errors.expiryDate}
                disabled={isViewing}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Stack>
          </Grid> */}

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="effectiveDate">
                Ngày hiệu lực{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="effectiveDate"
                name="effectiveDate"
                type="datetime-local"
                value={formik.values.effectiveDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.effectiveDate && Boolean(formik.errors.effectiveDate)}
                helperText={formik.touched.effectiveDate && formik.errors.effectiveDate}
                disabled={isViewing}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Stack>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="expiryDate">
                Ngày hết hạn{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <TextField
                fullWidth
                id="expiryDate"
                name="expiryDate"
                type="datetime-local"
                value={formik.values.expiryDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                helperText={formik.touched.expiryDate && formik.errors.expiryDate}
                disabled={isViewing}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Stack>
          </Grid>

          {/* Additional Information */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Thông tin bổ sung
            </Typography>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="rateType">
                Loại tỷ giá{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <FormControl fullWidth error={formik.touched.rateType && Boolean(formik.errors.rateType)}>
                <Select
                  id="rateType"
                  name="rateType"
                  value={formik.values.rateType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {RATE_TYPE_OPTIONS.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.rateType && formik.errors.rateType && <FormHelperText>{formik.errors.rateType}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>

          <Grid size={6}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="source">
                Nguồn{' '}
                <Typography variant="caption" color="error">
                  *
                </Typography>
              </InputLabel>
              <FormControl fullWidth error={formik.touched.source && Boolean(formik.errors.source)}>
                <Select
                  id="source"
                  name="source"
                  value={formik.values.source}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isViewing}
                >
                  {SOURCE_OPTIONS.map((source) => (
                    <MenuItem key={source.value} value={source.value}>
                      {source.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.source && formik.errors.source && <FormHelperText>{formik.errors.source}</FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>

          {/* Status Information for Edit/View mode */}
          {(isEditing || isViewing) && (
            <>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Trạng thái
                </Typography>
              </Grid>

              <Grid size={6}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="status">Trạng thái</InputLabel>
                  <FormControl fullWidth>
                    <Select
                      id="status"
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={isViewing}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="small" label={option.label} color={getStatusColor(option.value)} variant="filled" />
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
            </>
          )}

          {/* Action Buttons */}
          {!isViewing && (
            <Grid size={12}>
              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate('/master/exchange-rate')} disabled={loading}>
                  Hủy bỏ
                </Button>
                <AnimateButton>
                  <Button type="submit" variant="contained" disabled={loading || !formik.isValid}>
                    {loading ? 'Đang lưu...' : isCreating ? 'Tạo tỷ giá' : 'Cập nhật tỷ giá'}
                  </Button>
                </AnimateButton>
              </Stack>
            </Grid>
          )}

          {/* View mode back button */}
          {isViewing && (
            <Grid size={12}>
              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate('/master/exchange-rate')}>
                  Quay lại
                </Button>
              </Stack>
            </Grid>
          )}
        </Grid>
      </form>
    </MainCard>
  );
}
