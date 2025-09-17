import * as yup from 'yup';

// Validation schema for Supplier form
export const supplierScheme = yup.object({
  name: yup.string().required('Tên nhà cung cấp là bắt buộc'),
  phone: yup.string().required('Số điện thoại là bắt buộc'),
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  address: yup.string().required('Địa chỉ là bắt buộc'),
  taxCode: yup.string()
    .optional()
    .matches(
      /^(?!([A-Z0-9])\1+$)(?!0+$)[A-Z0-9][A-Z0-9.-]{7,19}$/,
      'Mã số thuế không hợp lệ'
    ),
  website: yup.string().optional(),
  contactPerson: yup.string().required('Người liên hệ là bắt buộc'),
  contactPhone: yup.string().required('Số điện thoại liên hệ là bắt buộc'),
  contactEmail: yup.string().email('Email liên hệ không hợp lệ').required('Email liên hệ là bắt buộc'),
  // supplierType: yup.string().required('Loại nhà cung cấp là bắt buộc'),
  rating: yup.number().min(1, 'Điểm đánh giá tối thiểu là 1').max(5, 'Điểm đánh giá tối đa là 5').required('Điểm đánh giá là bắt buộc'),
  costSpend: yup.number().min(0, 'Chi phí đã chi phải từ 0 trở lên').optional(),
  costRemain: yup.number().min(0, 'Chi phí còn lại phải từ 0 trở lên').optional(),
  region: yup.string().optional(),
  province: yup.string().optional(),
  district: yup.string().optional()
});
