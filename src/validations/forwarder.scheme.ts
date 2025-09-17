import * as Yup from 'yup';

export const forwarderSchema = Yup.object().shape({
  code: Yup.string().required('Mã là bắt buộc').min(1, 'Mã phải có ít nhất 1 ký tự').max(50, 'Mã không được vượt quá 50 ký tự'),

  bankAccount:  Yup.string().required('Số tài khoản là bắt buộc'),
  fwBankName:  Yup.string().required('Ngân hàng là bắt buộc'),
  description:  Yup.string().required('Mô tả là bắt buộc'),
  region:  Yup.string().required('Miền là bắt buộc'),
  transportName:  Yup.string().required('Tên vận tải là bắt buộc'),
      
  forwarderNameVn: Yup.string()
    .required('Tên tiếng Việt là bắt buộc')
    .min(2, 'Tên tiếng Việt phải có ít nhất 2 ký tự')
    .max(500, 'Tên tiếng Việt không được vượt quá 500 ký tự'),

  forwarderNameEn: Yup.string()
    .required('Tên tiếng Anh là bắt buộc')
    .min(2, 'Tên tiếng Anh phải có ít nhất 2 ký tự')
    .max(500, 'Tên tiếng Anh không được vượt quá 500 ký tự'),

  taxCode: Yup.string()
    .optional()
    .matches(/^[0-9-]+$/, 'Mã số thuế chỉ được chứa số và dấu gạch ngang')
    .min(10, 'Mã số thuế phải có ít nhất 10 ký tự')
    .max(15, 'Mã số thuế không được vượt quá 15 ký tự')    
    .matches(
      /^(?!([A-Z0-9])\1+$)(?!0+$)[A-Z0-9][A-Z0-9.-]{7,19}$/,
      'Mã số thuế không hợp lệ'
    ),

  address: Yup.string()
    .required('Địa chỉ là bắt buộc')
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
    .max(1000, 'Địa chỉ không được vượt quá 1000 ký tự'),


});

// Bank validation schema for forwarder banks
export const forwarderBankSchema = Yup.object().shape({
  bankName: Yup.string()
    .required('Tên ngân hàng là bắt buộc')
    .min(2, 'Tên ngân hàng phải có ít nhất 2 ký tự')
    .max(255, 'Tên ngân hàng không được vượt quá 255 ký tự'),

  bankCode: Yup.string()
    .required('Mã ngân hàng là bắt buộc')
    .matches(/^[A-Z0-9]+$/, 'Mã ngân hàng chỉ được chứa chữ hoa và số')
    .min(2, 'Mã ngân hàng phải có ít nhất 2 ký tự')
    .max(10, 'Mã ngân hàng không được vượt quá 10 ký tự'),

  bankFullName: Yup.string()
    .required('Tên đầy đủ ngân hàng là bắt buộc')
    .min(2, 'Tên đầy đủ ngân hàng phải có ít nhất 2 ký tự')
    .max(500, 'Tên đầy đủ ngân hàng không được vượt quá 500 ký tự'),

  branchName: Yup.string()
    .required('Tên chi nhánh là bắt buộc')
    .min(2, 'Tên chi nhánh phải có ít nhất 2 ký tự')
    .max(255, 'Tên chi nhánh không được vượt quá 255 ký tự'),

  branchCode: Yup.string()
    .required('Mã chi nhánh là bắt buộc')
    .matches(/^[A-Z0-9]+$/, 'Mã chi nhánh chỉ được chứa chữ hoa và số')
    .min(2, 'Mã chi nhánh phải có ít nhất 2 ký tự')
    .max(10, 'Mã chi nhánh không được vượt quá 10 ký tự'),

  accountNumber: Yup.string()
    .required('Số tài khoản là bắt buộc')
    .matches(/^[0-9]+$/, 'Số tài khoản chỉ được chứa số')
    .min(8, 'Số tài khoản phải có ít nhất 8 ký tự')
    .max(20, 'Số tài khoản không được vượt quá 20 ký tự'),

  accountName: Yup.string()
    .required('Tên tài khoản là bắt buộc')
    .min(2, 'Tên tài khoản phải có ít nhất 2 ký tự')
    .max(255, 'Tên tài khoản không được vượt quá 255 ký tự'),

  swiftCode: Yup.string()
    .optional()
    .matches(/^[A-Z0-9]+$/, 'Mã SWIFT chỉ được chứa chữ hoa và số')
    .min(8, 'Mã SWIFT phải có ít nhất 8 ký tự')
    .max(11, 'Mã SWIFT không được vượt quá 11 ký tự'),

  address: Yup.string()
    .required('Địa chỉ ngân hàng là bắt buộc')
    .min(5, 'Địa chỉ ngân hàng phải có ít nhất 5 ký tự')
    .max(500, 'Địa chỉ ngân hàng không được vượt quá 500 ký tự'),

  phone: Yup.string()
    .optional()
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .max(20, 'Số điện thoại không được vượt quá 20 ký tự'),

  email: Yup.string().optional().email('Định dạng email không hợp lệ').max(255, 'Email không được vượt quá 255 ký tự'),

  website: Yup.string().optional().url('Định dạng website không hợp lệ').max(255, 'Website không được vượt quá 255 ký tự'),

  currency: Yup.string()
    .required('Loại tiền tệ là bắt buộc')
    .oneOf(['VND', 'USD', 'EUR', 'JPY', 'CNY', 'THB', 'KRW', 'SGD'], 'Loại tiền tệ không hợp lệ'),

  isDefault: Yup.boolean().required('Trạng thái mặc định là bắt buộc')
});

export default forwarderSchema;
