import { createPurchaseContractShipping as createPurchaseContractShippingAPI } from 'api/logistic';
import { CODE_DESTINATION, CODE_EXPORT_PORT } from 'constants/code';
import { useGlobal } from 'contexts/GlobalContext';
import { useFormik } from 'formik';
import moment from 'moment';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import axiosServices from 'utils/axios';
import { LogisticFormValues, SelectedSaleContract } from '../types';
import { createPayload, findCodeByDisplayName, getRegionFromExportPortCode, parsePortString } from '../utils';
import { getLogisticFormValidationSchema } from '../validation/logistic';

interface UseLogisticFormProps {
  editingId?: string | null;
  onEditComplete?: () => void;
  selectedSaleContract: SelectedSaleContract | null;
  setSelectedSaleContract: (value: SelectedSaleContract | null) => void;
  editingInitialContainerQuantity: number;
  setEditingInitialContainerQuantity: (value: number) => void;
  goods: any[];
  forwarders: any[];
  shippingLines: any[];
  saleContracts: any[];
  configList: any[];
  callGetListShippingListFunc: () => void;
}

export const useLogisticForm = ({
  editingId,
  onEditComplete,
  selectedSaleContract,
  setSelectedSaleContract,
  editingInitialContainerQuantity,
  setEditingInitialContainerQuantity,
  goods,
  forwarders,
  shippingLines,
  saleContracts,
  configList,
  callGetListShippingListFunc
}: UseLogisticFormProps) => {
  const intl = useIntl();
  const { getGoodNameById } = useGlobal();
  
  const [loading, setLoading] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(editingId || null);
  const hasFetchedEditRef = useRef<string | null>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  // Memoize validation schema to prevent infinite re-creation
  const validationSchema = useMemo(() => {
    return getLogisticFormValidationSchema(intl);
  }, [intl]);

  const formik = useFormik<LogisticFormValues>({
    initialValues: {
      containerQuantity: undefined,
      availableContainerQuantity: 0,
      etaDate: null,
      etdDate: null,
      shipName: '',
      forwarderName: '',
      shippingLine: '',
      firstContainerDropDate: null,
      cutoffDate: null,
      region: '',
      exportPort: '',
      importPort: '',
      goodId: undefined,
      goodType: '',
      codeBooking: '',
      bookingNumber: '',
      notes: '',
      saleContractId: undefined,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (formik.isValid) {
        currentEditingId ? updatePurchaseContractShipping(values) : createPurchaseContractShipping(values);
      } else {
        enqueueSnackbar('Please fix all validation errors before submitting', {
          variant: 'error',
          autoHideDuration: 5000,
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
      }
    },
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: false
  });

  // Update currentEditingId when editingId prop changes
  useEffect(() => {
    setCurrentEditingId(editingId || null);
  }, [editingId]);

  // Fetch edit data when editingId is provided
  useEffect(() => {
    if (currentEditingId && currentEditingId !== hasFetchedEditRef.current) {
      hasFetchedEditRef.current = currentEditingId;
      fetchEditData();
    }
  }, [currentEditingId]);

  const fetchEditData = async () => {
    if (!currentEditingId) return;
    
    try {
      setLoading(true);
      const response = await axiosServices.get(`/api/purchasecontractshippingschedule/${currentEditingId}`);
      const data = response.data.data;
      
      const selectedSaleContract = saleContracts.find(item => item.value === data.saleContractId);
      const selectedGood = goods.find(item => 
        item.name === data.goodsType || 
        item.name === data.goodType || 
        item.id === data.goodId || 
        item.id === data.goodsType
      );
      
      setEditingInitialContainerQuantity(Number(data.containerQuantity) || 0);

      if (data.saleContractId) {
        setSelectedSaleContract({ 
          id: data.saleContractId, 
          goodId: selectedGood?.id || data.goodId, 
          goodName: getGoodNameById(selectedGood?.id || data.goodId), 
          goodType: data.goodType,
          customerCode: 'ABC'
        });
      }
      
      const selectedForwarder = forwarders.find(item => 
        item.label === data.forwarderName || 
        item.metadata?.nameVn === data.forwarderName || 
        item.metadata?.nameEn === data.forwarderName
      );
      
      const selectedShippingLine = shippingLines.find(item => {
        return item.metadata?.code === data.shippingLine;
      });

      const exportPortObj = parsePortString(data.exportPort);
      const importPortObj = parsePortString(data.importPort);

      const formValues = {
        containerQuantity: data.containerQuantity,
        availableContainerQuantity: data.availableContainerQuantity || 0,
        etaDate: moment(data.etaDate).toDate(),
        etdDate: moment(data.etdDate).toDate(),
        shipName: data.shipName || '',
        forwarderName: selectedForwarder?.value || '',
        shippingLine: selectedShippingLine?.value || '',
        firstContainerDropDate: moment(data.firstContainerDropDate).toDate(),
        cutoffDate: moment(data.cutoffDate).toDate(),
        region: String(data.region || ''),
        exportPort: exportPortObj?.code || findCodeByDisplayName(configList, CODE_EXPORT_PORT as any, data.exportPort) || '',
        importPort: importPortObj?.code || (data.importPort ? findCodeByDisplayName(configList, CODE_DESTINATION as any, data.importPort) : ''),
        goodType: data.goodType || data.goodsType || data.goodName || '',
        goodId: selectedGood?.id || data.goodId,
        codeBooking: data.codeBooking || '',
        bookingNumber: data.bookingNumber || '',
        notes: data.notes || '',
        saleContractId: selectedSaleContract?.value || data.saleContractId || data.purchaseContractId || data.contractId || undefined,
      };

      formik.setValues(formValues);
      formik.setTouched({}, false);
      formik.setErrors({});

      // Fetch sale contract detail for additional data
      if (data.saleContractId) {
        try {
          const scRes = await axiosServices.get(`/api/salecontract/${data.saleContractId}`);
          const scData = scRes.data.data;
          const mappedGoodName = getGoodNameById(scData?.goodId || (scData?.good && scData.good.id));
          
          let customerCode = 'ABC';
          if (scData.customerId) {
            try {
              const customerResponse = await axiosServices.get(`/api/customer/${scData.customerId}`);
              const customerData = customerResponse.data.data;
              customerCode = customerData.code || 'ABC';
            } catch (customerError) {
              customerCode = 'ABC';
            }
          }
          
          setSelectedSaleContract({ ...scData, goodName: mappedGoodName, customerCode });

          // Auto-fill missing values based on export port
          const exportPortCode = String(formValues.exportPort || '');
          if (exportPortCode) {
            const regionCode = getRegionFromExportPortCode(exportPortCode, configList);
            if (regionCode && !formValues.region) {
              formik.setFieldValue('region', regionCode);
            }
            if (!formValues.importPort && Array.isArray(scData?.transportInfo)) {
              const matched = scData.transportInfo.find((t: any) => t.exportPort === exportPortCode);
              if (matched?.importPort) {
                formik.setFieldValue('importPort', matched.importPort);
              }
            }
          }
        } catch (e) {
          // ignore
        }
      }
    } catch (error: any) {
      console.error('Fetch edit data failed:', error);
      enqueueSnackbar(error?.meta?.message || intl.formatMessage({ id: 'get_detail_unsuccessfully' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePurchaseContractShipping = async (values: LogisticFormValues) => {
    if (!currentEditingId) return;

    const payload = createPayload(values, selectedSaleContract, goods, forwarders, shippingLines, configList);

    try {
      setLoading(true);
      await axiosServices.put(`/api/purchasecontractshippingschedule/${currentEditingId}`, payload);
      
      enqueueSnackbar(intl.formatMessage({ id: 'common_update_success_text' }), {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      
      // Reset form after successful submission
      hasFetchedEditRef.current = null;
      formik.resetForm();
      setCurrentEditingId(null);
      setSelectedSaleContract(null);
      setEditingInitialContainerQuantity(0);
      callGetListShippingListFunc();
      
      if (onEditComplete) {
        onEditComplete();
      }
    } catch (error: any) {
      console.error('Update shipping schedule failed:', error);
      enqueueSnackbar(error?.meta?.message || intl.formatMessage({ id: 'common_error_text' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    } finally {
      setLoading(false);
    }
  };

  const createPurchaseContractShipping = async (values: LogisticFormValues) => {
    const payload = createPayload(values, selectedSaleContract, goods, forwarders, shippingLines, configList);

    try {
      setLoading(true);
      await createPurchaseContractShippingAPI(payload);
      
      enqueueSnackbar(intl.formatMessage({ id: 'common_success_text' }), {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
      
      formik.resetForm();
      setSelectedSaleContract(null);
      callGetListShippingListFunc();
    } catch (error: any) {
      console.error('Create shipping schedule failed:', error);
      enqueueSnackbar(error?.meta?.message || intl.formatMessage({ id: 'common_error_text' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (id: string, saleContractId: string) => {
    setCurrentEditingId(id);
    formik.setFieldValue('saleContractId', Number(saleContractId));
    formik.setTouched({}, false);
    formik.setErrors({});
    
    void (async () => {
      try {
        const response = await axiosServices.get(`/api/salecontract/${saleContractId}`);
        const contractData = response.data.data;
        const mappedGoodName = getGoodNameById(contractData?.goodId || (contractData?.good && contractData.good.id));
        
        let customerCode = 'ABC';
        if (contractData.customerId) {
          try {
            const customerResponse = await axiosServices.get(`/api/customer/${contractData.customerId}`);
            const customerData = customerResponse.data.data;
            customerCode = customerData.code || 'ABC';
          } catch (customerError) {
            customerCode = 'ABC';
          }
        }
        
        setSelectedSaleContract({ ...contractData, goodName: mappedGoodName, customerCode });

        let goodTypeValue = '';
        if (contractData.saleContractGoods && contractData.saleContractGoods.length > 0) {
          goodTypeValue = contractData.saleContractGoods[0].goodType || '';
        } else if (contractData.goodType) {
          goodTypeValue = contractData.goodType;
        } else {
          goodTypeValue = mappedGoodName || '';
        }
        
        formik.setFieldValue('goodType', goodTypeValue);
        formik.setFieldValue('goodId', contractData?.goodId || (contractData?.good && contractData.good.id) || 0);
      } catch (error) {
        setSelectedSaleContract(null);
        formik.setFieldValue('goodType', '');
        formik.setFieldValue('goodId', undefined);
      }
    })();
  };

  const handleCancel = () => {
    hasFetchedEditRef.current = null;
    setCurrentEditingId(null);
    setSelectedSaleContract(null);
    setEditingInitialContainerQuantity(0);
    formik.resetForm();
    formik.setTouched({}, false);
    formik.setErrors({});
  };

  const handleSaleContractChange = async (value: any) => {
    formik.setFieldValue('saleContractId', value?.value);
    if (value?.value) {
      setIsLoadingCustomer(true);
      try {
        const response = await axiosServices.get(`/api/salecontract/${value.value}`);
        const contractData = response.data.data;
        const mappedGoodName = getGoodNameById(contractData?.goodId || (contractData?.good && contractData.good.id));

        // Update selected sale contract in parent state
        setSelectedSaleContract({ ...contractData, goodName: mappedGoodName });

        // Determine goodType
        let goodTypeValue = '';
        if (contractData.saleContractGoods && contractData.saleContractGoods.length > 0) {
          goodTypeValue = contractData.saleContractGoods[0].goodType || '';
        } else if (contractData.goodType) {
          goodTypeValue = contractData.goodType;
        } else {
          goodTypeValue = mappedGoodName || '';
        }
        formik.setFieldValue('goodType', goodTypeValue);
        formik.setFieldValue('goodId', contractData?.goodId || (contractData?.good && contractData.good.id) || 0);

        // Fetch customer to get code and update parent selectedSaleContract
        if (contractData.customerId) {
          try {
            const customerResponse = await axiosServices.get(`/api/customer/${contractData.customerId}`);
            const customerData = customerResponse.data.data;
            setSelectedSaleContract((prev: SelectedSaleContract | null) => ({
              ...(prev as any),
              customerCode: customerData.code || 'ABC'
            }));

            if (formik.values.bookingNumber) {
              const newCodeBooking = formik.values.bookingNumber ? `${customerData.code || 'ABC'}-${formik.values.bookingNumber}` : '';
              formik.setFieldValue('codeBooking', newCodeBooking);
            }
          } catch (customerError) {
            setSelectedSaleContract((prev: SelectedSaleContract | null) => ({
              ...(prev as any),
              customerCode: 'ABC'
            }));
          }
        }
      } catch (error) {
        setSelectedSaleContract(null);
        formik.setFieldValue('goodType', '');
        formik.setFieldValue('goodId', undefined);
      } finally {
        setIsLoadingCustomer(false);
      }
    } else {
      setSelectedSaleContract(null);
      formik.setFieldValue('goodType', '');
      formik.setFieldValue('goodId', undefined);
      formik.setFieldValue('exportPort', '');
      formik.setFieldValue('region', '');
      formik.setFieldValue('importPort', '');
    }
  };

  const handleBookingNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
    const customerCode = (selectedSaleContract as any)?.customerCode || 'ABC';
    const newCodeBooking = e.target.value ? `${customerCode}-${e.target.value}` : '';
    formik.setFieldValue('codeBooking', newCodeBooking);
  };

  return {
    formik,
    loading,
    currentEditingId,
    handleEditItem,
    handleCancel,
    isLoadingCustomer,
    handleSaleContractChange,
    handleBookingNumberChange
  };
};