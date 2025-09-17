import { useState } from 'react';
import { useGlobal } from 'contexts/GlobalContext';
import axiosServices from 'utils/axios';
import { SelectedSaleContract } from '../types';
import { FormikProps } from 'formik';

export const useSaleContractHandler = (formik: FormikProps<any>) => {
  const { getGoodNameById } = useGlobal();
  const [selectedSaleContract, setSelectedSaleContract] = useState<SelectedSaleContract | null>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  const handleSaleContractChange = async (value: any) => {
    formik.setFieldValue('saleContractId', value?.value);
    
    if (value?.value) {
      setIsLoadingCustomer(true);
      try {
        const response = await axiosServices.get(`/api/salecontract/${value.value}`);
        const contractData = response.data.data;
        const mappedGoodName = getGoodNameById(contractData?.goodId || (contractData?.good && contractData.good.id));
        setSelectedSaleContract({ ...contractData, goodName: mappedGoodName });
        
        // Get goodType from saleContractGoods if available, otherwise use goodName as fallback
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
        
        // Fetch customer information to get customer code
        if (contractData.customerId) {
          try {
            const customerResponse = await axiosServices.get(`/api/customer/${contractData.customerId}`);
            const customerData = customerResponse.data.data;
            
            setSelectedSaleContract((prev: SelectedSaleContract | null) => ({
              ...prev,
              customerCode: customerData.code || 'ABC'
            }));
            
            // Update codeBooking if booking number already exists
            if (formik.values.bookingNumber) {
              const newCodeBooking = formik.values.bookingNumber ? `${customerData.code || 'ABC'}-${formik.values.bookingNumber}` : '';
              formik.setFieldValue('codeBooking', newCodeBooking);
            }
          } catch (customerError) {
            setSelectedSaleContract((prev: SelectedSaleContract | null) => ({
              ...prev,
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
      // Clear export port, region, and import port when sale contract is cleared
      formik.setFieldValue('exportPort', '');
      formik.setFieldValue('region', '');
      formik.setFieldValue('importPort', '');
    }
  };

  const handleBookingNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
    // Update codeBooking with the new booking number using customer code
    const customerCode = selectedSaleContract?.customerCode || 'ABC';
    const newCodeBooking = e.target.value ? `${customerCode}-${e.target.value}` : '';
    formik.setFieldValue('codeBooking', newCodeBooking);
  };

  return {
    selectedSaleContract,
    setSelectedSaleContract,
    isLoadingCustomer,
    handleSaleContractChange,
    handleBookingNumberChange
  };
};