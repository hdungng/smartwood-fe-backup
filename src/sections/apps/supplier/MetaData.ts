import { rankItem } from '@tanstack/match-sorter-utils';
import { FilterFn } from '@tanstack/react-table';

import { ColumnDef } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';
import { TSupplier } from 'types/supplier';
import { supplierTypes } from 'constants/banks';
import { useIntl } from 'react-intl';

// ==============================|| CONSTANTS ||============================== //
export const INITIAL_FILTER_VALUES = {
  code: '',
  name: '',
  email: '',
  phone: '',
  supplierType: '',
  rating: '',
  status: ''
};

export const getFilterFields = () => {
  const intl = useIntl();

  return [
    {
      key: 'code',
      label: intl.formatMessage({ id: 'supplier_filter_code_label' }),
      type: 'text' as const,
      placeholder: intl.formatMessage({ id: 'supplier_filter_code_placeholder' })
    },
    {
      key: 'name',
      label: intl.formatMessage({ id: 'supplier_filter_name_label' }),
      type: 'text' as const,
      placeholder: intl.formatMessage({ id: 'supplier_filter_name_placeholder' })
    },
    {
      key: 'email',
      label: intl.formatMessage({ id: 'supplier_filter_email_label' }),
      type: 'text' as const,
      placeholder: intl.formatMessage({ id: 'supplier_filter_email_placeholder' })
    },
    {
      key: 'phone',
      label: intl.formatMessage({ id: 'supplier_filter_phone_label' }),
      type: 'text' as const,
      placeholder: intl.formatMessage({ id: 'supplier_filter_phone_placeholder' })
    },
    {
      key: 'supplierType',
      label: intl.formatMessage({ id: 'supplier_filter_type_label' }),
      type: 'select' as const,
      options: [
        { label: intl.formatMessage({ id: 'supplier_filter_all' }), value: '' },
        ...supplierTypes.map((type) => ({ label: type.name, value: type.code }))
      ]
    },
    {
      key: 'rating',
      label: intl.formatMessage({ id: 'supplier_filter_rating_label' }),
      type: 'select' as const,
      options: [
        { label: intl.formatMessage({ id: 'supplier_filter_all' }), value: '' },
        { label: intl.formatMessage({ id: 'supplier_filter_rating_1' }), value: '1' },
        { label: intl.formatMessage({ id: 'supplier_filter_rating_2' }), value: '2' },
        { label: intl.formatMessage({ id: 'supplier_filter_rating_3' }), value: '3' },
        { label: intl.formatMessage({ id: 'supplier_filter_rating_4' }), value: '4' },
        { label: intl.formatMessage({ id: 'supplier_filter_rating_5' }), value: '5' }
      ]
    }
  ];
};

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
export const fuzzyFilter: FilterFn<TSupplier> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

export const buildCsvHeaders = (columns: ColumnDef<TSupplier>[]): LabelKeyObject[] => {
  return columns
    .filter((column) => 'accessorKey' in column && column.accessorKey)
    .map((column) => ({
      label: typeof column.header === 'string' ? column.header : '#',
      key: ('accessorKey' in column ? column.accessorKey : '') as string
    }));
};
