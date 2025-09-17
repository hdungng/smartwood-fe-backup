import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import LoadingButton from '@mui/lab/LoadingButton';
import useExchangeRate from 'api/exchangeRate';
import useBusinessPlanTransactionInfo from 'api/businessPlanTransactionInfo';
import AnimateButton from 'components/@extended/AnimateButton';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { transactionInfoSelector, updateTransactionField, resetTransactionInfo } from 'redux/TransactionForm';
import { formatNumber, parseFormattedNumber } from 'utils';
import { mapCurrenciesFromConfig } from 'utils/mapCurrenciesFromConfig';
import { CODE_DELIVERY_METHOD, CODE_PACKING_METHOD } from 'constants/code';
import { useGlobal } from 'contexts';

interface AutocompleteOption {
  label: string;
  value: string;
}

const LIST_KEYS = [
  'exchangeRateBuy',
  'exchangeRateSell',
  'shippingMethod',
  'packingMethod',
  'weightPerContainer',
  'estimatedTotalContainers',
  'estimatedTotalBookings'
];

// ==============================|| BASIC ORDER - TRANSACTION INFORMATION ||============================== //
export default function TransactionInformation({
  id,
  isView = false,
  currency = '',
  unitOfMeasure = '',
  dataForm = {},
  errors: externalErrors,
  onCallParent
}: {
  id: any;
  isView: boolean;
  currency: string;
  unitOfMeasure: string;
  dataForm: any;
  errors: any;
  onCallParent?: (data: any) => void;
}) {
  const dispatch = useDispatch();
  const intl = useIntl();
  const location = useLocation();
  const transactionInfoForm = useSelector(transactionInfoSelector);
  const { configs } = useGlobal();

  // State for update functionality
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [errors, setErrors] = useState<Record<string, string | undefined>>(externalErrors || {});

  // Get the current currency value - prioritize dataForm in view mode
  const currentCurrency = isView && dataForm?.currency ? dataForm.currency : selectedCurrency;

  // Business plan transaction info hook
  const { update: updateTransactionInfo } = useBusinessPlanTransactionInfo();
  const { getByFromToCurrency } = useExchangeRate();
  const { exchangeRates, exchangeRatesLoading, exchangeRatesError } = getByFromToCurrency(
    selectedCurrency && selectedCurrency.trim() ? selectedCurrency.trim().toUpperCase() : '',
    'VND'
  );

  // Get currency options from config
  const currenciesData = useMemo(() => {
    return configs && configs.length > 0 ? mapCurrenciesFromConfig(configs) : [];
  }, [configs]);

  // Get packing method options from config
  const packingMethodOptions = useMemo((): AutocompleteOption[] => {
    if (!configs) return [];
    const packingConfig = configs.find((config) => config.code === CODE_PACKING_METHOD);
    return (
      packingConfig?.data?.map((item) => ({
        label: item.key,
        value: item.value
      })) || []
    );
  }, [configs]);

  // Get shipping method options using delivery method
  const shippingMethodOptions = useMemo((): AutocompleteOption[] => {
    if (!configs) return [];
    const deliveryConfig = configs.find((config) => config.code === CODE_DELIVERY_METHOD);

    return (
      deliveryConfig?.data?.map((item) => ({
        label: item.key,
        value: item.value
      })) || []
    );
  }, [configs]);

  // Populate data when viewing existing record
  useEffect(() => {
    if (isView && dataForm && Object.keys(dataForm).length > 0) {
      LIST_KEYS.forEach((key) => {
        dispatch(updateTransactionField(key, dataForm[key] || ''));
      });
    }
  }, [id, isView, dataForm, dispatch]);

  // Set currency from dataForm when in view mode
  useEffect(() => {
    if (isView && dataForm?.currency) {
      setSelectedCurrency(dataForm.currency);
    }
  }, [isView, dataForm?.currency]);

  // Additional effect to ensure data persistence when switching tabs in view mode
  useEffect(() => {
    if (isView && dataForm && Object.keys(dataForm).length > 0) {
      // Re-populate data to ensure it persists across tab switches
      LIST_KEYS.forEach((key) => {
        const currentValue = transactionInfoForm?.[key];
        const dataValue = dataForm[key];
        // Only update if current value is empty/null but data has value
        if (
          (currentValue === undefined || currentValue === null || currentValue === '' || currentValue === 0) &&
          dataValue !== undefined &&
          dataValue !== null
        ) {
          dispatch(updateTransactionField(key, dataValue));
        }
      });
    }
  }, [transactionInfoForm, dataForm, isView, dispatch]);

  // Tự động điền exchange rate nếu có data từ API
  useEffect(() => {
    if (exchangeRates && exchangeRates.length > 0 && !exchangeRatesLoading) {
      const latestRate = exchangeRates[0]; // Lấy rate mới nhất

      // Kiểm tra và điền buyRate
      if (
        latestRate.buyRate &&
        (!transactionInfoForm?.exchangeRateBuy || transactionInfoForm?.exchangeRateBuy === '' || transactionInfoForm?.exchangeRateBuy === 0)
      ) {
        dispatch(updateTransactionField('exchangeRateBuy', latestRate.buyRate));
      }

      // Kiểm tra và điền sellRate
      if (
        latestRate.sellRate &&
        (!transactionInfoForm?.exchangeRateSell ||
          transactionInfoForm?.exchangeRateSell === '' ||
          transactionInfoForm?.exchangeRateSell === 0)
      ) {
        dispatch(updateTransactionField('exchangeRateSell', latestRate.sellRate));
      }
    }
  }, [exchangeRates, exchangeRatesLoading, isView, transactionInfoForm?.exchangeRateBuy, transactionInfoForm?.exchangeRateSell, dispatch]);

  // Only reset when creating new (not in view mode) or when switching to completely different routes
  useEffect(() => {
    // Only reset if we're creating a completely new record (no id, not in view mode)
    // and the pathname indicates we're starting fresh
    if (!isView && !id && location.pathname.includes('/create')) {
      dispatch(resetTransactionInfo());
    }
  }, [location.pathname, dispatch, isView, id]); // Only reset for new creation

  // Tự động lưu data khi có thay đổi
  useEffect(() => {
    if (transactionInfoForm && Object.keys(transactionInfoForm).length > 0 && onCallParent) {
      onCallParent(transactionInfoForm);
    }
  }, [transactionInfoForm, onCallParent]);

  const onChangeTransactionInfo = (props: Record<string, any>) => {
    // Clear validation errors for fields being updated
    Object.keys(props).forEach((field) => {
      if (errors[field]) {
        setErrors((prev: Record<string, string | undefined>) => ({
          ...prev,
          [field]: undefined
        }));
      }
    });

    // Update each field individually
    Object.entries(props).forEach(([field, value]) => {
      dispatch(updateTransactionField(field, value));
    });
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    // Reset exchange rates when currency changes
    dispatch(updateTransactionField('exchangeRateBuy', 0));
    dispatch(updateTransactionField('exchangeRateSell', 0));
  };

  // Validation function
  const validateTransactionInfo = () => {
    const newErrors: any = {};

    if (!selectedCurrency) {
      newErrors.currency = intl.formatMessage({ id: 'field_required' });
    }

    if (!transactionInfoForm?.exchangeRateBuy || transactionInfoForm.exchangeRateBuy <= 0) {
      newErrors.exchangeRateBuy = intl.formatMessage({ id: 'field_required' });
    }

    if (!transactionInfoForm?.exchangeRateSell || transactionInfoForm.exchangeRateSell <= 0) {
      newErrors.exchangeRateSell = intl.formatMessage({ id: 'field_required' });
    }

    if (!transactionInfoForm?.shippingMethod?.trim()) {
      newErrors.shippingMethod = intl.formatMessage({ id: 'field_required' });
    }

    if (!transactionInfoForm?.packingMethod?.trim()) {
      newErrors.packingMethod = intl.formatMessage({ id: 'field_required' });
    }

    if (!transactionInfoForm?.weightPerContainer || transactionInfoForm.weightPerContainer <= 0) {
      newErrors.weightPerContainer = intl.formatMessage({ id: 'field_required' });
    }

    if (!transactionInfoForm?.estimatedTotalContainers || transactionInfoForm.estimatedTotalContainers <= 0) {
      newErrors.estimatedTotalContainers = intl.formatMessage({ id: 'field_required' });
    }

    if (!transactionInfoForm?.estimatedTotalBookings || transactionInfoForm.estimatedTotalBookings <= 0) {
      newErrors.estimatedTotalBookings = intl.formatMessage({ id: 'field_required' });
    }

    return newErrors;
  };

  // Handle update transaction info
  const handleUpdateTransactionInfo = async () => {
    const validationErrors = validateTransactionInfo();

    if (Object.keys(validationErrors).length > 0) {
      enqueueSnackbar(intl.formatMessage({ id: 'common_require_fill' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      return;
    }

    if (!dataForm?.id) {
      enqueueSnackbar(intl.formatMessage({ id: 'transaction_info_id_not_found' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      return;
    }

    try {
      setIsUpdating(true);

      const updateData = {
        exchangeRateBuy: transactionInfoForm.exchangeRateBuy,
        exchangeRateSell: transactionInfoForm.exchangeRateSell,
        shippingMethod: transactionInfoForm.shippingMethod,
        packingMethod: transactionInfoForm.packingMethod,
        weightPerContainer: transactionInfoForm.weightPerContainer,
        estimatedTotalContainers: transactionInfoForm.estimatedTotalContainers,
        estimatedTotalBookings: transactionInfoForm.estimatedTotalBookings
      };

      await updateTransactionInfo(dataForm.id, updateData);

      enqueueSnackbar(intl.formatMessage({ id: 'common_update_success_text' }), {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    } catch (error) {
      console.error('Error updating transaction info:', error);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if data has changed compared to original
  const hasDataChanged = () => {
    if (!dataForm || !transactionInfoForm) return false;

    return (
      dataForm.exchangeRateBuy !== transactionInfoForm.exchangeRateBuy ||
      dataForm.exchangeRateSell !== transactionInfoForm.exchangeRateSell ||
      dataForm.shippingMethod !== transactionInfoForm.shippingMethod ||
      dataForm.packingMethod !== transactionInfoForm.packingMethod ||
      dataForm.weightPerContainer !== transactionInfoForm.weightPerContainer ||
      dataForm.estimatedTotalContainers !== transactionInfoForm.estimatedTotalContainers ||
      dataForm.estimatedTotalBookings !== transactionInfoForm.estimatedTotalBookings
    );
  };

  return (
    <>
      <Box component={'div'}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          {intl.formatMessage({ id: 'transaction_information' })}
        </Typography>

        {/* Currency Selection */}
        <Grid size={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'primary.main' }}>
            {intl.formatMessage({ id: 'currency' })}
          </Typography>
        </Grid>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'business_plan_detail_currency' })} <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <Autocomplete
                readOnly={isView}
                options={currenciesData}
                getOptionLabel={(option) => `${option.code} - ${option.name} (${option.symbol})`}
                value={currenciesData.find((currency) => currency.code.toLowerCase() === currentCurrency?.toLowerCase()) || null}
                onChange={(e, newValue) => handleCurrencyChange(newValue?.code ?? '')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Chọn đồng tiền thanh toán" error={!!errors.currency} helperText={errors.currency} />
                )}
                componentsProps={{
                  popupIndicator: {
                    title: intl.formatMessage({ id: 'open_dropdown_text' })
                  }
                }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Box>
      <Box component={'div'} style={{ marginTop: 24 }}>
        <Grid size={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'primary.main' }}>
            {intl.formatMessage({ id: 'exchange_rate' })}
          </Typography>
        </Grid>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: `buying_rate_${(currentCurrency || '').toLowerCase()}_vnd` })}
                <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <TextField
                autoComplete="off"
                required
                id="exchangeRateBuy"
                name="exchangeRateBuy"
                placeholder={intl.formatMessage({ id: `buying_rate_${(currentCurrency || '').toLowerCase()}_vnd` })}
                fullWidth
                disabled={exchangeRatesLoading}
                onChange={(e) => {
                  const parsedValue = parseFormattedNumber(e.target.value);
                  onChangeTransactionInfo({
                    exchangeRateBuy: parsedValue
                  });
                }}
                value={
                  transactionInfoForm?.exchangeRateBuy && transactionInfoForm.exchangeRateBuy > 0
                    ? formatNumber(transactionInfoForm.exchangeRateBuy)
                    : ''
                }
                error={!!errors.exchangeRateBuy}
                helperText={errors.exchangeRateBuy || (exchangeRatesLoading ? intl.formatMessage({ id: 'loading_exchange_rates' }) : '')}
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: `selling_rate_${(currentCurrency || '').toLowerCase()}_vnd` })}
                <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <TextField
                autoComplete="off"
                required
                id="exchangeRateSell"
                name="exchangeRateSell"
                placeholder={intl.formatMessage({ id: `selling_rate_${(currentCurrency || '').toLowerCase()}_vnd` })}
                fullWidth
                disabled={exchangeRatesLoading}
                onChange={(e) => {
                  const parsedValue = parseFormattedNumber(e.target.value);
                  onChangeTransactionInfo({
                    exchangeRateSell: parsedValue
                  });
                }}
                value={
                  transactionInfoForm?.exchangeRateSell && transactionInfoForm.exchangeRateSell > 0
                    ? formatNumber(transactionInfoForm.exchangeRateSell)
                    : ''
                }
                error={!!errors.exchangeRateSell}
                helperText={errors.exchangeRateSell || (exchangeRatesLoading ? intl.formatMessage({ id: 'loading_exchange_rates' }) : '')}
              />
            </Stack>
          </Grid>
          {exchangeRatesError && (
            <Grid size={12}>
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {intl.formatMessage({ id: 'error_loading_exchange_rates' })}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
      <Box component={'div'} style={{ marginTop: 24 }}>
        <Grid size={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'primary.main' }}>
            {intl.formatMessage({ id: 'delivery_method' })}
          </Typography>
        </Grid>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'shipping_method' })}
                <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <Autocomplete<AutocompleteOption>
                options={shippingMethodOptions}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                value={shippingMethodOptions.find((option) => option.value === transactionInfoForm?.shippingMethod) || null}
                onChange={(event, newValue) => {
                  onChangeTransactionInfo({
                    shippingMethod: newValue ? (typeof newValue === 'string' ? newValue : newValue.value) : ''
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    placeholder={intl.formatMessage({ id: 'shipping_method' })}
                    error={!!errors.shippingMethod}
                    helperText={errors.shippingMethod}
                  />
                )}
                freeSolo={false}
                selectOnFocus
                handleHomeEndKeys
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'packing_method' })}
                <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <Autocomplete
                options={packingMethodOptions}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                value={
                  packingMethodOptions.find((option) =>
                    typeof option === 'string'
                      ? option === transactionInfoForm?.packingMethod
                      : option.value === transactionInfoForm?.packingMethod
                  ) || null
                }
                onChange={(event, newValue) => {
                  onChangeTransactionInfo({
                    packingMethod: newValue ? (typeof newValue === 'string' ? newValue : newValue.value) : ''
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    placeholder={intl.formatMessage({ id: 'packing_method' })}
                    error={!!errors.packingMethod}
                    helperText={errors.packingMethod}
                  />
                )}
                freeSolo
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'weight_per_container' })}
                <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <TextField
                autoComplete="off"
                required
                id="weightPerContainer"
                name="weightPerContainer"
                placeholder={intl.formatMessage({ id: 'weight_per_container' })}
                fullWidth
                onChange={(e) => {
                  const parsedValue = parseFormattedNumber(e.target.value);
                  onChangeTransactionInfo({
                    weightPerContainer: parsedValue
                  });
                }}
                value={
                  transactionInfoForm?.weightPerContainer && transactionInfoForm.weightPerContainer > 0
                    ? formatNumber(transactionInfoForm.weightPerContainer)
                    : ''
                }
                error={!!errors.weightPerContainer}
                helperText={errors.weightPerContainer}
                InputProps={{
                  endAdornment: unitOfMeasure ? <InputAdornment position="end">{unitOfMeasure}</InputAdornment> : null
                }}
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'total_number_of_temporary_containers' })}
                <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <TextField
                autoComplete="off"
                required
                id="estimatedTotalContainers"
                name="estimatedTotalContainers"
                placeholder={intl.formatMessage({ id: 'total_number_of_temporary_containers' })}
                fullWidth
                onChange={(e) => {
                  const parsedValue = parseFormattedNumber(e.target.value);
                  onChangeTransactionInfo({
                    estimatedTotalContainers: parsedValue
                  });
                }}
                value={
                  transactionInfoForm?.estimatedTotalContainers && transactionInfoForm.estimatedTotalContainers > 0
                    ? formatNumber(transactionInfoForm.estimatedTotalContainers)
                    : ''
                }
                error={!!errors.estimatedTotalContainers}
                helperText={errors.estimatedTotalContainers}
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'total_provisional_bookings' })}
                <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <TextField
                autoComplete="off"
                required
                id="estimatedTotalBookings"
                name="estimatedTotalBookings"
                placeholder={intl.formatMessage({ id: 'total_provisional_bookings' })}
                fullWidth
                onChange={(e) => {
                  const parsedValue = parseFormattedNumber(e.target.value);
                  onChangeTransactionInfo({
                    estimatedTotalBookings: parsedValue
                  });
                }}
                value={
                  transactionInfoForm?.estimatedTotalBookings && transactionInfoForm.estimatedTotalBookings > 0
                    ? formatNumber(transactionInfoForm.estimatedTotalBookings)
                    : ''
                }
                error={!!errors.estimatedTotalBookings}
                helperText={errors.estimatedTotalBookings}
              />
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Update Button - Only show in view mode when there's data and changes have been made */}
      {isView && dataForm?.id && hasDataChanged() && (
        <Box component="div" sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <AnimateButton>
            <LoadingButton
              variant="contained"
              color="primary"
              size="large"
              loading={isUpdating}
              onClick={handleUpdateTransactionInfo}
              sx={{ minWidth: 120 }}
            >
              {intl.formatMessage({ id: 'update' })}
            </LoadingButton>
          </AnimateButton>
        </Box>
      )}
    </>
  );
}
