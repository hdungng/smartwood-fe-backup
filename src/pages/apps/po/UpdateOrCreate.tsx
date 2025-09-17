import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosServices from 'utils/axios';

// material-ui
import { FileAddOutlined, FileTextOutlined } from '@ant-design/icons';
import { Autocomplete, Button, CircularProgress, Grid, InputLabel, Stack, TextField } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';

// mock data
import { PO_API } from 'api/constants';
import { status as statusData } from 'sections/constracts/purchase/steps-forms/constract/ContractMockData';

// utils
import { dateHelper } from 'utils';
import { cleanPayload } from 'utils/cleanPayload';

import { mapPortDestination } from 'utils/mapPortDestination';
// countries via configuration hook
import { CODE_COUNTRY_IMPORT } from 'constants/code';
import { useRole } from 'contexts/RoleContext';
import { useRouter } from 'hooks';
import { useConfiguration } from 'hooks/useConfiguration';
import { useFormik } from 'formik';
import { routing } from 'routes/routing';
import { mapCurrenciesFromConfig } from 'utils/mapCurrenciesFromConfig';
import { mapDeliveryTermsFromConfig } from 'utils/mapDeliveryTermsFromConfig';
import { mapPaymentTermsFromConfig } from 'utils/mapPaymentTermsFromConfig';
import { mapGoodTypesFromConfig } from 'utils/mapGoodTypesFromConfig';
import { mapUnitsFromConfig } from 'utils/mapUnitsFromConfig';
import { useGlobal } from 'contexts';
import { Input } from 'components/@extended/input';

interface CustomerInfo {
  customerName: string;
  deliveryLocation: string;
  importCountry: string;
  goodId: number;
  deliveryMethod: string;
  paymentMethod: string;
  currency: string;
  unitPrice: number | null;
  unit: string;
  quantity: number | null;
  goodType: string;
  expectedDelivery: any;
  status: String;
  canEdit: boolean;
}
interface BuyerInfo {
  id: string;
  name: string;
  taxCode: string;
  address: string;
  representative: string;
  phone: string;
}

export default function POUpdateOrCreate() {
  const navigate = useNavigate();
  const intl = useIntl();
  const { id } = useParams();
  const { state } = useLocation();
  const router = useRouter();
  const { goodOptions } = useGlobal();
  const { hasPermission } = useRole();
  const [loading, setLoading] = useState<boolean>(false);
  // Formik
  const formik = useFormik<CustomerInfo>({
    initialValues: {
      customerName: '',
      deliveryLocation: '',
      importCountry: '',
      goodId: 0,
      deliveryMethod: '',
      paymentMethod: '',
      currency: '',
      unitPrice: null,
      unit: '',
      quantity: null,
      goodType: '',
      expectedDelivery: '',
      status: '',
      canEdit: false
    },
    validate: (data) => {
      const newErrors: { [key in keyof CustomerInfo]?: string } = {};
      if (!data.customerName) newErrors.customerName = intl.formatMessage({ id: 'customer_name_required' });
      if (!data.deliveryLocation) newErrors.deliveryLocation = intl.formatMessage({ id: 'delivery_location_required' });
      if (!data.importCountry) newErrors.importCountry = intl.formatMessage({ id: 'import_country_required' });
      if (!data.goodId) newErrors.goodId = intl.formatMessage({ id: 'goods_name_required' });
      if (!data.deliveryMethod) newErrors.deliveryMethod = intl.formatMessage({ id: 'payment_deivery_required' });
      if (!data.paymentMethod) newErrors.paymentMethod = intl.formatMessage({ id: 'payment_medthod_required' });
      if (!data.currency) newErrors.currency = intl.formatMessage({ id: 'curreny_required' });
      if (data.unitPrice === null || isNaN(Number(data.unitPrice))) newErrors.unitPrice = intl.formatMessage({ id: 'unitPrice_rquired' });
      if (!data.unit) newErrors.unit = intl.formatMessage({ id: 'unit_required' });
      if (data.quantity === null || isNaN(Number(data.quantity))) newErrors.quantity = intl.formatMessage({ id: 'quantity_required' });
      if (!data.goodType) newErrors.goodType = intl.formatMessage({ id: 'good_type_required' });
      if (isNaN(Number(data.status))) newErrors.status = intl.formatMessage({ id: 'status_required' });
      if (!data.expectedDelivery) {
        newErrors.expectedDelivery = intl.formatMessage({ id: 'expected_delivery_required' });
      } else if (dateHelper.formatIsBefore(dateHelper.tomorrow(), dateHelper.from(data.expectedDelivery))) {
        newErrors.expectedDelivery = intl.formatMessage({ id: 'expected_delivery_must_greater_today' });
      }
      return newErrors as any;
    },
    onSubmit: async (values) => {
      const merged = values;
      // Chuẩn hóa payload: Không gửi các trường không cần thiết/null
      const payload = {
        customerName: merged.customerName,
        deliveryLocation: merged.deliveryLocation,
        importCountry: merged.importCountry || null,
        goodId: merged.goodId,
        deliveryMethod: merged.deliveryMethod || null,
        paymentMethod: merged.paymentMethod || null,
        paymentCurrency: merged.currency || null,
        unitPrice: merged.unitPrice,
        unitOfMeasure: merged.unit || null,
        quantity: merged.quantity,
        goodType: merged.goodType || null,
        status: statusData.find((item) => item.code === merged.status)?.id || null,
        expectedDelivery: dateHelper.toDateString(dateHelper.from(merged.expectedDelivery))
      };

      const cleanedPayload = cleanPayload(payload);

      try {
        setLoading(true);
        const { data, status } = await axiosServices.post(PO_API.COMMON, cleanedPayload);
        if (status === 201 || status === 200) {
          if (data?.data?.contractCode) {
            setContractCode(data.data.contractCode);
          }
          enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
        }
      } catch {
        setLoading(false);
        enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
          autoHideDuration: 2500,
          variant: 'error',
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
      } finally {
        setLoading(false);
      }
    }
  });
  // console.log("🚀 ~ POUpdateOrCreate ~ customerInfo:", customerInfo)

  // Dialog states
  const [buyersData, setBuyersData] = useState<BuyerInfo[]>([]);
  const [businessPlanId, setBusinessPlanId] = useState<number | null>(null);
  const [contractCode, setContractCode] = useState<string>('');
  const { mapConfigSelection, mapConfigCustom } = useConfiguration();

  // Đảm bảo data đã có
  const countries = mapConfigSelection(CODE_COUNTRY_IMPORT);
  const portsOptions = mapConfigCustom(mapPortDestination);
  const paymentTerms = mapConfigCustom(mapPaymentTermsFromConfig);
  const deliveryTerms = mapConfigCustom(mapDeliveryTermsFromConfig);
  const goodTypesData = mapConfigCustom(mapGoodTypesFromConfig);
  const unitsData = mapConfigCustom(mapUnitsFromConfig);
  const currenciesData = mapConfigCustom(mapCurrenciesFromConfig);

  useEffect(() => {
    if (id) getDetailPOById(Number(id));
    GetCustomer();
  }, []);

  const GetCustomer = async () => {
    try {
      const { data, status } = await axiosServices.get('api/customer');
      if (status === 201 || status === 200) {
        setBuyersData(
          data.data.map(
            (i: any): BuyerInfo => ({
              id: i.code,
              name: i.name,
              taxCode: i.taxCode,
              address: i.address,
              representative: i.represented,
              phone: i.phone
            })
          )
        );
      }
    } catch (err) {
      console.log('FETCH FAIL!', err);
    }
  };
  const getDetailPOById = async (id: number | null) => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, status } = await axiosServices.get(PO_API.COMMON + `/${id}`);
      if (status === 201 || status === 200) {
        // console.log("getDetailPOById__data", data.data)
        const {
          goodId,
          paymentCurrency,
          unitOfMeasure,
          expectedDelivery,
          businessPlanId: bpId,
          contractCode: code,
          ...rest
        } = data.data || {};
        formik.setValues({
          customerName: rest.customerName || '',
          deliveryLocation: rest.deliveryLocation || '',
          importCountry: rest.importCountry || '',
          goodId: goodId,
          deliveryMethod: rest.deliveryMethod || '',
          paymentMethod: rest.paymentMethod || '',
          currency: paymentCurrency || '',
          unitPrice: (rest.unitPrice ?? null) as any,
          unit: unitOfMeasure || '',
          quantity: (rest.quantity ?? null) as any,
          goodType: rest.goodType || '',
          expectedDelivery: dateHelper.toDateString(dateHelper.from(expectedDelivery)),
          status: String(rest.status ?? ''),
          canEdit: Boolean(rest.canEdit)
        });
        setBusinessPlanId(bpId);
        setContractCode(code);
      }
    } catch (err) {
      console.log('FETCH FAIL!', err);
      setLoading(false);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    } finally {
      setLoading(false);
    }
  };

  // Utility to clear error for a field
  const clearFieldError = (field: keyof CustomerInfo) => {
    formik.setFieldError(field as any, undefined);
    formik.setFieldTouched(field as any, false, false);
  };

  return (
    <MainCard title={intl.formatMessage({ id: 'preview_detail_po' })}>
      <form onSubmit={formik.handleSubmit}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 504 }}>
            <CircularProgress size={50} />
          </div>
        ) : (
          <Grid container spacing={3}>
            {/* Customer Information Section */}
            {/* <Grid size={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'primary.main' }}>
                {intl.formatMessage({ id: 'po_detail_label_po' })}
              </Typography>
            </Grid> */}

            {/* 1.1.001 - Customer Name */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>
                  {intl.formatMessage({ id: 'customer_name_label_po' })}{' '}
                  <strong style={{ color: 'red' }}>
                    <strong style={{ color: 'red' }}>*</strong>
                  </strong>
                </InputLabel>
                <Autocomplete
                  readOnly={state?.isView}
                  options={buyersData}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                  value={buyersData.find((buyer) => buyer.name === formik.values.customerName) || null}
                  onChange={(_, newValue) => {
                    clearFieldError('customerName');
                    formik.setFieldValue('customerName', newValue ? (newValue as BuyerInfo).name : '');
                  }}
                  onBlur={() => formik.setFieldTouched('customerName', true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn tên khách hàng"
                      error={formik.touched.customerName && Boolean(formik.errors.customerName)}
                      helperText={formik.touched.customerName && (formik.errors.customerName as string)}
                    />
                  )}
                  componentsProps={{
                    popupIndicator: {
                      title: intl.formatMessage({ id: 'open_dropdown_text' })
                    },
                    clearIndicator: {
                      title: intl.formatMessage({ id: 'clear_text' })
                    }
                  }}
                />
              </Stack>
            </Grid>

            {/* 1.1.002 - Delivery Location */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>
                  {intl.formatMessage({ id: 'delivery_location_label_po' })} <strong style={{ color: 'red' }}>*</strong>
                </InputLabel>
                <Autocomplete
                  readOnly={state?.isView}
                  options={portsOptions}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.name}`)}
                  value={portsOptions.find((port) => port.code === formik.values.deliveryLocation) || null}
                  onChange={(_, newValue) => {
                    clearFieldError('deliveryLocation');
                    formik.setFieldValue('deliveryLocation', newValue ? (newValue as any).code : '');
                  }}
                  onBlur={() => formik.setFieldTouched('deliveryLocation', true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={formik.touched.deliveryLocation && Boolean(formik.errors.deliveryLocation)}
                      helperText={formik.touched.deliveryLocation && (formik.errors.deliveryLocation as string)}
                      placeholder="Chọn cảng nhận hàng"
                    />
                  )}
                  componentsProps={{
                    popupIndicator: {
                      title: intl.formatMessage({ id: 'open_dropdown_text' })
                    },
                    clearIndicator: {
                      title: intl.formatMessage({ id: 'clear_text' })
                    }
                  }}
                />
              </Stack>
            </Grid>

            {/* 1.1.003 - Import Country */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>
                  {intl.formatMessage({ id: 'import_country_label_po' })} <strong style={{ color: 'red' }}>*</strong>
                </InputLabel>
                <Autocomplete
                  readOnly={state?.isView}
                  options={countries}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                  value={countries.find((country) => String(country.value) === formik.values.importCountry) || null}
                  onChange={(_, newValue) => {
                    clearFieldError('importCountry');
                    formik.setFieldValue('importCountry', newValue ? String((newValue as any).value) : '');
                  }}
                  onBlur={() => formik.setFieldTouched('importCountry', true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={formik.touched.importCountry && Boolean(formik.errors.importCountry)}
                      helperText={formik.touched.importCountry && (formik.errors.importCountry as string)}
                      placeholder="Chọn nước nhập khẩu"
                    />
                  )}
                  componentsProps={{
                    popupIndicator: {
                      title: intl.formatMessage({ id: 'open_dropdown_text' })
                    }
                  }}
                />
              </Stack>
            </Grid>

            {/* 1.1.004 - Goods Name */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>
                  {intl.formatMessage({ id: 'product_name_label_po' })} <strong style={{ color: 'red' }}>*</strong>
                </InputLabel>
                <Autocomplete
                  readOnly={state?.isView}
                  options={goodOptions}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                  value={goodOptions.find((good) => good.value === formik.values.goodId) || null}
                  onChange={(_, newValue) => {
                    clearFieldError('goodId');
                    formik.setFieldValue('goodId', newValue ? Number((newValue as any).value) : 0);
                  }}
                  onBlur={() => formik.setFieldTouched('goodId', true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={formik.touched.goodId && Boolean(formik.errors.goodId)}
                      helperText={formik.touched.goodId && (formik.errors.goodId as string)}
                      placeholder="Chọn sản phẩm"
                    />
                  )}
                  componentsProps={{
                    popupIndicator: {
                      title: intl.formatMessage({ id: 'open_dropdown_text' })
                    },
                    clearIndicator: {
                      title: intl.formatMessage({ id: 'clear_text' })
                    }
                  }}
                />
              </Stack>
            </Grid>

            {/* 1.1.005 - Delivery Method (Incoterm) */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>
                  {intl.formatMessage({ id: 'delivery_method_label_po' })} <strong style={{ color: 'red' }}>*</strong>
                </InputLabel>
                <Autocomplete
                  readOnly={state?.isView}
                  options={deliveryTerms}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.code} - ${option.name}`)}
                  value={deliveryTerms.find((term) => term.code === formik.values.deliveryMethod) || null}
                  onChange={(_, newValue) => {
                    clearFieldError('deliveryMethod');
                    formik.setFieldValue('deliveryMethod', newValue ? (newValue as any).code : '');
                  }}
                  onBlur={() => formik.setFieldTouched('deliveryMethod', true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={formik.touched.deliveryMethod && Boolean(formik.errors.deliveryMethod)}
                      helperText={formik.touched.deliveryMethod && (formik.errors.deliveryMethod as string)}
                      placeholder="Chọn Phương thức vận chuyển"
                    />
                  )}
                  componentsProps={{
                    popupIndicator: {
                      title: intl.formatMessage({ id: 'open_dropdown_text' })
                    },
                    clearIndicator: {
                      title: intl.formatMessage({ id: 'clear_text' })
                    }
                  }}
                />
              </Stack>
            </Grid>

            {/* 1.1.006 - Payment Method */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>
                  {intl.formatMessage({ id: 'payment_method_label_po' })} <strong style={{ color: 'red' }}>*</strong>
                </InputLabel>
                <Autocomplete
                  readOnly={state?.isView}
                  options={paymentTerms}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.code} - ${option.name}`)}
                  value={paymentTerms.find((term) => term.code === formik.values.paymentMethod) || null}
                  onChange={(_, newValue) => {
                    clearFieldError('paymentMethod');
                    formik.setFieldValue('paymentMethod', newValue ? (newValue as any).code : '');
                  }}
                  onBlur={() => formik.setFieldTouched('paymentMethod', true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                      helperText={formik.touched.paymentMethod && (formik.errors.paymentMethod as string)}
                      placeholder="Chọn phương thức thanh toán"
                    />
                  )}
                  componentsProps={{
                    popupIndicator: {
                      title: intl.formatMessage({ id: 'open_dropdown_text' })
                    },
                    clearIndicator: {
                      title: intl.formatMessage({ id: 'clear_text' })
                    }
                  }}
                />
              </Stack>
            </Grid>

            {/* 1.1.007 - Payment Currency */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>
                  {intl.formatMessage({ id: 'currency_label_po' })} <strong style={{ color: 'red' }}>*</strong>
                </InputLabel>
                <Autocomplete
                  readOnly={state?.isView}
                  options={currenciesData}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.code} - ${option.name} (${option.symbol})`)}
                  value={currenciesData.find((currency) => currency.code === formik.values.currency) || null}
                  onChange={(_, newValue) => {
                    clearFieldError('currency');
                    formik.setFieldValue('currency', newValue ? (newValue as any).code : '');
                  }}
                  onBlur={() => formik.setFieldTouched('currency', true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={formik.touched.currency && Boolean(formik.errors.currency)}
                      helperText={formik.touched.currency && (formik.errors.currency as string)}
                      placeholder="Chọn đồng tiền thanh toán"
                    />
                  )}
                  componentsProps={{
                    popupIndicator: {
                      title: intl.formatMessage({ id: 'open_dropdown_text' })
                    },
                    clearIndicator: {
                      title: intl.formatMessage({ id: 'clear_text' })
                    }
                  }}
                />
              </Stack>
            </Grid>

            {/* 1.1.008 - Unit Price */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>
                  {intl.formatMessage({ id: 'unit_price_label_po' })} <strong style={{ color: 'red' }}>*</strong>
                </InputLabel>
                <TextField
                  type="number"
                  inputProps={{ step: 'any' }}
                  value={formik.values.unitPrice ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    formik.setFieldValue('unitPrice', val === '' ? null : Number(val));
                  }}
                  onBlur={() => formik.setFieldTouched('unitPrice', true)}
                  InputProps={{ readOnly: state?.isView }}
                  placeholder="Ví dụ: 145"
                  fullWidth
                  error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
                  helperText={formik.touched.unitPrice && (formik.errors.unitPrice as string)}
                />
              </Stack>
            </Grid>

            {/* 1.1.009 - Unit */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>
                  {intl.formatMessage({ id: 'quantity_type_label_po' })} <strong style={{ color: 'red' }}>*</strong>
                </InputLabel>
                <Autocomplete
                  readOnly={state?.isView}
                  options={unitsData}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                  value={unitsData.find((unit) => unit.code === formik.values.unit) || null}
                  onChange={(_, newValue) => {
                    clearFieldError('unit');
                    formik.setFieldValue('unit', newValue ? (newValue as any).code : '');
                  }}
                  onBlur={() => formik.setFieldTouched('unit', true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={formik.touched.unit && Boolean(formik.errors.unit)}
                      helperText={formik.touched.unit && (formik.errors.unit as string)}
                      placeholder="Chọn đơn vị"
                    />
                  )}
                  componentsProps={{
                    popupIndicator: {
                      title: intl.formatMessage({ id: 'open_dropdown_text' })
                    },
                    clearIndicator: {
                      title: intl.formatMessage({ id: 'clear_text' })
                    }
                  }}
                />
              </Stack>
            </Grid>

            {/* 1.1.010 - Quantity */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>
                  {intl.formatMessage({ id: 'quantity_label_po' })} <strong style={{ color: 'red' }}>*</strong>
                </InputLabel>
                <TextField
                  type="number"
                  value={formik.values.quantity ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    formik.setFieldValue('quantity', val === '' ? null : Number(val));
                  }}
                  onBlur={() => formik.setFieldTouched('quantity', true)}
                  InputProps={{ readOnly: state?.isView }}
                  placeholder="Ví dụ: 3000"
                  fullWidth
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={formik.touched.quantity && (formik.errors.quantity as string)}
                />
              </Stack>
            </Grid>

            {/* 1.1.011 - good Type */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>
                  {intl.formatMessage({ id: 'good_type_label_po' })} <strong style={{ color: 'red' }}>*</strong>
                </InputLabel>
                <Autocomplete
                  readOnly={state?.isView}
                  options={goodTypesData}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                  value={
                    goodTypesData.find((type) => {
                      return (
                        type.value.toLowerCase() === formik.values.goodType.toLowerCase() ||
                        type.label.toLowerCase() === formik.values.goodType.toLowerCase()
                      );
                    }) || null
                  }
                  onChange={(_, newValue) => {
                    clearFieldError('goodType');
                    formik.setFieldValue('goodType', newValue ? (newValue as any).value : '');
                  }}
                  onBlur={() => formik.setFieldTouched('goodType', true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={formik.touched.goodType && Boolean(formik.errors.goodType)}
                      helperText={formik.touched.goodType && (formik.errors.goodType as string)}
                      placeholder="Chọn loại chất lượng"
                    />
                  )}
                  componentsProps={{
                    popupIndicator: {
                      title: intl.formatMessage({ id: 'open_dropdown_text' })
                    },
                    clearIndicator: {
                      title: intl.formatMessage({ id: 'clear_text' })
                    }
                  }}
                />
              </Stack>
            </Grid>

            {/* 1.1.013 - Expected Delivery */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Stack sx={{ gap: 1 }}>
                <Input.DatePicker
                  label={intl.formatMessage({ id: 'estimated_delivery_label_po' })}
                  fullWidth
                  value={formik.values.expectedDelivery}
                  onChange={(val: any) => {
                    clearFieldError('expectedDelivery');
                    formik.setFieldValue('expectedDelivery', val ? dateHelper.toDateString(val) : '');
                  }}
                  onError={undefined}
                  minDate={dateHelper.tomorrow()}
                  error={formik.touched.expectedDelivery && Boolean(formik.errors.expectedDelivery)}
                  helperText={formik.touched.expectedDelivery && (formik.errors.expectedDelivery as string)}
                />
              </Stack>
            </Grid>
          </Grid>
        )}
      </form>
      <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 1, mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/po/list')}>
          {intl.formatMessage({ id: 'common_goback' })}
        </Button>
        <Button disabled={state?.isView} type="submit" variant="contained" onClick={() => formik.handleSubmit()} loading={loading}>
          {intl.formatMessage({ id: 'common_button_save' })}
        </Button>

        {hasPermission(['BUSINESS_PLAN_UPDATE', 'BUSINESS_PLAN_VIEW', 'BUSINESS_PLAN_CREATE']) && (
          <>
            {businessPlanId ? (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<FileTextOutlined />}
                onClick={() => {
                  if (hasPermission('BUSINESS_PLAN_UPDATE') && businessPlanId && formik.values.canEdit) {
                    router.push(routing.businessPlan.edit(businessPlanId), {
                      state: {
                        contractCode: contractCode
                      }
                    });
                  } else if (hasPermission('DRAFT_PO_VIEW') && businessPlanId) {
                    router.push(routing.businessPlan.detail(businessPlanId), {
                      state: {
                        contractCode: contractCode
                      }
                    });
                  }
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: 'secondary.main'
                  }
                }}
              >
                {formik.values.canEdit
                  ? intl.formatMessage({ id: 'business_plan_update' })
                  : intl.formatMessage({ id: 'business_plan_view' })}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="warning"
                startIcon={<FileAddOutlined />}
                onClick={() => {
                  if (contractCode && hasPermission('BUSINESS_PLAN_CREATE')) {
                    router.push(routing.businessPlan.create(contractCode));
                  } else {
                    enqueueSnackbar(intl.formatMessage({ id: 'save_po_first' }), {
                      variant: 'warning',
                      autoHideDuration: 3000,
                      anchorOrigin: { horizontal: 'right', vertical: 'top' }
                    });
                  }
                }}
                disabled={!contractCode}
                sx={{
                  '&:hover': {
                    backgroundColor: 'warning.main'
                  }
                }}
              >
                {intl.formatMessage({ id: 'add_business_plan' })}
              </Button>
            )}
          </>
        )}
      </Stack>
    </MainCard>
  );
}
