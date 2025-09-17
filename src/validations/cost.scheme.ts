import * as yup from 'yup';

export const costSchema = yup.object({
  costGroup: yup
    .string()
    .oneOf(['purchaseOrder', 'other'], 'Nhóm chi phí không hợp lệ')
    .required('Nhóm chi phí là bắt buộc'),
  codeType: yup
    .string()
    .when('costGroup', {
      is: 'purchaseOrder',
      then: (schema) => schema.oneOf(['logistics', 'customs', 'finance', 'management', 'other'], 'Loại chi phí không hợp lệ').required('Loại chi phí là bắt buộc'),
      otherwise: (schema) => schema.notRequired()
    }),
  itemCode: yup
    .string()
    .when('costGroup', {
      is: 'purchaseOrder',
      then: (schema) => schema.required('Mã hạng mục là bắt buộc'),
      otherwise: (schema) => schema.notRequired()
    }),
  name: yup.string().notRequired(),
  amount: yup
    .number()
    .typeError('Số tiền phải là một số')
    .min(0, 'Số tiền phải lớn hơn hoặc bằng 0')
    .required('Số tiền là bắt buộc'),
  currency: yup
    .string()
    .oneOf(['VND', 'USD', '%'], 'Đơn vị tiền tệ không hợp lệ')
    .required('Đơn vị tiền tệ là bắt buộc'),
  effectiveFrom: yup.string().required('Ngày hiệu lực bắt đầu là bắt buộc'),
  effectiveTo: yup.string().required('Ngày hiệu lực kết thúc là bắt buộc')
});
