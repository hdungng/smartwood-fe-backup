import { rankItem } from '@tanstack/match-sorter-utils';
import { FilterFn } from '@tanstack/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';
import { TExchangeRate } from 'types/exchange-rate';

// ==============================|| CONSTANTS ||============================== //
export const INITIAL_FILTER_VALUES = {
  name: '',
  code: '',
  fromCurrency: '',
  toCurrency: '',
  rateType: '',
  source: '',
  status: ''
};

export const filterFields = [
  { key: 'name', label: 'Tên tỷ giá', type: 'text' as const, placeholder: 'Tìm kiếm tên...' },
  { key: 'code', label: 'Mã tỷ giá', type: 'text' as const, placeholder: 'Tìm kiếm mã...' },
  { key: 'fromCurrency', label: 'Tiền tệ nguồn', type: 'text' as const, placeholder: 'Tìm kiếm tiền tệ nguồn...' },
  { key: 'toCurrency', label: 'Tiền tệ đích', type: 'text' as const, placeholder: 'Tìm kiếm tiền tệ đích...' },
  {
    key: 'rateType',
    label: 'Loại tỷ giá',
    type: 'select' as const,
    options: [
      { label: 'Tất cả', value: '' },
      { label: 'Chính thức', value: 'OFFICIAL' },
      { label: 'Thị trường', value: 'MARKET' },
      { label: 'Ngân hàng', value: 'BANK' }
    ]
  },
  {
    key: 'source',
    label: 'Nguồn',
    type: 'select' as const,
    options: [
      { label: 'Tất cả', value: '' },
      { label: 'Ngân hàng Trung ương', value: 'Central Bank' },
      { label: 'Ngân hàng thương mại', value: 'Commercial Bank' },
      { label: 'Thị trường tự do', value: 'Free Market' }
    ]
  }
];

// ==============================|| STYLES ||============================== //
export const responsiveStyles = {
  container: {
    gap: 2,
    alignItems: { xs: 'stretch', sm: 'center' },
    justifyContent: 'space-between',
    p: 2
  },
  actionStack: {
    gap: 2,
    alignItems: 'center',
    width: { xs: '100%', sm: 'auto' },
    flexWrap: 'wrap'
  },
  tableCell: {
    whiteSpace: { xs: 'nowrap', sm: 'normal' },
    minWidth: { xs: '120px', sm: 'auto' }
  }
};

// ==============================|| HELPER FUNCTIONS ||============================== //
export const fuzzyFilter: FilterFn<TExchangeRate> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

export const buildCsvHeaders = (columns: ColumnDef<TExchangeRate>[]): LabelKeyObject[] => {
  return columns
    .filter((column) => 'accessorKey' in column && column.accessorKey)
    .map((column) => ({
      label: typeof column.header === 'string' ? column.header : '#',
      key: ('accessorKey' in column ? column.accessorKey : '') as string
    }));
};

// ==============================|| CURRENCY OPTIONS ||============================== //
export const CURRENCY_OPTIONS = [
  { value: 'VND', label: 'VND - Việt Nam Đồng' },
  { value: 'USD', label: 'USD - Đô la Mỹ' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - Bảng Anh' },
  { value: 'JPY', label: 'JPY - Yên Nhật' },
  { value: 'AUD', label: 'AUD - Đô la Úc' },
  { value: 'CAD', label: 'CAD - Đô la Canada' },
  { value: 'CNY', label: 'CNY - Nhân dân tệ' },
  { value: 'KRW', label: 'KRW - Won Hàn Quốc' },
  { value: 'SGD', label: 'SGD - Đô la Singapore' },
  { value: 'THB', label: 'THB - Baht Thái' },
  { value: 'MYR', label: 'MYR - Ringgit Malaysia' }
];

export const RATE_TYPE_OPTIONS = [
  { value: 'OFFICIAL', label: 'Chính thức' },
  { value: 'MARKET', label: 'Thị trường' },
  { value: 'BANK', label: 'Ngân hàng' }
];

export const SOURCE_OPTIONS = [
  { value: 'Central Bank', label: 'Ngân hàng Trung ương' },
  { value: 'Commercial Bank', label: 'Ngân hàng thương mại' },
  { value: 'Free Market', label: 'Thị trường tự do' }
];
