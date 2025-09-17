import * as Yup from 'yup';

// ==============================|| SHIPPING UNIT VALIDATION ||============================== //

export const shippingUnitValidationSchema = Yup.object().shape({
  code: Yup.string()
    .required('Mã đơn vị vận chuyển là bắt buộc')
    .min(2, 'Mã đơn vị vận chuyển phải có ít nhất 2 ký tự')
    .max(50, 'Mã đơn vị vận chuyển không được vượt quá 50 ký tự'),

  name: Yup.string()
    .required('Tên đơn vị vận chuyển là bắt buộc')
    .min(2, 'Tên đơn vị vận chuyển phải có ít nhất 2 ký tự')
    .max(100, 'Tên đơn vị vận chuyển không được vượt quá 100 ký tự'),

  // fullName: Yup.string()
  //   .required('Tên đầy đủ là bắt buộc')
  //   .min(2, 'Tên đầy đủ phải có ít nhất 2 ký tự')
  //   .max(200, 'Tên đầy đủ không được vượt quá 200 ký tự'),

  // phone: Yup.string()
  //   .required('Số điện thoại là bắt buộc')
  //   .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
  //   .min(8, 'Số điện thoại phải có ít nhất 8 ký tự')
  //   .max(20, 'Số điện thoại không được vượt quá 20 ký tự'),

  // email: Yup.string().required('Email là bắt buộc').email('Email không hợp lệ').max(255, 'Email không được vượt quá 255 ký tự'),

  address: Yup.string()
    .required('Địa chỉ là bắt buộc')
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự'),
  region: Yup.string()
    .required('Miền là bắt buộc'),
  taxCode: Yup.string()
    .required('Mã số thuế là bắt buộc')
    .matches(/^[0-9-]+$/, 'Mã số thuế chỉ được chứa số và dấu gạch ngang')
    .min(10, 'Mã số thuế phải có ít nhất 10 ký tự')
    .max(15, 'Mã số thuế không được vượt quá 15 ký tự')    
    .matches(
      /^(?!([A-Z0-9])\1+$)(?!0+$)[A-Z0-9][A-Z0-9.-]{7,19}$/,
      'Mã số thuế không hợp lệ'
    ),
  bankAccount: Yup.string()
    .required('Số tài khoản ngân hàng là bắt buộc')
    .matches(/^[0-9]{8,20}$/, 'Số tài khoản ngân hàng phải có từ 8 đến 20 chữ số'),
  bankName: Yup.string()
    .required('Tên ngân hàng là bắt buộc')
    .min(3, 'Tên ngân hàng phải có ít nhất 3 ký tự')
    .max(100, 'Tên ngân hàng không được vượt quá 100 ký tự'),
  companyName: Yup.string()
    .required('Tên công ty là bắt buộc')
    .min(3, 'Tên công ty phải có ít nhất 3 ký tự')
    .max(200, 'Tên công ty không được vượt quá 200 ký tự'),

  // contactPerson: Yup.string()
  //   .required('Người liên hệ là bắt buộc')
  //   .min(2, 'Tên người liên hệ phải có ít nhất 2 ký tự')
  //   .max(100, 'Tên người liên hệ không được vượt quá 100 ký tự'),

  // contactPhone: Yup.string()
  //   .required('Số điện thoại liên hệ là bắt buộc')
  //   .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại liên hệ không hợp lệ')
  //   .min(8, 'Số điện thoại liên hệ phải có ít nhất 8 ký tự')
  //   .max(20, 'Số điện thoại liên hệ không được vượt quá 20 ký tự'),

  // contactEmail: Yup.string()
  //   .required('Email liên hệ là bắt buộc')
  //   .email('Email liên hệ không hợp lệ')
  //   .max(255, 'Email liên hệ không được vượt quá 255 ký tự'),

  // website: Yup.string().url('Website không hợp lệ').max(255, 'Website không được vượt quá 255 ký tự'),

  // serviceType: Yup.string().required('Loại dịch vụ là bắt buộc').oneOf(['DOMESTIC', 'INTERNATIONAL', 'BOTH'], 'Loại dịch vụ không hợp lệ'),

  // trackingUrl: Yup.string().url('URL theo dõi không hợp lệ').max(255, 'URL theo dõi không được vượt quá 255 ký tự'),

  // pricePerKg: Yup.number()
  //   .required('Giá theo kilogram là bắt buộc')
  //   .min(0, 'Giá theo kilogram phải lớn hơn hoặc bằng 0')
  //   .max(999999, 'Giá theo kilogram không được vượt quá 999,999'),

  // pricePerKm: Yup.number()
  //   .required('Giá theo kilometer là bắt buộc')
  //   .min(0, 'Giá theo kilometer phải lớn hơn hoặc bằng 0')
  //   .max(999999, 'Giá theo kilometer không được vượt quá 999,999'),

  // basePrice: Yup.number()
  //   .required('Giá cơ bản là bắt buộc')
  //   .min(0, 'Giá cơ bản phải lớn hơn hoặc bằng 0')
  //   .max(999999, 'Giá cơ bản không được vượt quá 999,999'),

  // deliveryTimeDomestic: Yup.number()
  //   .required('Thời gian giao hàng trong nước là bắt buộc')
  //   .min(0, 'Thời gian giao hàng trong nước phải lớn hơn hoặc bằng 0')
  //   .max(365, 'Thời gian giao hàng trong nước không được vượt quá 365 ngày'),

  // deliveryTimeInternational: Yup.number()
  //   .required('Thời gian giao hàng quốc tế là bắt buộc')
  //   .min(0, 'Thời gian giao hàng quốc tế phải lớn hơn hoặc bằng 0')
  //   .max(365, 'Thời gian giao hàng quốc tế không được vượt quá 365 ngày'),

  // rating: Yup.number().required('Đánh giá là bắt buộc').min(1, 'Đánh giá phải từ 1 đến 5 sao').max(5, 'Đánh giá phải từ 1 đến 5 sao'),

  // isPreferred: Yup.number().required('Trạng thái ưu tiên là bắt buộc').oneOf([0, 1], 'Trạng thái ưu tiên không hợp lệ'),

  status: Yup.number().required('Trạng thái là bắt buộc').oneOf([0, 1], 'Trạng thái không hợp lệ')
});
