import * as Yup from 'yup';

// Helper function to validate spaces
const validateSpaces = (value: string, fieldName: string) => {
  if (!value) return true;

  // Check for consecutive spaces (more than 1 space in a row)
  if (/\s{2,}/.test(value)) {
    return `${fieldName} không được chứa nhiều khoảng trắng liên tiếp`;
  }

  // Check for leading or trailing spaces
  if (value.startsWith(' ') || value.endsWith(' ')) {
    return `${fieldName} không được bắt đầu hoặc kết thúc bằng khoảng trắng`;
  }

  // Check if spaces make up more than 20% of the string
  const spaceCount = (value.match(/\s/g) || []).length;
  const spaceRatio = spaceCount / value.length;
  if (spaceRatio > 0.2) {
    return `${fieldName} chứa quá nhiều khoảng trắng`;
  }

  return true;
};

export const bankSchema = Yup.object().shape({
  // Tên ngân hàng - được chọn từ dropdown
  name: Yup.string()
    .required('Tên ngân hàng là bắt buộc')
    .test('validate-spaces', 'Tên ngân hàng không hợp lệ', function (value) {
      const result = validateSpaces(value, 'Tên ngân hàng');
      return result === true ? true : this.createError({ message: result });
    }),

  // Thông tin chi nhánh cụ thể
  branchName: Yup.string()
    .required('Tên chi nhánh là bắt buộc')
    .test('validate-spaces', 'Tên chi nhánh không hợp lệ', function (value) {
      const result = validateSpaces(value, 'Tên chi nhánh');
      return result === true ? true : this.createError({ message: result });
    }),
  branchCode: Yup.string()
    .required('Mã chi nhánh là bắt buộc')
    .test('validate-spaces', 'Mã chi nhánh không hợp lệ', function (value) {
      const result = validateSpaces(value, 'Mã chi nhánh');
      return result === true ? true : this.createError({ message: result });
    }),
  address: Yup.string()
    .required('Địa chỉ là bắt buộc')
    .test('validate-spaces', 'Địa chỉ không hợp lệ', function (value) {
      const result = validateSpaces(value, 'Địa chỉ');
      return result === true ? true : this.createError({ message: result });
    }),

  // Thông tin liên hệ
  phone: Yup.string()
    .required('Số điện thoại là bắt buộc')
    .test('validate-spaces', 'Số điện thoại không hợp lệ', function (value) {
      const result = validateSpaces(value, 'Số điện thoại');
      return result === true ? true : this.createError({ message: result });
    })
    .test('vietnam-phone', 'Số điện thoại không hợp lệ', function (value) {
      if (!value) return false;

      // Remove all spaces, dashes, dots, and parentheses
      const cleanPhone = value.replace(/[\s\-\.\(\)]/g, '');

      // Vietnamese phone number patterns
      const patterns = [
        // Mobile numbers with country code +84
        /^\+84(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])\d{7}$/,
        // Mobile numbers domestic format (0x)
        /^0(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])\d{7}$/,
        // Landline numbers with country code +84
        /^\+84(2[0-9])\d{8}$/,
        // Landline numbers domestic format (0x)
        /^0(2[0-9])\d{8}$/,
        // Old mobile format (still valid)
        /^0(12[0-9]|16[2-9]|18[0-9]|19[0-9])\d{7}$/,
        // International format without + sign
        /^84(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])\d{7}$/,
        /^84(2[0-9])\d{8}$/
      ];

      return patterns.some((pattern) => pattern.test(cleanPhone));
    }),

  // email validation
  email: Yup.string()
  // .required('Email là bắt buộc')
  .email('Định dạng email không hợp lệ')
  .test('domain-check', 'Tên miền email không hợp lệ (ví dụ: example.com)', function (value) {

      if (!value) return true; // Let .required() handle empty values
      const parts = value.split('@');
      if (parts.length !== 2) {
        return true; // Let .email() handle basic format
      }
      const domain = parts[1];
      // Domain must exist, have at least one dot, and the TLD must be at least 2 characters long.
      // This prevents things like `test@localhost` or `test@domain.c`
      if (!domain || !domain.includes('.') || (domain.split('.').pop()?.length ?? 0) < 2) {
        return false;
      }
      return true;
    }).optional(),

  // Tiền tệ và trạng thái
  currency: Yup.string().required('Tiền tệ là bắt buộc'),
  isDefault: Yup.number().required('Trạng thái mặc định là bắt buộc'),

  // Các field tự động điền (optional validation)
  // code: Yup.string().test('validate-spaces', 'Mã ngân hàng không hợp lệ', function (value) {
  //   if (!value) return true; // Optional field
  //   const result = validateSpaces(value, 'Mã ngân hàng');
  //   return result === true ? true : this.createError({ message: result });
  // }),
  // fullName: Yup.string().test('validate-spaces', 'Tên đầy đủ không hợp lệ', function (value) {
  //   if (!value) return true; // Optional field
  //   const result = validateSpaces(value, 'Tên đầy đủ');
  //   return result === true ? true : this.createError({ message: result });
  // }),
  // swiftCode: Yup.string().test('validate-spaces', 'Mã SWIFT không hợp lệ', function (value) {
  //   if (!value) return true; // Optional field
  //   const result = validateSpaces(value, 'Mã SWIFT');
  //   return result === true ? true : this.createError({ message: result });
  // }),
  // bankCode: Yup.string().test('validate-spaces', 'Mã ngân hàng không hợp lệ', function (value) {
  //   if (!value) return true; // Optional field
  //   const result = validateSpaces(value, 'Mã ngân hàng');
  //   return result === true ? true : this.createError({ message: result });
  // }),
  // website: Yup.string()
  //   .url('Website không hợp lệ')
  //   .test('validate-spaces', 'Website không hợp lệ', function (value) {
  //     if (!value) return true; // Optional field
  //     const result = validateSpaces(value, 'Website');
  //     return result === true ? true : this.createError({ message: result });
  //   }),
  // country: Yup.string().test('validate-spaces', 'Quốc gia không hợp lệ', function (value) {
  //   if (!value) return true; // Optional field
  //   const result = validateSpaces(value, 'Quốc gia');
  //   return result === true ? true : this.createError({ message: result });
  // }),
  // city: Yup.string().test('validate-spaces', 'Thành phố không hợp lệ', function (value) {
  //   if (!value) return true; // Optional field
  //   const result = validateSpaces(value, 'Thành phố');
  //   return result === true ? true : this.createError({ message: result });
  // })
});
