import { rankItem } from '@tanstack/match-sorter-utils';
import { FilterFn } from '@tanstack/react-table';

import { ColumnDef } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';
import { TGood } from 'types/good';

// ==============================|| CONSTANTS ||============================== //
export const INITIAL_FILTER_VALUES = {
  name: '',
  code: '',
  sku: '',
  category: '',
  brand: '',
  unitOfMeasure: '',
  originCountry: '',
  status: ''
};

export const filterFields = [
  { key: 'name', label: 'Name', type: 'text' as const, placeholder: 'Search name...' },
  { key: 'code', label: 'Code', type: 'text' as const, placeholder: 'Search code...' },
  { key: 'sku', label: 'SKU', type: 'text' as const, placeholder: 'Search SKU...' },
  {
    key: 'category',
    label: 'Category',
    type: 'select' as const,
    options: [
      { label: 'All', value: '' },
      { label: 'Sawdust', value: 'Sawdust' },
      { label: 'Wood Pellets', value: 'Wood Pellets' },
      { label: 'Wood Chips', value: 'Wood Chips' }
    ]
  },
  { key: 'brand', label: 'Brand', type: 'text' as const, placeholder: 'Search brand...' },
  {
    key: 'unitOfMeasure',
    label: 'Unit',
    type: 'select' as const,
    options: [
      { label: 'All', value: '' },
      { label: 'Ton', value: 'TON' },
      { label: 'Kilogram', value: 'KG' },
      { label: 'Cubic Meter', value: 'M3' },
      { label: 'Piece', value: 'PIECE' }
    ]
  },
  { key: 'originCountry', label: 'Origin Country', type: 'text' as const, placeholder: 'Search origin country...' }
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
export const fuzzyFilter: FilterFn<TGood> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

export const buildCsvHeaders = (columns: ColumnDef<TGood>[]): LabelKeyObject[] => {
  return columns
    .filter((column) => 'accessorKey' in column && column.accessorKey)
    .map((column) => ({
      label: typeof column.header === 'string' ? column.header : '#',
      key: ('accessorKey' in column ? column.accessorKey : '') as string
    }));
};
