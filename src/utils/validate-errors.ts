export const validateErrors = {
  required: 'Trường này là bắt buộc',
  mustBeNumber: 'Giá trị phải là một số',
  mustBeThanZero: 'Giá trị phải lớn hơn 0',
  mustBeLessThanHundred: 'Giá trị phải nhỏ hơn hoặc bằng 100',
  invalidDate: 'Ngày tháng không hợp lệ',
  beforeDate: (date: string) => `Ngày phải sau ${date}`,
  afterDate: (date: string) => `Ngày phải trước ${date}`,
  minArray: (min: number) => `Phải có ít nhất ${min} mục trong danh sách`,
};
