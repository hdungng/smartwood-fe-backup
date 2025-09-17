import * as Yup from 'yup';
import { IntlShape } from 'react-intl';

export const getContractSellValidationSchema = (intl: IntlShape) =>
  Yup.object({
    code: Yup.string().nullable(),
    
    saleContractCode: Yup.string()
      .required(intl.formatMessage({ id: 'validate.sale_contract_code_required' }))
      .min(1, intl.formatMessage({ id: 'validate.sale_contract_code_min_length' }))
      .max(50, intl.formatMessage({ id: 'validate.sale_contract_code_max_length' })),
    
    sellerId: Yup.number()
      .required(intl.formatMessage({ id: 'validate.seller_name_required' }))
      .min(1, intl.formatMessage({ id: 'validate.seller_name_required' }))
      .typeError(intl.formatMessage({ id: 'validate.seller_name_required' })),
    
    codeBooking: Yup.number()
      .nullable()
      .typeError(intl.formatMessage({ id: 'validate.booking_number_invalid' })),
    
    contractDate: Yup.date()
      .nullable()
      .required(intl.formatMessage({ id: 'validate.contract_date_required' }))
      .typeError(intl.formatMessage({ id: 'validate.contract_date_invalid' })),
    
    buyerName: Yup.string().nullable(),
    notes: Yup.string().nullable(),
    
    totalWeight: Yup.number()
      .required(intl.formatMessage({ id: 'validate.total_weight_required' }))
      .min(0, intl.formatMessage({ id: 'validate.total_weight_min' }))
      .typeError(intl.formatMessage({ id: 'validate.total_weight_invalid' })),
    
    goodDescription: Yup.string()
      .nullable()
      .max(1000, intl.formatMessage({ id: 'validate.good_description_max_length' })),
    
    paymentTerm: Yup.string()
      .required(intl.formatMessage({ id: 'validate.payment_terms_required' })),
    
    deliveryTerm: Yup.string()
      .required(intl.formatMessage({ id: 'validate.delivery_terms_required' })),
    
    goodId: Yup.number()
      .required(intl.formatMessage({ id: 'validate.good_id_required' })),
    
    tolerancePercentage: Yup.number()
      .required(intl.formatMessage({ id: 'validate.tolerance_required' }))
      .min(0, intl.formatMessage({ id: 'validate.tolerance_min' }))
      .max(100, intl.formatMessage({ id: 'validate.tolerance_max' }))
      .typeError(intl.formatMessage({ id: 'validate.tolerance_invalid' })),
    
    endUserThermalPower: Yup.string().nullable(),
    
    weightPerContainer: Yup.number()
      .required(intl.formatMessage({ id: 'validate.weight_per_container_required' }))
      .min(0, intl.formatMessage({ id: 'validate.weight_min' }))
      .typeError(intl.formatMessage({ id: 'validate.weight_invalid' })),
    
    // LC Information fields
    lcContractNumber: Yup.string().nullable(),
    lcNumber: Yup.string().nullable(),
    lcDate: Yup.date().nullable(),
    paymentDeadline: Yup.date().nullable(),
    issuingBankId: Yup.number().nullable(),
    advisingBankId: Yup.number().nullable(),
    currency: Yup.string().nullable(),
    lcStatus: Yup.string().nullable(),
    
    // Buyer information fields
    buyerTaxCode: Yup.string().nullable(),
    buyerRepresentative: Yup.string().nullable(),
    buyerPhone: Yup.string().nullable(),
    buyerAddress: Yup.string().nullable(),
    
    contractId: Yup.number().nullable()
  });
