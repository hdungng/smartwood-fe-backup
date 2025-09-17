import { rankItem } from '@tanstack/match-sorter-utils';
import { FilterFn } from '@tanstack/react-table';

import { ColumnDef } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';
import { User } from 'types/user.type';

// ==============================|| CONSTANTS ||============================== //
export const INITIAL_FILTER_VALUES = {
  name: '',
  email: '',
  username: '',
  role: '',
  status: '',
  language: ''
};

export const filterFields = [
  { key: 'name', label: 'Name', type: 'text' as const, placeholder: 'Search name...' },
  { key: 'email', label: 'Email', type: 'text' as const, placeholder: 'Search email...' },
  { key: 'username', label: 'Username', type: 'text' as const, placeholder: 'Search username...' },
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { label: 'All', value: '' },
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
      { label: 'Pending', value: '2' }
    ]
  },
  {
    key: 'language',
    label: 'Language',
    type: 'select' as const,
    options: [
      { label: 'All', value: '' },
      { label: 'Tiếng Việt', value: 'vi' },
      { label: 'English', value: 'en' }
    ]
  }
];

// ==============================|| STYLES ||============================== //
export const responsiveStyles = {
  container: (theme: any) => ({
    gap: 2,
    alignItems: { xs: 'stretch', sm: 'center' },
    justifyContent: 'space-between',
    p: 2,
    [theme.breakpoints.down('sm')]: {
      '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: '100%' },
      '& .MuiStack-root': { width: '100%' }
    }
  }),
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
export const fuzzyFilter: FilterFn<User> = (row, columnId, value, addMeta) => {
  // console.log('🔍 Fuzzy Filter:', {
  //   columnId,
  //   value,
  //   rowData: row.original
  // });
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

export const buildCsvHeaders = (columns: ColumnDef<User>[]): LabelKeyObject[] => {
  return columns
    .filter((column) => 'accessorKey' in column && column.accessorKey)
    .map((column) => ({
      label: typeof column.header === 'string' ? column.header : '#',
      key: ('accessorKey' in column ? column.accessorKey : '') as string
    }));
};
