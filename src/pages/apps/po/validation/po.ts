import { IntlShape } from 'react-intl';
import * as yup from 'yup';

export type POFormValues = {
  customerName: string;
  deliveryLocation: string;
  importCountry: string;
  goodId: number | null;
  deliveryMethod: string;
  paymentMethod: string;
  currency: string;
  unitPrice: number | null;
  unit: string;
  quantity: number | null;
  goodType: string;
  expectedDelivery: Date | null;
  status?: string | null;
};

export const getPOFormValidationSchema = (intl: IntlShape) => {
  const schema = yup.object({
    customerName: yup
      .string()
      .required(intl.formatMessage({ id: 'customer_name_required', defaultMessage: 'Customer name is required' })),

    deliveryLocation: yup
      .string()
      .required(intl.formatMessage({ id: 'delivery_location_required', defaultMessage: 'Delivery location is required' })),

    importCountry: yup
      .string()
      .required(intl.formatMessage({ id: 'import_country_required', defaultMessage: 'Import country is required' })),

    goodId: yup
      .number()
      .typeError(intl.formatMessage({ id: 'goods_name_required', defaultMessage: 'Goods is required' }))
      .required(intl.formatMessage({ id: 'goods_name_required', defaultMessage: 'Goods is required' })),

    deliveryMethod: yup
      .string()
      .required(intl.formatMessage({ id: 'payment_deivery_required', defaultMessage: 'Delivery method is required' })),

    paymentMethod: yup
      .string()
      .required(intl.formatMessage({ id: 'payment_medthod_required', defaultMessage: 'Payment method is required' })),

    currency: yup
      .string()
      .required(intl.formatMessage({ id: 'curreny_required', defaultMessage: 'Currency is required' })),

    unitPrice: yup
      .number()
      .typeError(intl.formatMessage({ id: 'unitPrice_rquired', defaultMessage: 'Unit price is required' }))
      .required(intl.formatMessage({ id: 'unitPrice_rquired', defaultMessage: 'Unit price is required' })),

    unit: yup
      .string()
      .required(intl.formatMessage({ id: 'unit_required', defaultMessage: 'Unit is required' })),

    quantity: yup
      .number()
      .typeError(intl.formatMessage({ id: 'quantity_required', defaultMessage: 'Quantity is required' }))
      .required(intl.formatMessage({ id: 'quantity_required', defaultMessage: 'Quantity is required' })),

    goodType: yup
      .string()
      .required(intl.formatMessage({ id: 'good_type_required', defaultMessage: 'Goods type is required' })),

    expectedDelivery: yup
      .date()
      .nullable()
      .required(intl.formatMessage({ id: 'expected_delivery_required', defaultMessage: 'Estimated delivery is required' })),

    status: yup.string().nullable().optional()
  });

  return schema;
};


