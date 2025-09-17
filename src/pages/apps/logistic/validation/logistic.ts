import { IntlShape } from 'react-intl';
import * as yup from 'yup';

export const getLogisticFormValidationSchema = (intl: IntlShape) => {
  const schema = yup.object({
    bookingNumber: yup
      .string()
      .required(intl.formatMessage({ id: 'validate_required_booking_number', defaultMessage: 'Booking number is required' })),

    codeBooking: yup
      .string()
      .required(intl.formatMessage({ id: 'validate_required_code_booking', defaultMessage: 'Booking code is required' })),

    goodType: yup
      .string()
      .required(intl.formatMessage({ id: 'validate_required_goods_type', defaultMessage: 'Goods type is required' })),

    containerQuantity: yup
      .number()
      .typeError(intl.formatMessage({ id: 'validate_number_cont', defaultMessage: 'Container quantity must be a number' }))
      .required(intl.formatMessage({ id: 'validate_required_cont', defaultMessage: 'Container quantity is required' })),

    availableContainerQuantity: yup
      .number()
      .typeError(intl.formatMessage({ id: 'validate_number_available_cont', defaultMessage: 'Available container quantity must be a number' }))
      .nullable(),

    etaDate: yup
      .date()
      .nullable()
      .required(intl.formatMessage({ id: 'validate_required_eta_date', defaultMessage: 'Ngày tàu đến (ETA) là bắt buộc' })),

    etdDate: yup
      .date()
      .nullable()
      .required(intl.formatMessage({ id: 'validate_required_etd_date', defaultMessage: 'Ngày tàu chạy (ETD) là bắt buộc' })),

    shipName: yup.string().required(intl.formatMessage({ id: 'validate_required_ship_name', defaultMessage: 'Ship name is required' })),
    forwarderName: yup
      .string()
      .required(intl.formatMessage({ id: 'validate_required_forwarder', defaultMessage: 'Forwarder is required' })),

    shippingLine: yup
      .string()
      .required(intl.formatMessage({ id: 'validate_required_shipping_line', defaultMessage: 'Shipping line is required' })),

    firstContainerDropDate: yup
      .date()
      .nullable()
      .required(intl.formatMessage({ id: 'validate_required_first_drop_date', defaultMessage: 'Ngày hạ container đầu tiên là bắt buộc' })),

    cutoffDate: yup
      .date()
      .nullable()
      .required(intl.formatMessage({ id: 'validate_required_cutoff_date', defaultMessage: 'Ngày cắt máng là bắt buộc' })),

    region: yup.string().required(intl.formatMessage({ id: 'validate_required_region', defaultMessage: 'Region is required' })),

    exportPort: yup
      .mixed()
      .required(intl.formatMessage({ id: 'validate_required_export_port', defaultMessage: 'Cảng xuất là bắt buộc' })),

    importPort: yup
      .mixed()
      .required(intl.formatMessage({ id: 'validate_required_import_port', defaultMessage: 'Cảng nhập là bắt buộc' })),

    goodId: yup
      .number()
      .nullable()
      .optional(),

    saleContractId: yup
      .number()
      .nullable()
      .optional(),

    notes: yup.string().nullable()
  });
  
  return schema;
};
