import { rankItem } from '@tanstack/match-sorter-utils';
import { FilterFn, ColumnDef } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';
import { TCost } from 'types/cost';

export const COST_TYPES = [
  { label: 'Finance', value: 'finance' },
  { label: 'Logistics', value: 'logistics' },
  { label: 'Customs', value: 'customs' },
  { label: 'Management', value: 'management' },
  { label: 'Other', value: 'other' }
];

export const CURRENCY_OPTIONS = [
  { label: 'VND', value: 'VND' },
  { label: 'USD', value: 'USD' },
  { label: '%', value: '%' }
];

export const filterFields = [
  { key: 'name', label: 'Name', type: 'text' as const, placeholder: 'Search name...' },
  { key: 'itemCode', label: 'Item Code', type: 'text' as const, placeholder: 'Search item code...' },
  { key: 'costType', label: 'Cost Type', type: 'select' as const, options: [{ label: 'All', value: '' }, ...COST_TYPES] },
  { key: 'currency', label: 'Currency', type: 'select' as const, options: [{ label: 'All', value: '' }, ...CURRENCY_OPTIONS] }
];

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

export const fuzzyFilter: FilterFn<TCost> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

export const buildCsvHeaders = (columns: ColumnDef<TCost>[]): LabelKeyObject[] => {
  return columns
    .filter((column) => 'accessorKey' in column && column.accessorKey)
    .map((column) => ({
      label: typeof column.header === 'string' ? column.header : '#',
      key: ('accessorKey' in column ? column.accessorKey : '') as string
    }));
};


