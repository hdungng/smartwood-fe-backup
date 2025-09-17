import * as Yup from 'yup';

export const deliveryTermValidationSchema = Yup.object().shape({
  code: Yup.string()
    .trim()
    .min(2, 'Mã Phương thức vận chuyểnphải có ít nhất 2 ký tự')
    .max(10, 'Mã Phương thức vận chuyểnkhông được quá 10 ký tự')
    .matches(/^[A-Z0-9]+$/, 'Mã Phương thức vận chuyểnchỉ được chứa chữ hoa và số')
    .required('Mã Phương thức vận chuyển là bắt buộc'),

  name: Yup.string()
    .trim()
    .min(2, 'Tên Phương thức vận chuyểnphải có ít nhất 2 ký tự')
    .max(100, 'Tên Phương thức vận chuyểnkhông được quá 100 ký tự')
    .required('Tên Phương thức vận chuyển là bắt buộc'),

  description: Yup.string().trim().max(500, 'Mô tả không được quá 500 ký tự').required('Mô tả là bắt buộc'),

  // deliveryDays: Yup.number()
  //   .typeError('Số ngày giao hàng phải là số')
  //   .integer('Số ngày giao hàng phải là số nguyên')
  //   .min(1, 'Số ngày giao hàng phải lớn hơn 0')
  //   .max(365, 'Số ngày giao hàng không được quá 365 ngày')
  //   .required('Số ngày giao hàng là bắt buộc'),

  // incoterm: Yup.string()
  //   .trim()
  //   .min(2, 'Incoterm phải có ít nhất 2 ký tự')
  //   .max(10, 'Incoterm không được quá 10 ký tự')
  //   .matches(/^[A-Z]+$/, 'Incoterm chỉ được chứa chữ hoa')
  //   .required('Incoterm là bắt buộc'),

  // responsibility: Yup.string()
  //   .trim()
  //   .oneOf(['SELLER', 'BUYER'], 'Trách nhiệm phải là SELLER hoặc BUYER')
  //   .required('Trách nhiệm là bắt buộc'),

  // insuranceRequired: Yup.number()
  //   .typeError('Yêu cầu bảo hiểm phải là số')
  //   .oneOf([0, 1], 'Yêu cầu bảo hiểm phải là 0 (Không) hoặc 1 (Có)')
  //   .required('Yêu cầu bảo hiểm là bắt buộc'),

  // packagingRequired: Yup.number()
  //   .typeError('Yêu cầu đóng gói phải là số')
  //   .oneOf([0, 1], 'Yêu cầu đóng gói phải là 0 (Không) hoặc 1 (Có)')
  //   .required('Yêu cầu đóng gói là bắt buộc'),

  // deliveryLocation: Yup.string()
  //   .trim()
  //   .oneOf(['PORT', 'SELLER_LOCATION', 'BUYER_LOCATION'], 'Địa điểm giao hàng không hợp lệ')
  //   .required('Địa điểm giao hàng là bắt buộc'),

  // specialInstructions: Yup.string().trim().max(1000, 'Hướng dẫn đặc biệt không được quá 1000 ký tự').nullable(),

  status: Yup.number()
    .typeError('Trạng thái phải là số')
    .oneOf([0, 1], 'Trạng thái phải là 0 (Không hoạt động) hoặc 1 (Hoạt động)')
    .required('Trạng thái là bắt buộc')
});
