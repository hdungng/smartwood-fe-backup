import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosServices from 'utils/axios';

import { useFormik } from 'formik';
import moment from 'moment';

// @components
import { Autocomplete, Button, CircularProgress, Grid, InputLabel, Stack, TextField, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { ListGoodTable, ListGoodTableRef } from './components/list-good-table';

// @constants
import { SALE_CONTRACT } from 'api/CommonAPI/Contract';
import { BUSINESS_PLAN_API, CUSTOMER_API } from 'api/constants';

// @validation
import { getContractSellValidationSchema } from 'validations/form-validation/sell-contract-form';

// @utils
import { dateHelper, formatNumber } from 'utils/index';

// @type
import { CODE_DELIVERY_METHOD, CODE_DESTINATION, CODE_EXPORT_PORT, CODE_PAYMENT_CURRENCY, CODE_PAYMENT_METHOD, CODE_UNIT_OF_MEASURE } from 'constants/code';
import { SMARTWOOD_SELECTIONS } from 'constants/smartwood';
import { useConfiguration } from 'hooks/useConfiguration';
import { TContractSell } from 'types/contracts/sell';
import { mapDeliveryTermsFromConfig } from 'utils/mapDeliveryTermsFromConfig';
import { mapPaymentTermsFromConfig } from 'utils/mapPaymentTermsFromConfig';
import { mapUnitsFromConfig } from 'utils/mapUnitsFromConfig';
import { useGlobal } from '../../../../contexts';

interface UpdateOrCreateProps {
  isViewMode?: boolean;
}

export default function ContractSellUpdateOrCreate({ isViewMode = false }: UpdateOrCreateProps) {
  const navigate = useNavigate();
  const intl = useIntl();
  const { id } = useParams(); // Add this to get ID from URL
  const location = useLocation();
  const { configs } = useGlobal();
  const { mapConfigObject, configs: configList, mapConfigCustom } = useConfiguration();
  const { goodOptions } = useGlobal();
  // Helper function to find code by display name (reverse lookup)
  const findCodeByDisplayName = (configCode: string, displayName: string) => {
    const config = configList?.find((item) => item.code === configCode);
    if (!config) return displayName;

    const configItem = config.data?.find((item: any) => item.key === displayName);
    return configItem?.value || displayName;
  };


  // Check if we're in view mode from location state
  const isViewFromState = location.state?.isView || false;
  // Only set view mode if explicitly passed as prop or from location state
  const isViewModeFinal = isViewMode || isViewFromState;

  const [optionsLoading, setOptionsLoading] = useState<boolean>(false);

  // State for business plans
  const [businessPlans, setBusinessPlans] = useState<any[]>([]);
  const [businessPlansLoading, setBusinessPlansLoading] = useState<boolean>(false);
  const [selectedBusinessPlanDetail, setSelectedBusinessPlanDetail] = useState<any>(null);
  const [businessPlanDetailLoading, setBusinessPlanDetailLoading] = useState<boolean>(false);
  const [showWeightWarning, setShowWeightWarning] = useState(false);

  // Add ref to access ListGoodTable form values
  const listGoodTableRef = useRef<ListGoodTableRef>(null);

  const unitsData = useMemo(() => (configs && configs.length > 0 ? mapUnitsFromConfig(configs) : []), []);
  const paymentTermData = useMemo(() => (configs && configs.length > 0 ? mapPaymentTermsFromConfig(configs) : []), []);
  const paymentTerms = mapConfigCustom(mapPaymentTermsFromConfig);
  const deliveryTermData = useMemo(() => (configs && configs.length > 0 ? mapDeliveryTermsFromConfig(configs) : []), []);

  const formik = useFormik<TContractSell>({
    initialValues: {
      code: '',
      saleContractCode: '',
      codeBooking: null,
      contractDate: new Date(),
      buyerName: '',
      sellerId: 0, // Changed to sellerId as number
      notes: '',
      goodDescription: '',
      paymentTerm: '',
      deliveryTerm: '', // Added missing field
      tolerancePercentage: null,
      endUserThermalPower: '',
      weightPerContainer: null,
      lcContractNumber: '',
      lcNumber: '',
      lcDate: new Date(),
      paymentDeadline: new Date(),
      issuingBankId: null,
      advisingBankId: null,
      currency: '',
      lcStatus: '',
      buyerTaxCode: '',
      buyerRepresentative: '',
      buyerPhone: '',
      buyerAddress: '',
      goodId  : 0,
      totalWeight: null,
      contractId: 0
    },
    validationSchema: isViewModeFinal ? undefined : getContractSellValidationSchema(intl),
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    validate: (values) => {
      const errors: any = {};
      
      return errors;
    },
    onSubmit: (values) => {

      if (isViewModeFinal) {
        // In view mode, just navigate back
        navigate('/contracts/sales/list');
        return;
      }

      // Check if form is valid before submitting
      if (!formik.isValid) {
        enqueueSnackbar(intl.formatMessage({ id: 'please_fix_validation_errors' }), {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
        return;
      }

      if (id) {
        onUpdateSellContract(values);
      } else {
        onCreateSellContract(values);
      }
    }
  });

  const listBusinessPlanRef = useRef<any[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBusinessPlan, setSelectedBusinessPlan] = useState<any>();
  const [transportInfo, setTransportInfo] = useState<any[]>([]);

  // Function to get transport info from ListGoodTable
  const getTransportInfo = () => {
    if (!listGoodTableRef.current) {
      return [];
    }

    try {
      const formValues = listGoodTableRef.current.getFormValues();

      if (!formValues || !formValues.contractDetailsRows) {
        return [];
      }

      const fallbackImportKey = selectedBusinessPlanDetail?.draftPo?.deliveryLocation;

      const validRows = formValues.contractDetailsRows.filter((row: any) => {
        const hasExport = Boolean(row.exportPort);
        const hasImport = Boolean(row.importPort || fallbackImportKey);
        const isValid = hasExport && hasImport;
        return isValid;
      });

      const mappedRows = validRows.map((row: any) => {
        // Use helper function to find codes from display names
        // If row.exportPort is already a code (value), it will return as is
        // If row.exportPort is a display name (key), it will find the corresponding code (value)
        const exportPortCode = findCodeByDisplayName(CODE_EXPORT_PORT, row.exportPort);
        const importPortCode = findCodeByDisplayName(
          CODE_DESTINATION,
          row.importPort || fallbackImportKey || ''
        );

        // Get unit, unitPrice, and currency from businessPlanDetail (readonly fields)
        const unitOfMeasure = selectedBusinessPlanDetail?.draftPo?.unitOfMeasure;
        const unitPrice = selectedBusinessPlanDetail?.draftPo?.unitPrice;
        const paymentCurrency = selectedBusinessPlanDetail?.draftPo?.paymentCurrency;

        // For unit and currency, these should already be codes from the business plan
        // But we can still use the helper function as a safety check
        const unitCode = findCodeByDisplayName(CODE_UNIT_OF_MEASURE, unitOfMeasure) || unitOfMeasure;
        const currencyCode = findCodeByDisplayName(CODE_PAYMENT_CURRENCY, paymentCurrency) || paymentCurrency;

        return {
          exportPort: exportPortCode,
          importPort: importPortCode,
          unit: unitCode,
          unitPrice: unitPrice || 0,
          currency: currencyCode
        };
      });

      return mappedRows;
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    fetchGetListBusinessPlan();
  }, []);

  // Refetch business plan list after contractId is populated in edit mode
  useEffect(() => {
    if (id && formik.values.contractId && formik.values.contractId !== 0) {
      fetchGetListBusinessPlan();
    }
  }, [id, formik.values.contractId]);

  useEffect(() => {
    if (id && paymentTermData.length > 0 && deliveryTermData.length > 0) {
      // If we have an ID and options are loaded, we're in edit mode
      fetchGetDetailSaleContract();
    }
  }, [id, paymentTermData, deliveryTermData]);

  // Set delivery term when business plan detail is loaded and deliveryTermData is available
  useEffect(() => {
    if (deliveryTermData.length > 0) {
      let deliveryMethod = null;
      
      // First try to get from business plan detail
      if (selectedBusinessPlanDetail?.draftPo?.deliveryMethod) {
        deliveryMethod = selectedBusinessPlanDetail.draftPo.deliveryMethod;
      } 
      // Then try to get from selected business plan
      else if (selectedBusinessPlan?.deliveryMethod) {
        deliveryMethod = selectedBusinessPlan.deliveryMethod;
      }
      
      if (deliveryMethod) {
        const deliveryTerm = deliveryTermData.find((term) => term.code === deliveryMethod);
        if (deliveryTerm && !formik.values.deliveryTerm) {
          formik.setFieldValue('deliveryTerm', deliveryTerm.code);
        }
      }
    }
  }, [deliveryTermData, selectedBusinessPlan, selectedBusinessPlanDetail]);

  // Update goodName when selectedBusinessPlanDetail changes
  useEffect(() => {
    if (selectedBusinessPlanDetail?.draftPo?.goodId) {
      formik.setFieldValue('goodId', selectedBusinessPlanDetail.draftPo.goodId);
    }
  }, [selectedBusinessPlanDetail, formik.setFieldValue]);

  useEffect(() => {
    if (selectedBusinessPlan && selectedBusinessPlanDetail?.draftPo?.goodId) {
      formik.setFieldValue('goodId', selectedBusinessPlanDetail.draftPo.goodId);
    }
  }, [selectedBusinessPlan, selectedBusinessPlanDetail, formik.setFieldValue]);

  // Update weightPerContainer when selectedBusinessPlanDetail changes
  useEffect(() => {
    if (selectedBusinessPlanDetail?.businessPlanTransactionInfoItem?.weightPerContainer) {
      formik.setFieldValue('weightPerContainer', selectedBusinessPlanDetail.businessPlanTransactionInfoItem.weightPerContainer);
    }
  }, [selectedBusinessPlanDetail, formik.setFieldValue]);

  // Handle business plan selection in edit mode when data is loaded
  useEffect(() => {
    if (id && selectedBusinessPlan?.businessPlanId && listBusinessPlanRef.current) {
      const businessPlan = listBusinessPlanRef.current.find((item: any) => item.id === selectedBusinessPlan.businessPlanId);
      if (businessPlan && formik.values.code !== businessPlan.code) {
        formik.setFieldValue('code', businessPlan.code);
      }
    }
  }, [id, selectedBusinessPlan?.businessPlanId, listBusinessPlanRef.current]);

  const fetchGetListBusinessPlan = async () => {
    try {
      setBusinessPlansLoading(true);
      const { data, status } = await axiosServices.get(
        BUSINESS_PLAN_API.BUSINESS_PLAN +
          '/not-link-sale-contract' +
          `${id && formik.values.contractId != 0 ? `?contractId=${formik.values.contractId}` : ''}`
      );
      if (status === 200 || status === 201) {
        setBusinessPlans(data.data.map((item: any) => item?.code).filter((item: any) => item));
        listBusinessPlanRef.current = data.data;
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'get_list_of_business_plan_fail' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    } finally {
      setBusinessPlansLoading(false);
    }
  };

  const fetchBusinessPlanDetail = async (businessPlanId: number) => {
    if (!businessPlanId) return;
    try {
      setBusinessPlanDetailLoading(true);
      const { data, status } = await axiosServices.get(BUSINESS_PLAN_API.BUSINESS_PLAN + `/${businessPlanId}`);
      if (status === 200 || status === 201) {
        setSelectedBusinessPlanDetail(data.data);

        // Populate default fields from business plan data
        const businessPlanData = data.data;
        const draftPo = businessPlanData?.draftPo;

        // Ensure the form's code reflects the Business Plan (PAKD) code in both create and edit modes
        if (businessPlanData?.code) {
          formik.setFieldValue('code', businessPlanData.code);
        }

        if (draftPo) {
          // Only set default values in CREATE mode, not EDIT mode
          if (!id) {
            // Set goods type
            formik.setFieldValue('goodId', draftPo.goodId || 0);

            // Set delivery terms (from draftPo.deliveryMethod)
            const deliveryMethod = draftPo.deliveryMethod;
            if (deliveryMethod && deliveryTermData.length > 0) {
              const deliveryTerm = deliveryTermData.find((term) => term.code === deliveryMethod);
              if (deliveryTerm) {
                formik.setFieldValue('deliveryTerm', deliveryTerm.code);
              }
            } else if (deliveryMethod) {
              // deliveryTermData not loaded yet, set raw code
              formik.setFieldValue('deliveryTerm', deliveryMethod);
            }

            // Set payment method (from draftPo.paymentMethod)
            const paymentMethod = draftPo.paymentMethod;
            if (paymentMethod) {
              formik.setFieldValue('paymentTerm', paymentMethod);
            }
          } else {
          }
        }
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'get_business_plan_detail_fail' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    } finally {
      setBusinessPlanDetailLoading(false);
    }
  };

  const fetchGetDetailSaleContract = async () => {
    if (!id) return;
    try {
      const { data, status } = await axiosServices.get(SALE_CONTRACT.COMMON + `/${id}`);
      if (status === 200 || status === 201) {
        const {
          advisingBankId,
          buyerName,
          code,
          codeBooking,
          contractDate,
          currency,
          endUserThermalPower,
          issuingBankId,
          lcDate,
          lcNumber,
          lcContractNumber,
          lcStatus,
          paymentDeadline,
          paymentTerm,
          tolerancePercentage,
          weightPerContainer,
          customerId,
          goodId,
          totalWeight,
          goodDescription,
          deliveryTerm,
          transportInfo,
          contractId,
          businessPlanId,
          saleContractCode
        } = data.data || {};

        // Wait for paymentTermData and deliveryTermData to be loaded
        // Handle both string codes and numeric IDs
        let paymentTermCode = '';
        let deliveryTermCode = '';

        if (typeof paymentTerm === 'string') {
          // If paymentTerm is already a string code
          paymentTermCode = paymentTerm;
        } else {
          // If paymentTerm is a numeric ID, find the corresponding code
          const foundPaymentTerm = paymentTermData.find((item) => item.id === paymentTerm);
          paymentTermCode = foundPaymentTerm?.code || '';
        }

        if (typeof deliveryTerm === 'string') {
          // If deliveryTerm is already a string code
          deliveryTermCode = deliveryTerm;
        } else {
          // If deliveryTerm is a numeric ID, find the corresponding code
          const foundDeliveryTerm = deliveryTermData.find((item) => item.id === deliveryTerm);
          deliveryTermCode = foundDeliveryTerm?.code || '';
        }

        const formValues = {
          code: '',
          saleContractCode: saleContractCode || code,
          codeBooking: codeBooking,
          contractDate: new Date(moment(contractDate).year() < moment().year() ? moment().format() : contractDate),
          buyerName: buyerName,
          sellerId: data.data?.sellerId || 0, // Add sellerId from API
          notes: '',
          goodDescription: goodDescription || '',
          goodId: goodId || 0,
          totalWeight: totalWeight,
          paymentTerm: paymentTermCode,
          deliveryTerm: deliveryTermCode,
          tolerancePercentage: tolerancePercentage,
          endUserThermalPower: endUserThermalPower,
          weightPerContainer: weightPerContainer,
          lcContractNumber: lcContractNumber || '',
          lcNumber: lcNumber || '',
          lcDate: new Date(moment(contractDate).year() < moment().year() ? moment().format() : lcDate),
          paymentDeadline: new Date(moment(contractDate).year() < moment().year() ? moment().format() : paymentDeadline),
          issuingBankId: issuingBankId,
          advisingBankId: advisingBankId,
          currency: currency,
          lcStatus: lcStatus,
          buyerTaxCode: '',
          buyerRepresentative: '',
          buyerPhone: '',
          buyerAddress: '',
          contractId: contractId
        };

        formik.setValues(formValues);

        // For edit mode, create the selectedBusinessPlan object with the correct data
        const selectedBusinessPlanData = {
          id: contractId || 0,
          code: '',
          customerId: customerId || 0,
          saleContractId: parseInt(id),
          contractId: contractId || 0,
          createdAt: data.data?.createdAt || '',
          lastUpdatedAt: data.data?.lastUpdatedAt || '',
          createdBy: data.data?.createdBy || 0,
          lastUpdatedBy: data.data?.lastUpdatedBy || 0,
          lastProgramUpdate: data.data?.lastProgramUpdate || null,
          status: data.data?.status || 0,
          lastUpdatedProgram: data.data?.lastUpdatedProgram || '',
          notes: data.data?.notes || '',
          businessPlanId: businessPlanId || 0,
          draftPoId: data.data?.draftPoId || 0,
          purchaseContractId: data.data?.purchaseContractId || null
        };

        setSelectedBusinessPlan(selectedBusinessPlanData);

        // In edit mode, we need to find the business plan code from the businessPlanId
        if (businessPlanId && listBusinessPlanRef.current) {
          const businessPlan = listBusinessPlanRef.current.find((item: any) => item.id === businessPlanId);
          if (businessPlan) {
            formik.setFieldValue('code', businessPlan.code);
          }
        }

        // Set transport info if available
        if (transportInfo && transportInfo.length > 0) {
          // Transform transport info to match the expected format
          const transformedTransportInfo = transportInfo.map((item: any) => ({
            id: item.id || 0,
            saleContractId: item.saleContractId || parseInt(id),
            exportPort: item.exportPort || '',
            importPort: item.importPort || '',
          }));
          setTransportInfo(transformedTransportInfo);
        }

        // Fetch customer information
        if (customerId) {
          fetchGetCustomerById(customerId);
        }

        // Fetch business plan detail if businessPlanId exists
        // In edit mode, we need to fetch business plan detail after setting form values
        // to avoid overriding the values from saleContract
        if (businessPlanId) {
          // Use setTimeout to ensure form values are set before fetching business plan detail
          setTimeout(() => {
            fetchBusinessPlanDetail(businessPlanId);
          }, 100);
        }
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'get_detail_sale_contract_fail' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  const fetchGetCustomerById = async (id: number | undefined) => {
    if (!id) return;
    try {
      const { data, status } = await axiosServices.get(CUSTOMER_API.COMMON + `/${id}`);
      if (status === 201 || status === 200) {
        formik.setFieldValue('buyerName', data.data.name || '');
        formik.setFieldValue('buyerTaxCode', data.data.taxCode || '');
        formik.setFieldValue('buyerRepresentative', data.data.represented || '');
        formik.setFieldValue('buyerPhone', data.data.phone || '');
        formik.setFieldValue('buyerAddress', data.data.address || '');
      }
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'getting_error_buyer_info' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  const onCreateSellContract = async (values: TContractSell) => {
    const paymentDetail = paymentTermData.find((item) => item.code === values.paymentTerm);
    const deliveryDetail = deliveryTermData.find((item) => item.code === values.deliveryTerm);

    // Get transport info from ListGoodTable
    const transportInfo = getTransportInfo();

    // Transform data to match API spec exactly - CREATE MODE
    const payload = {
      contractId: selectedBusinessPlan?.contractId || 0,
      saleContractCode: values.saleContractCode,
      sellerId: values.sellerId, // Include sellerId
      contractDate: moment(values.contractDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      customerId: selectedBusinessPlan?.customerId || 0,
      goodId: selectedBusinessPlanDetail?.draftPo?.goodId || 0,
      totalWeight: values.totalWeight || 0,
      goodDescription: values.goodDescription,
      paymentTerm: paymentDetail?.code || '',
      deliveryTerm: deliveryDetail?.code || '',
      tolerancePercentage: values.tolerancePercentage || 0,
      endUserThermalPower: values.endUserThermalPower,
      weightPerContainer: values.weightPerContainer || 0,
      lcContractNumber: values.lcContractNumber,
      lcNumber: values.lcNumber,
      lcDate: moment(values.lcDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      paymentDeadline: moment(values.paymentDeadline).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      unit: selectedBusinessPlanDetail?.draftPo?.unitOfMeasure || '',
      unitPrice: selectedBusinessPlanDetail?.draftPo?.unitPrice || 0,
      currency: selectedBusinessPlanDetail?.draftPo?.paymentCurrency || '',
      transportInfo: transportInfo.length > 0 ? transportInfo.map((item) => {
        console.log('Mapping transport info item:', item);
        return {
          exportPort: item.exportPort,
          importPort: item.importPort
        };
      }) : []
    };

    try {
      console.log('Sending payload to API:', payload);
      setLoading(true);
      const { data, status } = await axiosServices.post(SALE_CONTRACT.BULK, payload);
      console.log('API response:', { data, status });
      if (status === 200 || status === 201) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
        navigate('/contracts/sales/list');
      }
    } catch (error) {
      console.error('API error:', error);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const onUpdateSellContract = async (values: TContractSell) => {
    console.log('onUpdateSellContract called with values:', values);
    const paymentDetail = paymentTermData.find((item) => item.code === values.paymentTerm);
    const deliveryDetail = deliveryTermData.find((item) => item.code === values.deliveryTerm);

    // Get transport info from ListGoodTable
    const transportInfo = getTransportInfo();
    console.log('Transport info:', transportInfo);

    // Transform data to match API spec exactly - UPDATE MODE
    const payload = {
      contractId: selectedBusinessPlan?.contractId || 0,
      saleContractCode: values.saleContractCode,
      sellerId: values.sellerId, // Include sellerId
      contractDate: moment(values.contractDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      customerId: selectedBusinessPlan?.customerId || 0,
      goodId: selectedBusinessPlanDetail?.draftPo?.goodId || 0,
      totalWeight: values.totalWeight || 0,
      goodDescription: values.goodDescription,
      paymentTerm: paymentDetail?.code || '',
      deliveryTerm: deliveryDetail?.code || '',
      tolerancePercentage: values.tolerancePercentage || 0,
      endUserThermalPower: values.endUserThermalPower,
      weightPerContainer: values.weightPerContainer || 0,
      lcContractNumber: values.lcContractNumber,
      lcNumber: values.lcNumber,
      lcDate: moment(values.lcDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      paymentDeadline: moment(values.paymentDeadline).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      unit: selectedBusinessPlanDetail?.draftPo?.unitOfMeasure || '',
      unitPrice: selectedBusinessPlanDetail?.draftPo?.unitPrice || 0,
      currency: selectedBusinessPlanDetail?.draftPo?.paymentCurrency || '',
      goodType: selectedBusinessPlanDetail?.draftPo?.goodType || '',
      transportInfo: transportInfo.map((item) => ({
        exportPort: item.exportPort,
        importPort: item.importPort,
        unit: item.unit,
        unitPrice: item.unitPrice,
        currency: item.currency
      }))
    };

    try {
      console.log('Sending update payload to API:', payload);
      setLoading(true);
      const { data, status } = await axiosServices.put(SALE_CONTRACT.UPDATE(parseInt(id || '0')), payload);
      console.log('Update API response:', { data, status });
      if (status === 200 || status === 201) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
        navigate('/contracts/sales/list');
      }
    } catch (error) {
      console.error('Update API error:', error);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render form fields with read-only support
  const renderTextField = (
    fieldName: keyof TContractSell,
    label: string,
    placeholder: string,
    required: boolean = false,
    multiline: boolean = false,
    rows: number = 1
  ) => (
    <TextField
      type="text"
      id={fieldName}
      name={fieldName}
      placeholder={placeholder}
      fullWidth
      multiline={multiline}
      rows={rows}
      value={formik.values[fieldName]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[fieldName] && Boolean(formik.errors[fieldName])}
      helperText={formik.touched[fieldName] && formik.errors[fieldName]}
      slotProps={{
        input: {
          readOnly: isViewModeFinal,
          style: isViewModeFinal ? { backgroundColor: '#f5f5f5' } : {}
        }
      }}
    />
  );

  const renderDateField = (fieldName: keyof TContractSell, label: string, placeholder: string, required: boolean = false) => (
    <DatePicker
      value={dateHelper.from(formik.values[fieldName])}
      format="DD/MM/YYYY"
      disabled={isViewModeFinal}
      onChange={(newValue) => {
        if (isViewModeFinal) return;
        const date = newValue instanceof Date ? newValue : newValue?.toDate();
        formik.setFieldValue(fieldName, date || dateHelper.now().toDate());
      }}
      onAccept={(newValue) => {
        if (isViewModeFinal) return;
        const date = newValue instanceof Date ? newValue : newValue?.toDate();
        formik.setFieldValue(fieldName, date || dateHelper.now().toDate());
        formik.setFieldTouched(fieldName, true);
      }}
      slotProps={{
        textField: {
          id: fieldName,
          name: fieldName,
          size: 'small',
          fullWidth: true,
          error: formik.touched[fieldName] && Boolean(formik.errors[fieldName]),
          helperText: formik.touched[fieldName] && formik.errors[fieldName] ? String(formik.errors[fieldName]) : undefined,
          placeholder: placeholder,
          sx: {
            '.MuiPickersInputBase-root': {
              padding: '2px 9px'
            }
          },
          slotProps: {
            input: {
              readOnly: isViewModeFinal,
              style: isViewModeFinal ? { backgroundColor: '#f5f5f5' } : {}
            }
          }
        }
      }}
    />
  );

  // Hàm render cho các trường thông tin khách hàng chỉ hiển thị (readonly)
  const renderReadonlyTextField = (
    fieldName: keyof TContractSell,
    label: string,
    placeholder: string,
    multiline: boolean = false,
    rows: number = 1
  ) => (
    <TextField
      type="text"
      id={fieldName}
      name={fieldName}
      placeholder={placeholder}
      fullWidth
      multiline={multiline}
      rows={rows}
      value={formik.values[fieldName] || ''}
      InputProps={{
        readOnly: true,
        style: { backgroundColor: '#f5f5f5', color: 'text.secondary' }
      }}
      sx={{
        '& .MuiInputBase-root': {
          backgroundColor: '#f5f5f5',
          '&:hover': {
            backgroundColor: '#f0f0f0'
          }
        },
        '& .MuiInputBase-input': {
          color: 'text.secondary',
          cursor: 'default'
        }
      }}
    />
  );

  return (
    <MainCard
      title={intl.formatMessage({ id: isViewModeFinal ? 'view_sell_contract' : id ? 'edit_sell_contract' : 'create_sell_contract' })}
    >
      <form onSubmit={formik.handleSubmit}>
        {/* Contract Code and Signing Date */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Số hợp đồng bán*/}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'sale_contract_number' })} <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              {renderTextField('saleContractCode', 'sale_contract_number', intl.formatMessage({ id: 'enter_sale_contract_number' }), true)}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'business_plan_code' })} <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <Autocomplete
                options={businessPlans}
                value={formik.values.code}
                onChange={(_, value) => {
                  if (isViewModeFinal) return;
                  formik.setFieldValue('code', value || '');
                  const selected = listBusinessPlanRef.current?.find((item: any) => item.code === value);
                  setSelectedBusinessPlan(selected);

                  if (selected) {
                    fetchGetCustomerById(selected.customerId);
                    fetchBusinessPlanDetail(selected.id);

                    // Set delivery term immediately if available
                    if (selected.deliveryMethod && deliveryTermData.length > 0) {
                      const deliveryTerm = deliveryTermData.find((term) => term.code === selected.deliveryMethod);
                      if (deliveryTerm) {
                        formik.setFieldValue('deliveryTerm', deliveryTerm.code);
                      }
                    }
                    // Set payment term immediately if available on selected business plan object
                    if ((selected as any)?.paymentMethod) {
                      formik.setFieldValue('paymentTerm', (selected as any).paymentMethod);
                    }

                    // In create mode, clear totalWeight to show placeholder
                    if (!id) {
                      formik.setFieldValue('totalWeight', null);
                      // Clear goodName to ensure it gets updated from business plan detail
                      formik.setFieldValue('goodName', '');
                    }
                  } else {
                    // Clear all default values when unselecting business plan

                    setSelectedBusinessPlan(null);
                    setSelectedBusinessPlanDetail(null);

                     formik.setFieldValue('goodId', 0);
                    formik.setFieldValue('goodName', '');
                    formik.setFieldValue('totalWeight', null);
                    formik.setFieldValue('weightPerContainer', null);

                    // Clear customer information
                    formik.setFieldValue('buyerName', '');
                    formik.setFieldValue('buyerTaxCode', '');
                    formik.setFieldValue('buyerRepresentative', '');
                    formik.setFieldValue('buyerPhone', '');
                    formik.setFieldValue('buyerAddress', '');

                    // Clear payment and delivery terms in create mode only
                    if (!id) {
                      formik.setFieldValue('paymentTerm', '');
                      formik.setFieldValue('deliveryTerm', '');
                    }
                  }
                }}
                loading={businessPlansLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="code"
                    placeholder={intl.formatMessage({ id: 'business_plan_selected' })}
                    error={formik.touched.code && Boolean(formik.errors.code)}
                    helperText={formik.touched.code && formik.errors.code}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {businessPlansLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        backgroundColor: isViewModeFinal ? '#f5f5f5' : 'transparent'
                      }
                    }}
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
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                Tên bên bán <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <Autocomplete
                options={SMARTWOOD_SELECTIONS}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                value={SMARTWOOD_SELECTIONS.find((option) => option.value === formik.values.sellerId) || null}
                onChange={(_, newValue) => {
                  if (isViewModeFinal) return;
                  formik.setFieldValue('sellerId', newValue?.value || 0);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="sellerId"
                    placeholder="Chọn bên bán"
                    error={formik.touched.sellerId && Boolean(formik.errors.sellerId)}
                    helperText={formik.touched.sellerId && formik.errors.sellerId}
                    sx={{
                      '& .MuiInputBase-root': {
                        backgroundColor: isViewModeFinal ? '#f5f5f5' : 'transparent'
                      }
                    }}
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
          {/* Ngày ký hợp đồng */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="contractDate">
                {intl.formatMessage({ id: 'date_signed_contract' })} <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              {renderDateField('contractDate', 'date_signed_contract', intl.formatMessage({ id: 'date_signed_contract' }), true)}
            </Stack>
          </Grid>
        </Grid>

        {/* Tên khách hàng + mã KH */}
        <Grid container spacing={3}>
          <Grid size={12}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 2,
                mt: 2,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {intl.formatMessage({ id: 'buyer_information' })}
            </Typography>
          </Grid>

          {/* Tên khách hàng */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>{intl.formatMessage({ id: 'customer_name_label_po' })}</InputLabel>
              {renderReadonlyTextField('buyerName', 'customer_name_label_po', intl.formatMessage({ id: 'enter_buyer_name' }))}
            </Stack>
          </Grid>

          {/* Mã số thuế bên mua */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>{intl.formatMessage({ id: 'buyer_tax_code' })}</InputLabel>
              {renderReadonlyTextField('buyerTaxCode', 'buyer_tax_code', intl.formatMessage({ id: 'enter_buyer_tax_code' }))}
            </Stack>
          </Grid>

          {/* Người đại diện pháp luật bên mua */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>{intl.formatMessage({ id: 'buyer_legal_representative' })}</InputLabel>
              {renderReadonlyTextField(
                'buyerRepresentative',
                'buyer_legal_representative',
                intl.formatMessage({ id: 'enter_buyer_legal_representative' })
              )}
            </Stack>
          </Grid>

          {/* Số điện thoại bên mua */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>{intl.formatMessage({ id: 'buyer_phone' })}</InputLabel>
              {renderReadonlyTextField('buyerPhone', 'buyer_phone', '0909090909')}
            </Stack>
          </Grid>

          {/* Địa chỉ bên mua */}
          <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>{intl.formatMessage({ id: 'buyer_address' })}</InputLabel>
              {renderReadonlyTextField('buyerAddress', 'buyer_address', intl.formatMessage({ id: 'enter_buyer_address' }), true, 3)}
            </Stack>
          </Grid>
          {/* Contract Details Section */}
          <Grid size={12}>
            <Typography variant="subtitle1" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
              {intl.formatMessage({ id: 'contract_details' })}
            </Typography>
          </Grid>

          {/* Loại hàng hóa */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'goods_type_header' })}{' '}
                <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>

              <TextField
                type="text"
                id="goodId"
                name="goodId"
                placeholder="Loại hàng hóa"
                fullWidth
                value={(() => {
                  const selectedGood = goodOptions.find((good) => good.value === formik.values.goodId);
                  return selectedGood ? selectedGood.label : '';
                })()}
                InputProps={{
                  readOnly: true,
                  style: { backgroundColor: '#f5f5f5', color: 'text.secondary' }
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: '#f5f5f5',
                    '&:hover': {
                      backgroundColor: '#f0f0f0'
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: 'text.secondary',
                    cursor: 'default'
                  }
                }}
              />

              {selectedBusinessPlanDetail && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {intl.formatMessage({ id: 'default_from_draft_po' })}
                </Typography>
              )}
            </Stack>
          </Grid>


          {/* Tổng khối lượng */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'total_weight_header' })} <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <TextField
                type="number"
                id="totalWeight"
                name="totalWeight"
                disabled={isViewModeFinal}
                placeholder={selectedBusinessPlanDetail?.draftPo?.quantity || intl.formatMessage({ id: 'weight_placeholder' })}
                fullWidth
                value={formik.values.totalWeight ?? ''}
                onChange={(e) => {
                  formik.handleChange(e);
                  const inputValue = parseFloat(e.target.value);
                  const expectedQuantity = parseFloat(selectedBusinessPlanDetail?.draftPo?.quantity);

                  if (selectedBusinessPlanDetail?.draftPo?.quantity && inputValue !== expectedQuantity) {
                    setShowWeightWarning(true);
                  } else {
                    setShowWeightWarning(false);
                  }
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.totalWeight && Boolean(formik.errors.totalWeight)}
                helperText={formik.touched.totalWeight && formik.errors.totalWeight}
                InputProps={{
                  endAdornment: (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {(() => {
                        const unitOfMeasure = selectedBusinessPlanDetail?.draftPo?.unitOfMeasure;
                        if (unitOfMeasure && unitsData.length > 0) {
                          const unitConfig = unitsData.find((unit: any) => unit.code === unitOfMeasure);
                          return unitConfig?.name || unitOfMeasure;
                        }
                        return unitOfMeasure || 'Tấn';
                      })()}
                    </Typography>
                  )
                }}
              />
              {showWeightWarning && (
                <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>
                  ⚠️ Cảnh báo: Trọng lượng khác với dự kiến ({selectedBusinessPlanDetail?.draftPo?.quantity})
                </Typography>
              )}
            </Stack>
          </Grid>

          {/* Đơn giá */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>{intl.formatMessage({ id: 'unit_price_header' })}</InputLabel>
              <TextField
                type="text"
                id="unitPrice"
                name="unitPrice"
                placeholder="Đơn giá"
                fullWidth
                value={selectedBusinessPlanDetail?.draftPo?.unitPrice ? formatNumber(selectedBusinessPlanDetail.draftPo.unitPrice) : ''}
                InputProps={{
                  readOnly: true,
                  style: { backgroundColor: '#f5f5f5', color: 'text.secondary' },
                  endAdornment: (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {selectedBusinessPlanDetail?.draftPo?.paymentCurrency || 'USD'}
                    </Typography>
                  )
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: '#f5f5f5',
                    '&:hover': {
                      backgroundColor: '#f0f0f0'
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: 'text.secondary',
                    cursor: 'default'
                  }
                }}
              />
              {selectedBusinessPlanDetail && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {intl.formatMessage({ id: 'default_from_draft_po' })}
                </Typography>
              )}
            </Stack>
          </Grid>

          {/* Mô tả hàng hóa - Full width */}
          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>{intl.formatMessage({ id: 'goods_description_header' })}</InputLabel>
              {renderTextField(
                'goodDescription',
                'goods_description_header',
                intl.formatMessage({ id: 'goods_description_placeholder' }),
                false,
                true,
                3
              )}
            </Stack>
          </Grid>

          {/* Phương thức thanh toán */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'payment_terms' })} <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <Autocomplete
                options={paymentTerms}
                getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.code} - ${option.name}`)}
                value={(() => {
                  const code = formik.values.paymentTerm || selectedBusinessPlanDetail?.draftPo?.paymentMethod || '';
                  return paymentTerms.find((term: any) => term.code === code) || null;
                })()}
                onChange={(_, newValue) => {
                  if (isViewModeFinal) return;
                  formik.setFieldValue('paymentTerm', newValue ? (newValue as any).code : '');
                }}
                popupIcon={null}
                readOnly={true}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    id="paymentTerm"
                    name="paymentTerm"
                    placeholder={intl.formatMessage({ id: 'payment_terms' })}
                    error={formik.touched.paymentTerm && Boolean((formik.errors as any).paymentTerm)}
                    helperText={formik.touched.paymentTerm && (formik.errors as any).paymentTerm}
                    sx={{
                      '& .MuiInputBase-root': {
                        backgroundColor: '#f5f5f5',
                        '&:hover': {
                          backgroundColor: '#f0f0f0'
                        }
                      },
                      '& .MuiInputBase-input': {
                        color: 'text.secondary'
                      }
                    }}
                  />
                )}
                componentsProps={{
                  popupIndicator: { title: intl.formatMessage({ id: 'open_dropdown_text' }) },
                  clearIndicator: { title: intl.formatMessage({ id: 'clear_text' }) }
                }}
              />
              {selectedBusinessPlanDetail && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {intl.formatMessage({ id: 'default_from_draft_po' })}
                </Typography>
              )}
            </Stack>
          </Grid>

          {/* Phương thức vận chuyển*/}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'delivery_terms' })} <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <TextField
                type="text"
                id="deliveryTerm"
                name="deliveryTerm"
                placeholder="Phương thức vận chuyển"
                fullWidth
                value={(() => {
                  const code = formik.values.deliveryTerm || selectedBusinessPlanDetail?.draftPo?.deliveryMethod || '';
                  if (!code) return '';
                  const name = mapConfigObject(CODE_DELIVERY_METHOD, code);
                  return name;
                })()}
                error={formik.touched.deliveryTerm && Boolean(formik.errors.deliveryTerm)}
                helperText={formik.touched.deliveryTerm && formik.errors.deliveryTerm}
                InputProps={{ 
                  readOnly: true,
                  style: { backgroundColor: '#f5f5f5', color: 'text.secondary' }
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: '#f5f5f5',
                    '&:hover': {
                      backgroundColor: '#f0f0f0'
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: 'text.secondary',
                    cursor: 'default'
                  }
                }}
              />
              {selectedBusinessPlanDetail && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {intl.formatMessage({ id: 'default_from_draft_po' })}
                </Typography>
              )}
            </Stack>
          </Grid>

          {/* Sai số cho phép */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'tolerance_percentage' })} <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <TextField
                type="number"
                id="tolerancePercentage"
                name="tolerancePercentage"
                placeholder={intl.formatMessage({ id: 'enter_tolerance_percentage' })}
                fullWidth
                inputProps={{ min: 0, max: 100 }}
                value={formik.values.tolerancePercentage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.tolerancePercentage && Boolean(formik.errors.tolerancePercentage)}
                helperText={formik.touched.tolerancePercentage && formik.errors.tolerancePercentage}
                slotProps={{
                  input: {
                    readOnly: isViewModeFinal,
                    style: isViewModeFinal ? { backgroundColor: '#f5f5f5' } : {}
                  }
                }}
              />
            </Stack>
          </Grid>

          {/* Tên Nhiệt điện/End-user */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>{intl.formatMessage({ id: 'thermal_power_end_user_name' })}</InputLabel>
              {renderTextField(
                'endUserThermalPower',
                'thermal_power_end_user_name',
                intl.formatMessage({ id: 'enter_thermal_power_end_user_name' }),
                true
              )}
            </Stack>
          </Grid>

          {/* Khối lượng cho phép/cont */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>
                {intl.formatMessage({ id: 'weight_per_container_valid' })} <strong style={{ color: 'red' }}>*</strong>
              </InputLabel>
              <TextField
                type="text"
                id="weightPerContainer"
                name="weightPerContainer"
                placeholder="Tự động tính từ tổng số lượng và số container"
                fullWidth
                value={formik.values.weightPerContainer ? formatNumber(formik.values.weightPerContainer) : ''}
                InputProps={{
                  readOnly: true, // Always readonly - only render from formik
                  style: { backgroundColor: '#f5f5f5', color: 'text.secondary' },
                  endAdornment: (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {(() => {
                        const unitOfMeasure = selectedBusinessPlanDetail?.draftPo?.unitOfMeasure;
                        if (unitOfMeasure && unitsData.length > 0) {
                          const unitConfig = unitsData.find((unit: any) => unit.code === unitOfMeasure);
                          return unitConfig?.name || unitOfMeasure;
                        }
                        return unitOfMeasure || 'Tấn';
                      })()}
                    </Typography>
                  )
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: '#f5f5f5',
                    '&:hover': {
                      backgroundColor: '#f0f0f0'
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: 'text.secondary',
                    cursor: 'default'
                  }
                }}
              />
              {selectedBusinessPlanDetail && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {intl.formatMessage({ id: 'default_from_draft_po' })}
                </Typography>
              )}
            </Stack>
          </Grid>

          <ListGoodTable
            ref={listGoodTableRef}
            saleContractId={selectedBusinessPlan?.saleContractId}
            isViewMode={isViewModeFinal}
            transportInfo={transportInfo}
            businessPlanDetail={selectedBusinessPlanDetail}
          />

          {/* LC Information Section - Only show when payment method contains L/C */}
          {(() => {
            const paymentTermCode = formik.values.paymentTerm || selectedBusinessPlanDetail?.draftPo?.paymentMethod || '';
            const paymentTermName = paymentTermCode ? mapConfigObject(CODE_PAYMENT_METHOD, paymentTermCode) : '';
            const shouldShowLC = paymentTermName && paymentTermName.includes('LC') || paymentTermCode.includes('LC');
            if (!shouldShowLC) return null;
            
            return (
              <>
                <Grid size={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
                    {intl.formatMessage({ id: 'lc_information' })}
                  </Typography>
                </Grid>

                {/* Số hợp đồng (LC)*/}
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel>{intl.formatMessage({ id: 'contract_number_lc' })}</InputLabel>
                    {renderTextField('lcContractNumber', 'contract_number_lc', intl.formatMessage({ id: 'enter_lc_contract_number' }), true)}
                  </Stack>
                </Grid>

                {/* Số LC */}
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel>{intl.formatMessage({ id: 'lc_number' })}</InputLabel>
                    {renderTextField('lcNumber', 'lc_number', intl.formatMessage({ id: 'enter_lc_number' }), true)}
                  </Stack>
                </Grid>

                {/* Ngày tạo LC */}
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel>{intl.formatMessage({ id: 'lc_creation_date' })}</InputLabel>
                    {renderDateField('lcDate', 'lc_creation_date', intl.formatMessage({ id: 'lc_creation_date' }), true)}
                  </Stack>
                </Grid>

                {/* Thời hạn nhận thanh toán */}
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel>{intl.formatMessage({ id: 'payment_deadline' })}</InputLabel>
                    {renderDateField('paymentDeadline', 'payment_deadline', intl.formatMessage({ id: 'payment_deadline' }), true)}
                  </Stack>
                </Grid>
              </>
            );
          })()}
        </Grid>

        <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 6 }}>
          <Button size="large" variant="outlined" onClick={() => navigate('/contracts/sales/list')}>
            {intl.formatMessage({ id: 'common_button_cancel' })}
          </Button>
          <Stack direction="row" spacing={2}>
            {!isViewModeFinal && (
              <Button 
                size="large" 
                type="submit" 
                variant="contained" 
                loading={loading}
              >
                {intl.formatMessage({ id: id ? 'common_button_update' : 'common_button_save' })}
              </Button>
            )}
          </Stack>
        </Stack>
      </form>
    </MainCard>
  );
}
