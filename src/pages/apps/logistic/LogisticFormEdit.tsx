import 'react-quill-new/dist/quill.snow.css';

import { useGlobal } from 'contexts/GlobalContext';
import { useFormik } from 'formik';
import moment from 'moment';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router';
import axiosServices from 'utils/axios';

// @assets
// @components
import { Button } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { CircularProgress } from '@mui/material';

// @constants
import { PURCHASE_CONTRACT_API, PURCHASE_CONTRACT_SHIPPING_SCHEDULE } from 'api/constants';

// @utils
import useForwarder from 'api/forwarder';
import useShippingLine from 'api/shipping-line';
import { CODE_REGION } from 'constants/code';
import { Port } from 'sections/constracts/purchase/steps-forms/constract/ContractMockData';
import { SelectionOption } from 'types/common';
import { TContract } from 'types/contract';
import { PurchaseContract } from 'types/purchase-contract';
import { mapForwardersFromMaster } from 'utils/mapForwardersFromMaster';
import { mapGoodTypesFromConfig } from 'utils/mapGoodTypesFromConfig';
import { mapPortDestination } from 'utils/mapPortDestination';
import { mapShippingLinesFromMaster } from 'utils/mapShippingLinesFromMaster';
import { useConfiguration } from '../../../hooks';
import { getLogisticFormValidationSchema } from './validation/logistic';

interface LogisticFormValues {
  code: string | undefined | PurchaseContract;
  containerQuantity: number | undefined;
  etaDate: Date | null; // ISO 8601 format
  etdDate: Date | null;
  shipName: string;
  forwarderName: string | number | undefined;
  shippingLine: string | number | undefined;
  firstContainerDropDate: Date | null;
  cutoffDate: Date | null;
  region: string | undefined;
  departurePort: string | undefined | Port;
  goodsType: number | undefined | string;
  codeBooking: string;
  bookingNumber: string;
  notes: string;
  qualityType: string | undefined;
  // arrivalPort: string;
  // portName: string;
  // vesselCapacity: number;
  // scheduleStatus: string;
}
const LogisticFormEdit = () => {
  const { id } = useParams();
  const intl = useIntl();
  const navigation = useNavigate();

  const { configs, goods } = useGlobal();
  const { mapConfigCustom } = useConfiguration();

  // Fetch data from master APIs
  const { forwarders: forwardersData, forwardersLoading } = useForwarder().list();
  const { shippingLines: shippingLinesData, shippingLinesLoading } = useShippingLine().list();

  const portsOptions = mapConfigCustom(mapPortDestination);
  const qualityTypesData = mapConfigCustom(mapGoodTypesFromConfig);

  // Map master API data to SelectionOption format
  const forwarders: SelectionOption[] = mapForwardersFromMaster(forwardersData || []);
  const shippingLines: SelectionOption[] = mapShippingLinesFromMaster(shippingLinesData || []);

  const regions = configs && configs.length > 0 ? configs.find((item) => item.code === CODE_REGION)?.data : [];

  // Memoize validation schema to prevent infinite re-creation
  const validationSchema = useMemo(() => {
    return getLogisticFormValidationSchema(intl);
  }, [intl]);

  const formik = useFormik<LogisticFormValues>({
    initialValues: {
      code: '',
      containerQuantity: undefined,
      etaDate: null,
      etdDate: null,
      shipName: '',
      forwarderName: '',
      shippingLine: '',
      firstContainerDropDate: null,
      cutoffDate: null,
      region: '',
      departurePort: '',
      goodsType: undefined,
      codeBooking: '',
      bookingNumber: '',
      notes: '',
      qualityType: ''
    },
    validationSchema: validationSchema,
    onSubmit: (values) => onUpateLogisticFormSchedule(values)
  });

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [purchaseContracts, setPurchaseContracts] = useState<PurchaseContract[]>();

  const listPurchaseContractRef = useRef<PurchaseContract[]>(null);

  useEffect(() => {
    fetchGetListContract();
  }, []);

  const fetchGetDetailShippingSchedule = async (id: number) => {
    if (!id) return;
    try {
      const { data, status } = await axiosServices.get(PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON + `/${id}`);
      if (status === 200 || status === 201) {
        const payload = data.data;
        formik.setValues({
          code: listPurchaseContractRef.current?.find((item) => item.id === payload?.purchaseContractId)?.code,
          bookingNumber: payload.bookingNumber,
          containerQuantity: payload.containerQuantity,
          etaDate: moment(payload.etaDate).toDate(),
          etdDate: moment(payload.etdDate).toDate(),
          shipName: payload.shipName,
          forwarderName: forwarders.find(
            (item) =>
              item.label === payload.forwarderName ||
              item.metadata?.nameVn === payload.forwarderName ||
              item.metadata?.nameEn === payload.forwarderName
          )?.value,
          shippingLine: shippingLines.find((item) => item.label === payload.shippingLine || item.metadata?.name === payload.shippingLine)
            ?.value,
          firstContainerDropDate: moment(payload.firstContainerDropDate).toDate(),
          cutoffDate: moment(payload.cutoffDate).toDate(),
          region: regions?.find((item) => item.key === payload.region)?.value,
          departurePort: portsOptions.find((item) => `${item.code} - ${item.name} (${item.country})` === payload.departurePort),
          goodsType: goods.find((item) => item.name === payload.goodsType)?.id,
          codeBooking: payload.code,
          notes: payload.notes,
          qualityType: qualityTypesData.find((item) => item?.label === payload.qualityType)?.value
        });
        // console.log("DATA_TEST", data.data)
      }
    } catch (error) {
      console.log('FETCH FAIL!', error);
      enqueueSnackbar(intl.formatMessage({ id: 'get_detail_unsuccessfully' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      setLoadingDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchGetListContract = async () => {
    try {
      setLoadingDetail(true);
      const { data, status } = await axiosServices.get(PURCHASE_CONTRACT_API.GET_LIST);
      if (status === 200 || status === 201) {
        setPurchaseContracts(data.data.map((item: TContract) => item?.code).filter((item: TContract) => item));
        listPurchaseContractRef.current = data.data;
        fetchGetDetailShippingSchedule(Number(id));
      }
    } catch (error) {
      console.log('FETCH FAIL!', error);
      enqueueSnackbar(intl.formatMessage({ id: 'get_list_of_contract_fail' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  const onGoToLogisticShippingSchedulePage = () => navigation('/logistics/ship');

  const onUpateLogisticFormSchedule = async (values: LogisticFormValues) => {
    if (!id) return;

    const {
      cutoffDate,
      departurePort,
      etaDate,
      etdDate,
      firstContainerDropDate,
      goodsType,
      qualityType,
      forwarderName,
      shippingLine,
      containerQuantity,
      region,
      bookingNumber,
      code,
      codeBooking,
      ...rest
    } = values || {};
    const payload = {
      cutoffDate: cutoffDate ? moment(cutoffDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : '',
      etaDate: etaDate ? moment(etaDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : '',
      etdDate: etdDate ? moment(etdDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : '',
      departurePort: `${(departurePort as any)?.code} - ${(departurePort as any)?.name} (${(departurePort as any)?.country})`,
      firstContainerDropDate: firstContainerDropDate ? moment(firstContainerDropDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : '',
      goodsType: goods.find((item) => item.id === goodsType)?.name,
      qualityType: qualityTypesData.find((item) => item?.value === qualityType)?.label,
      forwarderName: forwarders.find((item) => item.value === forwarderName)?.label,
      shippingLine: shippingLines.find((item) => item.value === shippingLine)?.label,
      containerQuantity: Number(containerQuantity),
      region: regions?.find((item) => item.value === region)?.key,
      purchaseContractId: listPurchaseContractRef.current?.find((item) => item.code === code)?.id,
      code: codeBooking,
      bookingNumber: String(bookingNumber),
      ...rest
    };
    // console.log("PAYLOAD_SUBMIT_createPurchaseContractShipping", { payload, values });
    try {
      setLoading(true);
      const { status } = await axiosServices.put(PURCHASE_CONTRACT_SHIPPING_SCHEDULE.COMMON + `/${id}`, { ...payload });
      if (status === 200 || status === 201) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_update_success_text' }), {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
        setTimeout(() => onGoToLogisticShippingSchedulePage(), 1500);
      }
    } catch (error) {
      console.log('FETCH FAIL!', error);
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

  if (loadingDetail) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 504 }}>
        <CircularProgress size={50} />
      </div>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2, mt: 2 }}>
        {intl.formatMessage({ id: 'shipping_company_information' })}
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'contract_number' })}</InputLabel>
            <Autocomplete
              options={purchaseContracts as any}
              value={formik.values.code}
              onChange={(_, value) => formik.setFieldValue('code', value || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="code"
                  placeholder={intl.formatMessage({ id: 'contract_selected' })}
                  error={formik.touched.code && Boolean(formik.errors.code)}
                  helperText={formik.touched.code && formik.errors.code}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'booking_number' })}</InputLabel>
            <TextField
              id="bookingNumber"
              name="bookingNumber"
              placeholder="123456"
              fullWidth
              value={formik.values.bookingNumber}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldValue('codeBooking', formik.values.code + formik.values.bookingNumber)}
              error={formik.touched.bookingNumber && Boolean(formik.errors.bookingNumber)}
              helperText={formik.touched.bookingNumber && formik.errors.bookingNumber}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'goods_name' })}</InputLabel>
            <Autocomplete
              options={goods}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={goods.find((item) => item.id === formik.values.goodsType) || null}
              onChange={(_, newsValue) => formik.setFieldValue('goodsType', newsValue?.id)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="goodsType"
                  placeholder={intl.formatMessage({ id: 'goods_name' })}
                  error={formik.touched.goodsType && Boolean(formik.errors.goodsType)}
                  helperText={formik.touched.goodsType && formik.errors.goodsType}
                  fullWidth
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
              sx={{ minWidth: 200 }}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'number_of_cont' })}</InputLabel>
            <TextField
              id="containerQuantity"
              name="containerQuantity"
              placeholder={intl.formatMessage({ id: 'number_of_cont' })}
              fullWidth
              value={formik.values.containerQuantity}
              onChange={formik.handleChange}
              // onBlur={formik.handleBlur}
              error={formik.touched.containerQuantity && Boolean(formik.errors.containerQuantity)}
              helperText={formik.touched.containerQuantity && formik.errors.containerQuantity}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          {/*<Stack sx={{ gap: 1 }}>*/}
          {/*  <InputLabel htmlFor="etaDate">{intl.formatMessage({ id: 'eta_shipping_date' })}</InputLabel>*/}
          {/*  <DatePicker*/}
          {/*    value={formik.values.etaDate}*/}
          {/*    format="dd/MM/yyyy"*/}
          {/*    onChange={(newValue) => {*/}
          {/*      formik.setFieldValue('etaDate', newValue);*/}
          {/*    }}*/}
          {/*    onAccept={(newValue) => {*/}
          {/*      formik.setFieldValue('etaDate', newValue);*/}
          {/*      formik.setFieldTouched('etaDate', true);*/}
          {/*    }}*/}
          {/*    slotProps={{*/}
          {/*      textField: {*/}
          {/*        id: 'etaDate',*/}
          {/*        name: 'etaDate',*/}
          {/*        size: 'small',*/}
          {/*        fullWidth: true,*/}
          {/*        error: formik.touched.etaDate && Boolean(formik.errors.etaDate),*/}
          {/*        helperText: formik.touched.etaDate && formik.errors.etaDate ? String(formik.errors.etaDate) : undefined,*/}
          {/*        placeholder: intl.formatMessage({ id: 'eta_shipping_date' }),*/}
          {/*        sx: {*/}
          {/*          '.MuiPickersInputBase-root': {*/}
          {/*            padding: '2px 9px'*/}
          {/*          }*/}
          {/*        }*/}
          {/*      }*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</Stack>*/}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          {/*<Stack sx={{ gap: 1 }}>*/}
          {/*  <InputLabel htmlFor="etdDate">{intl.formatMessage({ id: 'etd_shipping_date' })}</InputLabel>*/}
          {/*  <DatePicker*/}
          {/*    value={formik.values.etdDate}*/}
          {/*    format="dd/MM/yyyy"*/}
          {/*    onChange={(newValue) => {*/}
          {/*      formik.setFieldValue('etdDate', newValue);*/}
          {/*    }}*/}
          {/*    onAccept={(newValue) => {*/}
          {/*      formik.setFieldValue('etdDate', newValue);*/}
          {/*      formik.setFieldTouched('etdDate', true);*/}
          {/*    }}*/}
          {/*    slotProps={{*/}
          {/*      textField: {*/}
          {/*        id: 'etdDate',*/}
          {/*        name: 'etdDate',*/}
          {/*        size: 'small',*/}
          {/*        fullWidth: true,*/}
          {/*        error: formik.touched.etdDate && Boolean(formik.errors.etdDate),*/}
          {/*        helperText: formik.touched.etdDate && formik.errors.etdDate ? String(formik.errors.etdDate) : undefined,*/}
          {/*        placeholder: intl.formatMessage({ id: 'etd_shipping_date' }),*/}
          {/*        sx: {*/}
          {/*          '.MuiPickersInputBase-root': {*/}
          {/*            padding: '2px 9px'*/}
          {/*          }*/}
          {/*        }*/}
          {/*      }*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</Stack>*/}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'shipName' })}</InputLabel>
            <TextField
              id="shipName"
              name="shipName"
              placeholder={intl.formatMessage({ id: 'shipName' })}
              fullWidth
              value={formik.values.shipName}
              onChange={formik.handleChange}
              // onBlur={formik.handleBlur}
              error={formik.touched.shipName && Boolean(formik.errors.shipName)}
              helperText={formik.touched.shipName && formik.errors.shipName}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'forwarderName' })}</InputLabel>
            <Autocomplete
              id="forwarderName"
              options={forwarders}
              getOptionLabel={(option) => option.label || ''}
              value={forwarders.find((f) => f.value === formik.values.forwarderName) || null}
              onChange={(_, newValue) => formik.setFieldValue('forwarderName', newValue ? newValue.value : '')}
              loading={forwardersLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={intl.formatMessage({ id: 'forwarderName' })}
                  error={formik.touched.forwarderName && Boolean(formik.errors.forwarderName)}
                  helperText={formik.touched.forwarderName && formik.errors.forwarderName}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {forwardersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.value === value.value}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'shippingLine' })}</InputLabel>
            <Autocomplete
              id="shippingLineName"
              options={shippingLines}
              getOptionLabel={(option) => option.label || ''}
              value={shippingLines.find((f) => f.value === formik.values.shippingLine) || null}
              onChange={(_, newValue) => formik.setFieldValue('shippingLine', newValue ? newValue.value : '')}
              loading={shippingLinesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="shippingLine"
                  placeholder={intl.formatMessage({ id: 'shippingLine' })}
                  error={formik.touched.shippingLine && Boolean(formik.errors.shippingLine)}
                  helperText={formik.touched.shippingLine && formik.errors.shippingLine}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {shippingLinesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.value === value.value}
            />
          </Stack>
        </Grid>

        {/*<Grid size={{ xs: 12, sm: 6, lg: 4 }}>*/}
        {/*  <Stack sx={{ gap: 1 }}>*/}
        {/*    <InputLabel htmlFor="firstContainerDropDate">{intl.formatMessage({ id: 'firstContainerDropDate' })}</InputLabel>*/}
        {/*    <DatePicker*/}
        {/*      value={formik.values.firstContainerDropDate}*/}
        {/*      format="dd/MM/yyyy"*/}
        {/*      onChange={(newValue) => {*/}
        {/*        formik.setFieldValue('firstContainerDropDate', newValue);*/}
        {/*      }}*/}
        {/*      onAccept={(newValue) => {*/}
        {/*        formik.setFieldValue('firstContainerDropDate', newValue);*/}
        {/*        formik.setFieldTouched('firstContainerDropDate', true);*/}
        {/*      }}*/}
        {/*      slotProps={{*/}
        {/*        textField: {*/}
        {/*          id: 'firstContainerDropDate',*/}
        {/*          name: 'firstContainerDropDate',*/}
        {/*          size: 'small',*/}
        {/*          fullWidth: true,*/}
        {/*          error: formik.touched.firstContainerDropDate && Boolean(formik.errors.firstContainerDropDate),*/}
        {/*          helperText:*/}
        {/*            formik.touched.firstContainerDropDate && formik.errors.firstContainerDropDate*/}
        {/*              ? String(formik.errors.firstContainerDropDate)*/}
        {/*              : undefined,*/}
        {/*          placeholder: intl.formatMessage({ id: 'firstContainerDropDate' }),*/}
        {/*          sx: {*/}
        {/*            '.MuiPickersInputBase-root': {*/}
        {/*              padding: '2px 9px'*/}
        {/*            }*/}
        {/*          }*/}
        {/*        }*/}
        {/*      }}*/}
        {/*    />*/}
        {/*  </Stack>*/}
        {/*</Grid>*/}

        {/*<Grid size={{ xs: 12, sm: 6, lg: 4 }}>*/}
        {/*  <Stack sx={{ gap: 1 }}>*/}
        {/*    <InputLabel htmlFor="cutoffDate">{intl.formatMessage({ id: 'cutoffDate' })}</InputLabel>*/}
        {/*    <DatePicker*/}
        {/*      value={formik.values.cutoffDate}*/}
        {/*      format="dd/MM/yyyy"*/}
        {/*      onChange={(newValue) => {*/}
        {/*        formik.setFieldValue('cutoffDate', newValue);*/}
        {/*      }}*/}
        {/*      onAccept={(newValue) => {*/}
        {/*        formik.setFieldValue('cutoffDate', newValue);*/}
        {/*        formik.setFieldTouched('cutoffDate', true);*/}
        {/*      }}*/}
        {/*      slotProps={{*/}
        {/*        textField: {*/}
        {/*          id: 'cutoffDate',*/}
        {/*          name: 'cutoffDate',*/}
        {/*          size: 'small',*/}
        {/*          fullWidth: true,*/}
        {/*          error: formik.touched.cutoffDate && Boolean(formik.errors.cutoffDate),*/}
        {/*          helperText: formik.touched.cutoffDate && formik.errors.cutoffDate ? String(formik.errors.cutoffDate) : undefined,*/}
        {/*          placeholder: intl.formatMessage({ id: 'cutoffDate' }),*/}
        {/*          sx: {*/}
        {/*            '.MuiPickersInputBase-root': {*/}
        {/*              padding: '2px 9px'*/}
        {/*            }*/}
        {/*          }*/}
        {/*        }*/}
        {/*      }}*/}
        {/*    />*/}
        {/*  </Stack>*/}
        {/*</Grid>*/}

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'region_logistic' })}</InputLabel>
            <Autocomplete
              id="region"
              options={regions as { key: string; value: string }[]}
              getOptionLabel={(option) => option.key || ''}
              value={regions?.find((f) => f.value === formik.values.region) || null}
              onChange={(_, newValue) => formik.setFieldValue('region', newValue ? newValue.value : '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={intl.formatMessage({ id: 'region_logistic' })}
                  error={formik.touched.region && Boolean(formik.errors.region)}
                  helperText={formik.touched.region && formik.errors.region}
                />
              )}
              isOptionEqualToValue={(option, value) => option.value === value.value}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'departurePort' })}</InputLabel>
            <Autocomplete
              freeSolo
              options={portsOptions}
              getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.name}`)}
              // isOptionEqualToValue={(option, value) => option.name === value.name}
              value={portsOptions.find((port) => port.name === (formik.values.departurePort as Port).name) || null}
              onInputChange={(_, newValue) => formik.setFieldValue('departurePort', newValue)}
              onChange={(_, newValue) => formik.setFieldValue('departurePort', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={formik.touched.departurePort && Boolean(formik.errors.departurePort)}
                  helperText={formik.touched.departurePort && formik.errors.departurePort}
                  placeholder={intl.formatMessage({ id: 'departurePort' })}
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

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'qualityType' })}</InputLabel>
            <Autocomplete
              options={qualityTypesData}
              getOptionLabel={(option) => option.label}
              value={qualityTypesData.find((type) => type.value === formik.values.qualityType) || null}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              onChange={(_, newValue) => formik.setFieldValue('qualityType', newValue?.value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="qualityType"
                  placeholder={intl.formatMessage({ id: 'good_quality' })}
                  error={formik.touched.qualityType && Boolean(formik.errors.qualityType)}
                  helperText={formik.touched.qualityType && formik.errors.qualityType}
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

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'code_booking' })}</InputLabel>
            <TextField
              slotProps={{
                input: { readOnly: true }
              }}
              id="codeBooking"
              name="codeBooking"
              placeholder="CM001-NAM-FX99-123456"
              fullWidth
              value={formik.values.codeBooking}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.codeBooking && Boolean(formik.errors.codeBooking)}
              helperText={formik.touched.codeBooking && formik.errors.codeBooking}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>{intl.formatMessage({ id: 'notes' })}</InputLabel>
            <TextField
              id="notes"
              name="notes"
              placeholder={intl.formatMessage({ id: 'notes' })}
              multiline
              rows={3}
              fullWidth
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
            />
          </Stack>
        </Grid>
      </Grid>
      <Grid size={12} sx={{ mt: 3 }}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', mt: 4 }}>
          <Button type="submit" variant="contained" onClick={() => onGoToLogisticShippingSchedulePage()}>
            {intl.formatMessage({ id: 'common_goback' })}
          </Button>
          <Button type="submit" variant="contained" loading={loading}>
            {intl.formatMessage({ id: 'common_button_update' })}
          </Button>
        </Stack>
      </Grid>
    </form>
  );
};

export default LogisticFormEdit;
