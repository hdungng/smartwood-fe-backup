import { Box } from '@mui/material';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useExchangeRate from 'api/exchangeRate';
import { Input } from 'components/@extended/input';
import { StepAction, StepActionHandler } from 'components/@extended/Steps';
import { CODE_DELIVERY_METHOD, CODE_PACKING_METHOD, CODE_UNIT_OF_MEASURE } from 'constants/code';
import { useToast } from 'contexts';
import { Field, Form, useFormResolver } from 'forms';
import { useBoolean, useConfiguration, useRouter, useTranslation } from 'hooks';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { routing } from 'routes/routing';
import { businessPlanService } from 'services/business-plan';
import { draftPoService, GetDetailDraftPoResponse } from 'services/draft-po';
import { SelectionOption } from 'types/common';
import { numberHelper } from 'utils';
import { mapCurrenciesFromConfig } from 'utils/mapCurrenciesFromConfig';
import { deliveryTermNameMapping } from 'utils/mapDeliveryTermsFromConfig';
import { useBusinessPlanManageContext } from '../../provider';
import { InitializeFormProps, initializeSchema } from '../../schema';
import { ManageURLParams } from '../../types';
import { CustomButton } from 'components/buttons';

type Props = StepActionHandler;

const InitializeStep = ({ onNext }: Props) => {
  const { t } = useTranslation();
  const { state } = useLocation();

  const toast = useToast();
  const { configs, mapConfigObject, mapConfigSelection } = useConfiguration();
  const router = useRouter();
  const initializing = useBoolean(true);
  const { businessPlan, onRefetchDetail, mode, fieldOnlyView } = useBusinessPlanManageContext();
  const [draftPos, setDraftPos] = useState<SelectionOption[]>([]);
  const isFirstRenderCurrency = useBoolean(true);
  const [exactTotalContainers, setExactTotalContainers] = useState<number | null>(null);
  const form = useFormResolver<Nullable<InitializeFormProps>>(initializeSchema, {
    defaultValues: {
      currency: null,
      deliveryMethod: null,
      packingMethod: null
    }
  });
  const {
    watch,
    getValues,
    formState: { isSubmitting, isValid }
  } = form;

  const { contractCode } = useParams<ManageURLParams>();

  const deliveryMethodOptions = mapConfigSelection(
    CODE_DELIVERY_METHOD,
    (item) => `${item.value} - ${deliveryTermNameMapping[item.value]}`
  );

  const handleLoadContract = async () => {
    const mappingDetailDraftPoToSelectionOption = (draftPo: GetDetailDraftPoResponse): SelectionOption => ({
      label: draftPo.contractCode,
      value: draftPo.id,
      metadata: {
        contractId: draftPo.contractId,
        draftPoId: draftPo.id,
        unitOfMeasure: draftPo.unitOfMeasure,
        currency: draftPo.paymentCurrency,
        businessPlanId: businessPlan?.id || draftPo.businessPlanId,
        deliveryMethod: draftPo.deliveryMethod,
        totalWeight: draftPo.quantity
      }
    });

    try {
      // Ensure prerequisites are ready before attempting to load
      if (mode !== 'create' && !businessPlan?.id) {
        return;
      }

      if (mode === 'create') {
        const response = await draftPoService.getDetailDraftPo({ contractCode });

        const contracts = response.data || [];
        if (!response.success || contracts.length === 0) {
          initializing.onFalse();
          return;
        }

        const newDraftPos = contracts.filter((x) => !!x.contractCode).map(mappingDetailDraftPoToSelectionOption) as SelectionOption[];
        setDraftPos(newDraftPos);

        const currentDraftPo = newDraftPos[0];

        form.setValue('draftPo', currentDraftPo);
        form.setValue('deliveryMethod', deliveryMethodOptions.find((x) => x.value === currentDraftPo.metadata?.deliveryMethod) || null);

        // For create mode, we need to fetch the business plan if it is not already set
        if (!businessPlan && currentDraftPo?.metadata?.businessPlanId) {
          await onRefetchDetail(currentDraftPo.metadata.businessPlanId);
        }
      } else {
        if (!businessPlan?.draftPo) return;

        const draftPo = businessPlan.draftPo;
        const newDraftPo: SelectionOption = mappingDetailDraftPoToSelectionOption(draftPo);

        setDraftPos([newDraftPo]);
        form.setValue('draftPo', newDraftPo);
      }
    } finally {
      // Only turn off loading once we have either created-mode draft PO(s) or edit-mode business plan data
      if (mode === 'create' ? true : !!businessPlan?.draftPo) {
        initializing.onFalse();
      }
    }
  };

  useEffect(() => {
    handleLoadContract();
    // Only re-run when key identifiers change to avoid unnecessary reruns
  }, [contractCode, mode, businessPlan?.id]);

  const handleBack = () => {
    router.push(state?.fromUrl || routing.po.list);
  };

  const currenciesData = useMemo(() => (configs && configs.length > 0 ? mapCurrenciesFromConfig(configs) : []), [configs]);

  const { getByFromToCurrency } = useExchangeRate();
  const fromCurrency = useMemo(() => watch('currency')?.code?.toUpperCase() || '', [watch('currency')]);
  const { exchangeRates, exchangeRatesError } = getByFromToCurrency(fromCurrency, 'VND');

  const packingMethodOptions = mapConfigSelection(CODE_PACKING_METHOD);

  useEffect(() => {
    const currentCurrency = watch('currency');
    if (exchangeRates?.length === 0 || !currentCurrency) return;

    const isSameCurrency = currentCurrency.code.toUpperCase() === businessPlan?.currency?.toUpperCase();

    // If the currency is the same as the business plan's currency and it's the first render, skip change values from api
    if (isSameCurrency && isFirstRenderCurrency.value) {
      isFirstRenderCurrency.onFalse();
      return;
    }

    const { buyRate = 0, sellRate = 0 } = exchangeRates[0] || {};

    form.setValue('exchangeRateBuy', buyRate);
    form.setValue('exchangeRateSell', sellRate);
  }, [exchangeRates, businessPlan, form]);

  useEffect(() => {
    if (!businessPlan?.id || draftPos?.length == 0 || packingMethodOptions?.length === 0 || deliveryMethodOptions?.length === 0) {
      return;
    }

    form.reset({
      ...{
        draftPo: draftPos.find((item) => item.metadata?.businessPlanId === businessPlan.id),
        currency: currenciesData.find((currency) => currency.code === businessPlan.currency),
        exchangeRateBuy: businessPlan.businessPlanTransactionInfoItem?.exchangeRateBuy || 0,
        exchangeRateSell: businessPlan.businessPlanTransactionInfoItem?.exchangeRateSell || 0,
        deliveryMethod: deliveryMethodOptions.find(
          (option) => option.value === businessPlan.businessPlanTransactionInfoItem?.shippingMethod
        ),
        packingMethod: packingMethodOptions.find((option) => option.value === businessPlan.businessPlanTransactionInfoItem?.packingMethod),
        weightPerContainer: businessPlan.businessPlanTransactionInfoItem?.weightPerContainer || 0,
        estimatedTotalContainers: businessPlan.businessPlanTransactionInfoItem?.estimatedTotalContainers || 0,
        estimatedTotalBookings: businessPlan.businessPlanTransactionInfoItem?.estimatedTotalBookings || 0
      }
    });
  }, [businessPlan, draftPos, form, currenciesData]);

  useEffect(() => {
    if (currenciesData.length === 0 || mode !== 'create') {
      return;
    }

    const currentContract = watch('draftPo');

    const businessPlanCurrency = currenciesData.find(
      (currency) => currency.code === businessPlan?.currency || currency.code === currentContract?.metadata?.currency
    );
    if (!businessPlanCurrency) return;

    form.setValue('currency', businessPlanCurrency);
  }, [businessPlan, currenciesData, watch('draftPo'), mode]);

  const draftPoValid = useMemo(() => !!watch('draftPo')?.metadata?.draftPoId, [watch('draftPo')]);

  const hasCreated = useMemo(() => mode === 'create' && !!businessPlan?.id, [mode, businessPlan?.id]);

  const handleSubmit = async (values: InitializeFormProps, event: Dynamic) => {
    if (!draftPoValid) {
      toast.error('Draft PO không được tìm thấy. Vui lòng kiểm tra lại.');
      return;
    }

    if (fieldOnlyView) {
      onNext?.({ supplier: getValues() });
      return;
    }

    const draftPo = watch('draftPo');

    if (mode === 'create' && !businessPlan?.id) {
      const response = await businessPlanService.createBusinessPlan({
        draftPoId: draftPo!.metadata!.draftPoId,
        transactionInfo: {
          exchangeRateBuy: values.exchangeRateBuy,
          exchangeRateSell: values.exchangeRateSell,
          shippingMethod: values.deliveryMethod.value as string,
          packingMethod: values.packingMethod.value as string,
          weightPerContainer: values.weightPerContainer,
          estimatedTotalContainers: exactTotalContainers || values.estimatedTotalContainers || 0,
          estimatedTotalBookings: values.estimatedTotalBookings
        }
      });

      if (!response.success) {
        toast.error('Kế hoạch kinh doanh trên mã hợp đồng này đã được tạo. Vui lòng kiểm tra lại');
        return;
      }

      await onRefetchDetail(response.data!.id);
    } else if (mode === 'edit' && businessPlan?.id) {
      const response = await businessPlanService.updateBusinessPlanTransactionInfo({
        id: businessPlan.businessPlanTransactionInfoItem.id,
        exchangeRateBuy: values.exchangeRateBuy,
        exchangeRateSell: values.exchangeRateSell,
        shippingMethod: values.deliveryMethod.value as string,
        packingMethod: values.packingMethod.value as string,
        weightPerContainer: values.weightPerContainer,
        estimatedTotalContainers: exactTotalContainers || values.estimatedTotalContainers || 0,
        estimatedTotalBookings: values.estimatedTotalBookings
      });

      if (!response.success) {
        toast.error('Cập nhật kế hoạch kinh doanh. Vui lòng thử lại sau.');
        return;
      }

      await onRefetchDetail(businessPlan!.id);
    }

    const canNextStep = event?.nativeEvent?.submitter?.value === 'btn-save-continue';
    if (canNextStep) {
      onNext?.({ supplier: getValues() });
    } else {
      toast.success('Lưu thông tin giao dịch thành công.');
    }
  };

  useEffect(() => {
    const weightPerContainer = watch('weightPerContainer');
    const draftPo = watch('draftPo');

    if (draftPo && weightPerContainer && draftPo.metadata?.totalWeight) {
      const exactValue = draftPo.metadata.totalWeight / weightPerContainer;
      setExactTotalContainers(exactValue);
      form.setValue('estimatedTotalContainers', Math.ceil(exactValue));
    } else {
      setExactTotalContainers(null);
      form.setValue('estimatedTotalContainers', null);
    }
  }, [watch('draftPo'), watch('weightPerContainer')]);

  const btnDisabled = useMemo(() => !isValid || isSubmitting, [isValid, isSubmitting]);

  return (
    <Form onSubmit={handleSubmit} methods={form}>
      {initializing.value ? (
        <Stack direction="row" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              {t('transaction_information')}
            </Typography>

            {/* Currency Selection */}
            <Grid size={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'primary.main' }}>
                Thông tin chung
              </Typography>
            </Grid>
            {!watch('draftPo') && (
              <Grid size={12}>
                <Alert severity="error" color="error" sx={{ my: 2, minHeight: 60, alignItems: 'center' }}>
                  Thông tin Draft PO không được tìm thấy. Vui lòng kiểm tra lại.
                </Alert>
              </Grid>
            )}
            {hasCreated && (
              <Grid size={12}>
                <Alert
                  severity="warning"
                  color="warning"
                  sx={{ my: 2, minHeight: 60, alignItems: 'center' }}
                  action={
                    <Button
                      color="warning"
                      onClick={() => {
                        router.replace(routing.businessPlan.edit(businessPlan!.id));
                      }}
                    >
                      Cập Nhật
                    </Button>
                  }
                >
                  Phương án kinh doanh này đã được tạo, không thể thay đổi thông tin. Vui lòng chuyển sang chế độ chỉnh sửa để cập nhật
                  thông tin.
                </Alert>
              </Grid>
            )}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <Input.Text label="Thông tin Draft PO" value={watch('draftPo')?.label || ''} readOnly />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <Field.Autocomplete
                  label={t('business_plan_detail_currency')}
                  placeholder="Chọn đồng tiền thanh toán"
                  options={currenciesData}
                  getOptionLabel={(option) => `${option.code} - ${option.name} (${option.symbol})`}
                  name="currency"
                  readOnly
                />
              </Grid>
            </Grid>
          </Box>
          <Box component={'div'} mt={3}>
            <Grid size={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'primary.main' }}>
                {t('exchange_rate')}
              </Typography>
            </Grid>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <Field.Number
                  name="exchangeRateBuy"
                  readOnly={fieldOnlyView || hasCreated}
                  required
                  label={t(`buying_rate_${(watch('currency')?.code || '').toLowerCase()}_vnd`)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <Stack sx={{ gap: 1 }}>
                  <Field.Number
                    name="exchangeRateSell"
                    readOnly={fieldOnlyView || hasCreated}
                    required
                    label={t(`selling_rate_${(watch('currency')?.code || '').toLowerCase()}_vnd`)}
                  />
                </Stack>
              </Grid>
              {exchangeRatesError && (
                <Grid size={12}>
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {t('error_loading_exchange_rates')}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
          <Box component={'div'} mt={3}>
            <Grid size={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'primary.main' }}>
                {t('delivery_method')}
              </Typography>
            </Grid>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Field.Autocomplete
                  options={deliveryMethodOptions}
                  name="deliveryMethod"
                  label="Phương thức vận chuyển"
                  getOptionLabel={(option) => option.label}
                  readOnly
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Field.Autocomplete
                  options={packingMethodOptions}
                  name="packingMethod"
                  label={t('packing_method')}
                  required
                  getOptionLabel={(option) => option.label}
                  readOnly={fieldOnlyView || hasCreated}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Field.Number
                  name="estimatedTotalBookings"
                  readOnly={fieldOnlyView || hasCreated}
                  label={t('total_provisional_bookings')}
                  required
                />
              </Grid>
              {watch('draftPo')?.metadata?.totalWeight && (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Input.Text
                    readOnly
                    label="Tổng khối lượng Draft PO"
                    value={numberHelper.formatNumber(watch('draftPo')!.metadata!.totalWeight)}
                    slotProps={{
                      input: {
                        endAdornment: watch('draftPo')?.metadata?.unitOfMeasure && (
                          <InputAdornment position="end">
                            {mapConfigObject(CODE_UNIT_OF_MEASURE, watch('draftPo')!.metadata!.unitOfMeasure)}
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Field.Number
                  name="weightPerContainer"
                  label={t('weight_per_container')}
                  required
                  readOnly={fieldOnlyView || hasCreated}
                  slotProps={{
                    number: {
                      decimalScale: 4,
                      max: watch('draftPo')?.metadata?.totalWeight || 100_000_000
                    },
                    input: {
                      endAdornment: watch('draftPo')?.metadata?.unitOfMeasure && (
                        <InputAdornment position="end">
                          {mapConfigObject(CODE_UNIT_OF_MEASURE, watch('draftPo')!.metadata!.unitOfMeasure)}
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Field.Number name="estimatedTotalContainers" readOnly label={t('total_number_of_temporary_containers')} />
              </Grid>
            </Grid>
          </Box>

          <StepAction
            slots={{
              next: (
                <Stack direction="row" spacing={1}>
                  {mode === 'create' ? (
                    <CustomButton
                      value="btn-save-continue"
                      disabled={btnDisabled}
                      variant="contained"
                      type="submit"
                      color="primary"
                    >
                      Tiếp tục
                    </CustomButton>
                  ) : (
                    <>
                      {!fieldOnlyView ? (
                        <>
                          <CustomButton value="btn-save" disabled={btnDisabled} variant="contained" type="submit" color="primary">
                            Lưu
                          </CustomButton>

                          <CustomButton
                            value="btn-save-continue"
                            disabled={!isValid || isSubmitting}
                            variant="contained"
                            type="submit"
                            color="primary"
                          >
                            Lưu & Tiếp tục
                          </CustomButton>
                        </>
                      ) : (
                        <CustomButton disabled={btnDisabled} variant="contained" type="submit" color="primary">
                          Tiếp tục
                        </CustomButton>
                      )}
                    </>
                  )}
                </Stack>
              )
            }}
            onBack={handleBack}
            onNext={onNext}
          />
        </>
      )}
    </Form>
  );
};

export default InitializeStep;
