import { rankItem } from '@tanstack/match-sorter-utils';
import { FilterFn } from '@tanstack/react-table';

import { ColumnDef } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';
import { TCustomer } from 'types/customer';

// ==============================|| CONSTANTS ||============================== //
export const INITIAL_FILTER_VALUES = {
  code: '',
  name: '',
  represented: '',
  phone: '',
  email: '',
  address: '',
  taxCode: '',
  fax: '',
  status: ''
};

export const filterFields = [
  { key: 'code', label: 'Mã khách hàng', type: 'text' as const, placeholder: 'Tìm kiếm mã...' },
  { key: 'name', label: 'Tên khách hàng', type: 'text' as const, placeholder: 'Tìm kiếm tên...' },
  { key: 'represented', label: 'Người đại diện', type: 'text' as const, placeholder: 'Tìm kiếm người đại diện...' },
  { key: 'phone', label: 'Số điện thoại', type: 'text' as const, placeholder: 'Tìm kiếm số điện thoại...' },
  { key: 'email', label: 'Email', type: 'text' as const, placeholder: 'Tìm kiếm email...' },
  { key: 'address', label: 'Địa chỉ', type: 'text' as const, placeholder: 'Tìm kiếm địa chỉ...' },
  { key: 'taxCode', label: 'Mã số thuế', type: 'text' as const, placeholder: 'Tìm kiếm mã số thuế...' },
  { key: 'fax', label: 'Số fax', type: 'text' as const, placeholder: 'Tìm kiếm số fax...' }
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
export const fuzzyFilter: FilterFn<TCustomer> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

export const buildCsvHeaders = (columns: ColumnDef<TCustomer>[]): LabelKeyObject[] => {
  return columns
    .filter((column) => 'accessorKey' in column && column.accessorKey)
    .map((column) => ({
      label: typeof column.header === 'string' ? column.header : '#',
      key: ('accessorKey' in column ? column.accessorKey : '') as string
    }));
};
