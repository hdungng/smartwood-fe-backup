import { rankItem } from '@tanstack/match-sorter-utils';
import { FilterFn } from '@tanstack/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';
import { TPaymentTerm } from 'types/payment-term';

// ==============================|| FILTER FIELDS ||============================== //
export const filterFields = [
  {
    key: 'code',
    label: 'Mã điều kiện thanh toán',
    type: 'text' as const,
    placeholder: 'Nhập mã điều kiện thanh toán...'
  },
  {
    key: 'name',
    label: 'Tên điều kiện thanh toán',
    type: 'text' as const,
    placeholder: 'Nhập tên điều kiện thanh toán...'
  },
  {
    key: 'description',
    label: 'Mô tả',
    type: 'text' as const,
    placeholder: 'Nhập mô tả...'
  },
  {
    key: 'paymentMethod',
    label: 'Phương thức thanh toán',
    type: 'select' as const,
    placeholder: 'Chọn phương thức thanh toán...',
    options: [
      { value: 'CASH', label: 'Tiền mặt' },
      { value: 'CREDIT', label: 'Tín dụng' },
      { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
      { value: 'CHECK', label: 'Séc' }
    ]
  },
  {
    key: 'status',
    label: 'Trạng thái',
    type: 'select' as const,
    placeholder: 'Chọn trạng thái...',
    options: [
      { value: '1', label: 'Hoạt động' },
      { value: '0', label: 'Không hoạt động' }
    ]
  }
];

// ==============================|| RESPONSIVE STYLES ||============================== //
export const responsiveStyles = {
  container: {
    p: { xs: 1.5, sm: 2.5 },
    gap: { xs: 1.5, sm: 2 },
    justifyContent: 'space-between',
    alignItems: { xs: 'stretch', sm: 'center' }
  },
  actionStack: {
    gap: { xs: 1, sm: 1.5 },
    alignItems: { xs: 'stretch', sm: 'center' },
    flexWrap: 'wrap'
  },
  tableCell: {
    fontSize: { xs: '0.75rem', sm: '0.875rem' },
    padding: { xs: '6px 8px', sm: '8px 16px' }
  }
};

// ==============================|| FUZZY FILTER ||============================== //
export const fuzzyFilter: FilterFn<TPaymentTerm> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

// ==============================|| CSV HEADERS BUILDER ||============================== //
export const buildCsvHeaders = (columns: ColumnDef<TPaymentTerm>[]): LabelKeyObject[] => {
  return columns
    .filter((column) => 'accessorKey' in column && column.accessorKey)
    .map((column) => ({
      label: typeof column.header === 'string' ? column.header : '#',
      key: ('accessorKey' in column ? column.accessorKey : '') as string
    }));
};
