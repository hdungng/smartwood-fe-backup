import * as Yup from 'yup';

export const shippingLineSchema = Yup.object().shape({
  code: Yup.string().required('Mã là bắt buộc').min(1, 'Mã phải có ít nhất 1 ký tự').max(50, 'Mã không được vượt quá 50 ký tự'),
  description: Yup.string().required('Mô tả là bắt buộc'),
  name: Yup.string()
    .required('Tên shipping line là bắt buộc')
    .min(2, 'Tên shipping line phải có ít nhất 2 ký tự')
    .max(255, 'Tên shipping line không được vượt quá 255 ký tự')
});

export default shippingLineSchema;
