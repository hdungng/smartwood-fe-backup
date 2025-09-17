import { rankItem } from '@tanstack/match-sorter-utils';
import { FilterFn } from '@tanstack/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';
import { Config } from 'types/config';

// ==============================|| RESPONSIVE STYLES ||============================== //
export const responsiveStyles = {
  container: {
    p: 2.5,
    gap: 2,
    alignItems: { xs: 'stretch', sm: 'center' },
    justifyContent: 'space-between'
  },
  actionStack: {
    gap: 1,
    alignItems: { xs: 'stretch', sm: 'center' }
  },
  tableCell: {
    p: 1.5,
    '&:first-of-type': {
      pl: 2.5
    },
    '&:last-of-type': {
      pr: 2.5
    }
  }
};

// ==============================|| INITIAL FILTER VALUES ||============================== //
export const INITIAL_FILTER_VALUES = {
  code: '',
  name: '',
  codeType: '',
  screenName: ''
};

// ==============================|| FILTER FIELDS ||============================== //
export const filterFields = [
  {
    key: 'code',
    label: 'Mã cấu hình',
    type: 'text' as const,
    placeholder: 'Nhập mã cấu hình...'
  },
  {
    key: 'name',
    label: 'Tên cấu hình',
    type: 'text' as const,
    placeholder: 'Nhập tên cấu hình...'
  },
  {
    key: 'codeType',
    label: 'Loại mã',
    type: 'text' as const,
    placeholder: 'Nhập loại mã...'
  },
  {
    key: 'screenName',
    label: 'Tên màn hình',
    type: 'text' as const,
    placeholder: 'Nhập tên màn hình...'
  }
];

// ==============================|| HELPER FUNCTIONS ||============================== //
export const fuzzyFilter: FilterFn<Config> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

export const buildCsvHeaders = (columns: ColumnDef<Config>[]): LabelKeyObject[] => {
  return columns
    .filter((column) => 'accessorKey' in column && column.accessorKey)
    .map((column) => ({
      label: typeof column.header === 'string' ? column.header : '#',
      key: ('accessorKey' in column ? column.accessorKey : '') as string
    }));
};
