import { CommonStatus } from './enums';

export * from './enums';
export { default as numberHelper } from './numberHelper';
export { default as dateHelper } from './dateHelper';
export * from './dateHelper';
export * from './validate-errors';
export * from './string-helper';
export * from './option-helper';
export * from './regex';
export * from './object-helper';
export * from './unit-helper';

export { default as transformHelper } from './transform-helper';

export const getFormatDateMMDD = (date_iso: string = ''): string => {
  if (!date_iso) return '---';
  const date = new Date(date_iso);
  const result = `${date.getMonth() + 1}-${date.getDate()}`;
  return result;
};

export const convertToISOString = (input: string): string => {
  if (!input) return '---';
  const [monthStr, dayStr] = input.split('-');
  const month = parseInt(monthStr); // tháng từ 1-12
  const day = parseInt(dayStr);
  const year = new Date().getFullYear(); // hoặc bạn có thể truyền vào năm cố định

  // Lưu ý: Tháng trong Date là từ 0 (Jan) đến 11 (Dec)
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.toISOString();
};

export const formatStatus = (id: number = 1) => {
  /* 'Active' | 'Completed' | 'Pending'; */
  switch (id) {
    case 1:
      return 'WORKING';
    case 2:
      return 'PENDING';
    case 3:
      return 'APPROVED';
    default:
      return 'INACTIVE';
  }
};

export const formatLabelStatus = (type: string = 'WORKING', translation: Function = () => {}) => {
  switch (type) {
    case 'APPROVED':
      return translation('approval_label');
    case 'PENDING':
      return translation('pending_label');
    case 'WORKING':
      return translation('active_label');
    default:
      return translation('inactive_label');
  }
};

export const formatLabelPaymentStatus = (type: string = 'WORKING', translation: Function = () => {}) => {
  switch (type) {
    case 'Paid':
      return translation('payment_status_done_label');
    case 'Partial':
      return translation('payment_status_partial_label');
    default:
      return translation('payment_status_notdone_label');
  }
};

export const formatCurrentMoney = (number: number = 0, currency: string = 'USD') => {
  if (!number || !currency) return '---';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(number);
};

export const randomDifferentNumber = (original: number, min: number, max: number): number => {
  let result;
  do {
    result = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (result === original);
  return result;
};

export const isObjectDifferent = (obj1: Record<string, any>, obj2: Record<string, any>): boolean => {
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of keys) {
    if (obj1[key] !== obj2[key]) {
      return true;
    }
  }

  return false;
};

export const isArrayOfObjectsDifferent = (arr1: Record<string, any>[], arr2: Record<string, any>[]): boolean => {
  if (arr1.length !== arr2.length) return true;

  for (let i = 0; i < arr1.length; i++) {
    const keys = new Set([...Object.keys(arr1[i]), ...Object.keys(arr2[i])]);
    for (const key of keys) {
      if (arr1[i][key] !== arr2[i][key]) {
        return true;
      }
    }
  }

  return false;
};

export const formatNumber = (
  value: number | null | any,
  options: {
    locale?: string; // Mặc định 'vi-VN'
    currency?: string; // Nếu muốn format tiền tệ, ví dụ: 'VND'
    showSignLabel?: boolean; // Nếu true: sẽ hiện 'Âm' hoặc 'Dương'
  } = {}
): string => {
  const { locale = 'vi-VN', currency, showSignLabel = false } = options;

  // Return empty string if value is null, undefined, or empty
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const absValue = Math.abs(value);

  // Custom formatting function to add comma every 3 digits
  const formatWithCommas = (num: number): string => {
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  let formattedNumber: string;

  if (currency) {
    // Use Intl.NumberFormat for currency
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    });
    formattedNumber = formatter.format(absValue);
  } else {
    // Use custom formatting for numbers
    formattedNumber = formatWithCommas(absValue);
  }

  if (showSignLabel) {
    return value < 0 ? `Âm ${formattedNumber}` : `Dương ${formattedNumber}`;
  }

  return value < 0 ? `-${formattedNumber}` : formattedNumber;
};

export const isDifferentArrayObjects = (arr1: any, arr2: any) => {
  // If lengths are different, they're definitely not the same
  if (arr1.length !== arr2.length) return true;

  return arr1.some((obj1: any, index: number) => {
    const obj2 = arr2[index];
    if (!obj2) return true;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // Check if keys differ
    if (keys1.length !== keys2.length || !keys1.every((k) => keys2.includes(k))) {
      return true;
    }

    // Check if any value differs
    return keys1.some((key) => obj1[key] !== obj2[key]);
  });
};

export const getKeyFromValue = (value: string) => {
  const units = [
    { key: 'Tấn', value: 'TON' },
    { key: 'Kg', value: 'KG' },
    { key: 'Gram', value: 'G' },
    { key: 'Cái', value: 'PCS' },
    { key: 'Hộp', value: 'BOX' },
    { key: 'Lít', value: 'L' },
    { key: 'Mét', value: 'M' },
    { key: 'Mét khối', value: 'M3' },
    { key: 'Container', value: 'CONT' },
    { key: 'Bao', value: 'BAG' },
    { key: 'Cuộn', value: 'ROLL' },
    { key: 'Tá', value: 'DOZEN' }
  ];

  const found = units.find((unit) => unit.value === value);
  return found ? found.key : null;
};

export const countStatus = (type: number | null, arr: any[]) => {
  switch (type) {
    case 0:
      return arr.filter((item) => item.status === 0).length;
    case 1:
      return arr.filter((item) => item.status === 1).length;
    case 2:
      return arr.filter((item) => item.status === 2).length;
    case 3:
      return arr.filter((item) => item.status === 3).length;
    default:
      return 0;
  }
};

export type TabColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export const getTabColor = (type: number | null): TabColor => {
  switch (type) {
    case CommonStatus.Inactive:
      return 'error';
    case CommonStatus.Active:
      return 'success';
    case CommonStatus.Pending:
      return 'warning';
    case CommonStatus.Approved:
      return 'primary';
    case CommonStatus.Rejected:
      return 'error';
    case CommonStatus.RequestApproval:
      return 'warning';
    default:
      return 'info';
  }
};

export const getStatusColor = (status: number): TabColor => {
  switch (status) {
    case CommonStatus.Inactive:
      return 'error';
    case CommonStatus.Active:
      return 'success';
    case CommonStatus.Pending:
      return 'warning';
    case CommonStatus.Approved:
      return 'primary';
    case CommonStatus.Rejected:
      return 'error';
    case CommonStatus.RequestApproval:
      return 'warning';
    default:
      return 'default';
  }
};

export const getStatusText = (status: CommonStatus): string => {
  switch (status) {
    case CommonStatus.Inactive:
      return 'Không hoạt động';
    case CommonStatus.Active:
      return 'Hoạt động';
    case CommonStatus.Pending:
      return 'Chờ duyệt';
    case CommonStatus.Approved:
      return 'Đã phê duyệt';
    case CommonStatus.Rejected:
      return 'Từ chối';
    case CommonStatus.RequestApproval:
      return 'Chờ duyệt';
    default:
      return '---';
  }
};

// Helper function to parse formatted numbers with comma separators
export const parseFormattedNumber = (value: string): number | null => {
  if (!value || value.trim() === '') return null;
  // Remove all non-numeric characters except decimal point and comma
  const cleanValue = value.replace(/[^\d.,-]/g, '').replace(/,/g, '');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? null : parsed;
};
