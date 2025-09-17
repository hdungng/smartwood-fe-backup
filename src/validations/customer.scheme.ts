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

const viNamePattern = /^[\p{L}\p{M}\s'.-]+$/u;

export const customerSchema = Yup.object().shape({
  name: Yup.string()
    .required('Tên khách hàng là bắt buộc')
    .min(2, 'Tên khách hàng phải có ít nhất 2 ký tự')
    .max(255, 'Tên khách hàng không được vượt quá 255 ký tự')
    .matches(viNamePattern, 'Tên khách hàng chỉ được chứa chữ cái và khoảng trắng')
    .test('validate-spaces', 'Tên khách hàng không hợp lệ', function (value) {
      const result = validateSpaces(value, 'Tên khách hàng');
      return result === true ? true : this.createError({ message: result });
    }),

  represented: Yup.string()
    .required('Tên người đại diện là bắt buộc')
    .min(2, 'Tên người đại diện phải có ít nhất 2 ký tự')
    .max(100, 'Tên người đại diện không được vượt quá 100 ký tự')
    .matches(viNamePattern, 'Tên người đại diện chỉ được chứa chữ cái và khoảng trắng')
    .test('validate-spaces', 'Tên người đại diện không hợp lệ', function (value) {
      const result = validateSpaces(value, 'Tên người đại diện');
      return result === true ? true : this.createError({ message: result });
    }),

  phone: Yup.string()
    .required('Số điện thoại là bắt buộc')
    .test('validate-spaces', 'Số điện thoại không hợp lệ', function (value) {
      const result = validateSpaces(value, 'Số điện thoại');
      return result === true ? true : this.createError({ message: result });
    })
    .max(10, 'Số điện thoại không được vượt quá 10 ký tự')
    .min(10, 'Số điện thoại phải có ít nhất 10 ký tự')
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

  address: Yup.string()
    .required('Địa chỉ là bắt buộc')
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự')
    .test('validate-spaces', 'Địa chỉ không hợp lệ', function (value) {
      const result = validateSpaces(value, 'Địa chỉ');
      return result === true ? true : this.createError({ message: result });
    }),

  email: Yup.string()
    .required('Email là bắt buộc')
    .email('Định dạng email không hợp lệ')
    .max(255, 'Email không được vượt quá 255 ký tự')
    .test('validate-spaces', 'Email không hợp lệ', function (value) {
      const result = validateSpaces(value, 'Email');
      return result === true ? true : this.createError({ message: result });
    })
    .test('valid-email', 'Định dạng email không hợp lệ', function (value) {
      if (!value) return false;
      const regex = /^(?!.*\.\.)(?!\.)([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?<!\.)$/;
      return regex.test(value) ? true : this.createError({ message: 'Định dạng email không hợp lệ' });
    }),

  taxCode: Yup.string()
    .required('Mã số thuế là bắt buộc')
    .matches(/^[0-9-]+$/, 'Mã số thuế chỉ được chứa số và dấu gạch ngang')
    .min(10, 'Mã số thuế phải có ít nhất 10 ký tự')
    .max(15, 'Mã số thuế không được vượt quá 15 ký tự')    
    .matches(
      /^(?!([A-Z0-9])\1+$)(?!0+$)[A-Z0-9][A-Z0-9.-]{7,19}$/,
      'Mã số thuế không hợp lệ'
    ),

  fax: Yup.string()
    .optional()
    .matches(/^[0-9+\-\s()]+$/, 'Số fax không hợp lệ')
    .max(20, 'Số fax không được vượt quá 20 ký tự')
    .test('validate-spaces', 'Số fax không hợp lệ', function (value) {
      if (!value) return true; // Optional field
      const result = validateSpaces(value, 'Số fax');
      return result === true ? true : this.createError({ message: result });
    }),

  bankId: Yup.number().optional().integer('ID ngân hàng phải là số nguyên').positive('ID ngân hàng phải là số dương'),

  status: Yup.number()
    .required('Trạng thái là bắt buộc')
    .integer('Trạng thái phải là số nguyên')
    .oneOf([0, 1], 'Trạng thái phải là 0 (không hoạt động) hoặc 1 (hoạt động)')
});

export default customerSchema;
