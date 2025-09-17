import * as Yup from 'yup';

// ==============================|| PAYMENT TERM VALIDATION SCHEMA ||============================== //

export const paymentTermValidationSchema = Yup.object().shape({
  code: Yup.string()
    .required('Mã điều kiện thanh toán là bắt buộc')
    .min(2, 'Mã điều kiện thanh toán phải có ít nhất 2 ký tự')
    .max(20, 'Mã điều kiện thanh toán không được quá 20 ký tự')
    .matches(/^[A-Z0-9_/-]+$/, 'Mã điều kiện thanh toán chỉ được chứa chữ hoa, số, gạch dưới và gạch ngang'),

  name: Yup.string()
    .required('Tên điều kiện thanh toán là bắt buộc')
    .min(2, 'Tên điều kiện thanh toán phải có ít nhất 2 ký tự')
    .max(100, 'Tên điều kiện thanh toán không được quá 100 ký tự'),

  description: Yup.string()
    .required('Mô tả điều kiện thanh toán là bắt buộc')
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(500, 'Mô tả không được quá 500 ký tự'),

  paymentDays: Yup.number()
    .required('Số ngày thanh toán là bắt buộc')
    .min(0, 'Số ngày thanh toán phải lớn hơn hoặc bằng 0')
    .max(365, 'Số ngày thanh toán không được quá 365 ngày')
    .integer('Số ngày thanh toán phải là số nguyên'),

  discountPercentage: Yup.number()
    .required('Phần trăm chiết khấu là bắt buộc')
    .min(0, 'Phần trăm chiết khấu phải lớn hơn hoặc bằng 0')
    .max(100, 'Phần trăm chiết khấu không được quá 100%'),

  discountDays: Yup.number()
    .required('Số ngày chiết khấu là bắt buộc')
    .min(0, 'Số ngày chiết khấu phải lớn hơn hoặc bằng 0')
    .max(365, 'Số ngày chiết khấu không được quá 365 ngày')
    .integer('Số ngày chiết khấu phải là số nguyên'),

  lateFeePercentage: Yup.number()
    .required('Phần trăm phí trễ hạn là bắt buộc')
    .min(0, 'Phần trăm phí trễ hạn phải lớn hơn hoặc bằng 0')
    .max(100, 'Phần trăm phí trễ hạn không được quá 100%'),

  lateFeeDays: Yup.number()
    .required('Số ngày phí trễ hạn là bắt buộc')
    .min(0, 'Số ngày phí trễ hạn phải lớn hơn hoặc bằng 0')
    .max(365, 'Số ngày phí trễ hạn không được quá 365 ngày')
    .integer('Số ngày phí trễ hạn phải là số nguyên'),

  paymentMethod: Yup.string()
    .required('Phương thức thanh toán là bắt buộc')
    .oneOf(['CASH', 'CREDIT', 'BANK_TRANSFER', 'CHECK'], 'Phương thức thanh toán không hợp lệ'),

  status: Yup.number().required('Trạng thái là bắt buộc').oneOf([0, 1], 'Trạng thái không hợp lệ')
});
