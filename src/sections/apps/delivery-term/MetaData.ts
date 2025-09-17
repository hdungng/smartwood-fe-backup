import { rankItem } from '@tanstack/match-sorter-utils';
import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';
import { TDeliveryTerm } from 'types/delivery-term';

// ==============================|| FILTER FIELDS ||============================== //
export const filterFields = [
  {
    key: 'code',
    label: 'Mã điều kiện',
    type: 'text' as const,
    placeholder: 'Nhập mã điều kiện...'
  },
  {
    key: 'name',
    label: 'Tên điều kiện',
    type: 'text' as const,
    placeholder: 'Nhập tên điều kiện...'
  },
  {
    key: 'description',
    label: 'Mô tả',
    type: 'text' as const,
    placeholder: 'Nhập mô tả...'
  },
  {
    key: 'incoterm',
    label: 'Incoterm',
    type: 'select' as const,
    placeholder: 'Chọn incoterm...',
    options: [
      { value: 'EXW', label: 'EXW' },
      { value: 'FCA', label: 'FCA' },
      { value: 'CPT', label: 'CPT' },
      { value: 'CIP', label: 'CIP' },
      { value: 'DAP', label: 'DAP' },
      { value: 'DPU', label: 'DPU' },
      { value: 'DDP', label: 'DDP' },
      { value: 'FAS', label: 'FAS' },
      { value: 'FOB', label: 'FOB' },
      { value: 'CFR', label: 'CFR' },
      { value: 'CIF', label: 'CIF' },
      { value: 'DDU', label: 'DDU' },
      { value: 'DAT', label: 'DAT' }
    ]
  },
  {
    key: 'responsibility',
    label: 'Trách nhiệm',
    type: 'select' as const,
    placeholder: 'Chọn trách nhiệm...',
    options: [
      { value: 'SELLER', label: 'Người bán' },
      { value: 'BUYER', label: 'Người mua' }
    ]
  },
  {
    key: 'deliveryLocation',
    label: 'Địa điểm giao hàng',
    type: 'select' as const,
    placeholder: 'Chọn địa điểm...',
    options: [
      { value: 'PORT', label: 'Cảng' },
      { value: 'SELLER_LOCATION', label: 'Địa điểm người bán' },
      { value: 'BUYER_LOCATION', label: 'Địa điểm người mua' }
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
export const fuzzyFilter: FilterFn<TDeliveryTerm> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

// ==============================|| CSV HEADERS BUILDER ||============================== //
export const buildCsvHeaders = (columns: ColumnDef<TDeliveryTerm>[]): LabelKeyObject[] => {
  return columns
    .filter((column) => 'accessorKey' in column && column.accessorKey)
    .map((column) => ({
      label: typeof column.header === 'string' ? column.header : '#',
      key: ('accessorKey' in column ? column.accessorKey : '') as string
    }));
};
