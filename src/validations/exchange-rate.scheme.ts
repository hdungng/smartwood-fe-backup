import * as Yup from 'yup';

// ==============================|| EXCHANGE RATE VALIDATION SCHEMAS ||============================== //

// export const exchangeRateSchema = Yup.object().shape({
//   code: Yup.string()
//     .required('Mã tỷ giá là bắt buộc')
//     .min(3, 'Mã tỷ giá phải có ít nhất 3 ký tự')
//     .max(20, 'Mã tỷ giá không được vượt quá 20 ký tự')
//     .matches(/^[A-Z0-9]+$/, 'Mã tỷ giá chỉ được chứa chữ cái viết hoa và số'),

//   name: Yup.string()
//     .required('Tên tỷ giá là bắt buộc')
//     .min(5, 'Tên tỷ giá phải có ít nhất 5 ký tự')
//     .max(100, 'Tên tỷ giá không được vượt quá 100 ký tự'),

//   fromCurrency: Yup.string()
//     .required('Tiền tệ nguồn là bắt buộc')
//     .length(3, 'Mã tiền tệ phải có đúng 3 ký tự')
//     .matches(/^[A-Z]{3}$/, 'Mã tiền tệ phải là 3 chữ cái viết hoa'),

//   toCurrency: Yup.string()
//     .required('Tiền tệ đích là bắt buộc')
//     .length(3, 'Mã tiền tệ phải có đúng 3 ký tự')
//     .matches(/^[A-Z]{3}$/, 'Mã tiền tệ phải là 3 chữ cái viết hoa')
//     .test('different-currencies', 'Tiền tệ nguồn và đích phải khác nhau', function (value) {
//       return value !== this.parent.fromCurrency;
//     }),

//   exchangeRate: Yup.number()
//     .required('Tỷ giá là bắt buộc')
//     .positive('Tỷ giá phải là số dương')
//     .min(0.0001, 'Tỷ giá phải lớn hơn 0.0001')
//     .max(999999999, 'Tỷ giá không được vượt quá 999,999,999'),

//   buyRate: Yup.number()
//     .required('Giá mua là bắt buộc')
//     .positive('Giá mua phải là số dương')
//     .min(0.0001, 'Giá mua phải lớn hơn 0.0001')
//     .max(999999999, 'Giá mua không được vượt quá 999,999,999'),

//   sellRate: Yup.number()
//     .required('Giá bán là bắt buộc')
//     .positive('Giá bán phải là số dương')
//     .min(0.0001, 'Giá bán phải lớn hơn 0.0001')
//     .max(999999999, 'Giá bán không được vượt quá 999,999,999')
//     .test('sell-greater-than-buy', 'Giá bán phải lớn hơn hoặc bằng giá mua', function (value) {
//       return !value || !this.parent.buyRate || value >= this.parent.buyRate;
//     }),

//   effectiveDate: Yup.date().required('Ngày hiệu lực là bắt buộc').min(new Date(), 'Ngày hiệu lực không được là ngày trong quá khứ'),

//   expiryDate: Yup.date()
//     .required('Ngày hết hạn là bắt buộc')
//     .test('expiry-after-effective', 'Ngày hết hạn phải sau ngày hiệu lực', function (value) {
//       return !value || !this.parent.effectiveDate || value > this.parent.effectiveDate;
//     }),

//   rateType: Yup.string().required('Loại tỷ giá là bắt buộc').oneOf(['OFFICIAL', 'MARKET', 'BANK'], 'Loại tỷ giá không hợp lệ'),

//   source: Yup.string().required('Nguồn là bắt buộc').min(3, 'Nguồn phải có ít nhất 3 ký tự').max(100, 'Nguồn không được vượt quá 100 ký tự')
// });
export const exchangeRateSchema = Yup.object().shape({
  code: Yup.string().required('Mã tỷ giá là bắt buộc'),
  name: Yup.string().required('Tên tỷ giá là bắt buộc'),
  fromCurrency: Yup.string().required('Tiền tệ nguồn là bắt buộc'),
  toCurrency: Yup.string().required('Tiền tệ đích là bắt buộc'),
  buyRate: Yup.number().required('Tỷ giá mua là bắt buộc').positive('Tỷ giá mua phải lớn hơn 0'),
  sellRate: Yup.number().required('Tỷ giá bán là bắt buộc').positive('Tỷ giá bán phải lớn hơn 0'),
  effectiveDate: Yup.string().required('Ngày hiệu lực là bắt buộc'),
  expiryDate: Yup.string().required('Ngày hết hạn là bắt buộc'),
  rateType: Yup.string().required('Loại tỷ giá là bắt buộc'),
  source: Yup.string().required('Nguồn là bắt buộc'),
});
export const exchangeRateUpdateSchema = exchangeRateSchema.shape({
  code: Yup.string()
    .min(3, 'Mã tỷ giá phải có ít nhất 3 ký tự')
    .max(20, 'Mã tỷ giá không được vượt quá 20 ký tự')
    .matches(/^[A-Z0-9]+$/, 'Mã tỷ giá chỉ được chứa chữ cái viết hoa và số'),

  effectiveDate: Yup.date().min(new Date(Date.now() - 24 * 60 * 60 * 1000), 'Ngày hiệu lực không được quá cũ')
});

// Search and filter schemas
export const exchangeRateFilterSchema = Yup.object().shape({
  name: Yup.string().max(100, 'Tên không được vượt quá 100 ký tự'),
  code: Yup.string().max(20, 'Mã không được vượt quá 20 ký tự'),
  fromCurrency: Yup.string().max(3, 'Mã tiền tệ không được vượt quá 3 ký tự'),
  toCurrency: Yup.string().max(3, 'Mã tiền tệ không được vượt quá 3 ký tự'),
  rateType: Yup.string().oneOf(['', 'OFFICIAL', 'MARKET', 'BANK'], 'Loại tỷ giá không hợp lệ'),
  source: Yup.string().max(100, 'Nguồn không được vượt quá 100 ký tự'),
  status: Yup.string().oneOf(['', '0', '1'], 'Trạng thái không hợp lệ')
});
