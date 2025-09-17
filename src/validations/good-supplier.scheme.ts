import * as yup from 'yup';
const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

export const createGoodSupplierSchema = yup.object({
  goodId: yup.number().required('Sản phẩm là bắt buộc').typeError('Good ID must be a number'),

  supplierId: yup.number().required('Nhà phân phối là bắt buộc').typeError('Supplier ID must be a number'),

  unitPrice: yup.number().required('Giá tiền là bắt buộc').min(0, 'Giá tiền không được âm').typeError('Unit price must be a number'),

  goodType: yup.string().nullable(),

  // startDate: yup.string().nullable().matches(dateRegex, 'Start date must be in DD-MM-YYYY format'),

  // endDate: yup.string().nullable().matches(dateRegex, 'End date must be in DD-MM-YYYY format')
  // startDate: yup
  //   .string()
  //   .nullable()
  //   .matches(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  // endDate: yup
  //   .string()
  //   .nullable()
  //   .matches(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
  startDate: yup
    .string()
    .required('Thời gian bắt đầu là bắt buộc')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .test('not-before-today', 'Start date cannot be earlier than today', function (value) {
      if (!value) return true; // allow null
      return value >= today;
    }),
  endDate: yup
    .string()
    .required('Thời gian kết là bắt buộc')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .test('not-before-today', 'End date cannot be earlier than today', function (value) {
      if (!value) return true; // allow null
      return value >= today;
    })
});
