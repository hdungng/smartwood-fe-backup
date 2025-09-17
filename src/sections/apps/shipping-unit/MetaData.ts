import { ColumnDef } from '@tanstack/react-table';
import { TShippingUnit } from 'types/shipping-unit';

// ==============================|| SHIPPING UNIT METADATA ||============================== //

// Filter field configurations
export const filterFields = [
  {
    key: 'code',
    label: 'Mã đơn vị vận chuyển',
    type: 'text' as const,
    placeholder: 'Nhập mã đơn vị vận chuyển...'
  },
  {
    key: 'name',
    label: 'Tên đơn vị vận chuyển',
    type: 'text' as const,
    placeholder: 'Nhập tên đơn vị vận chuyển...'
  },
  {
    key: 'fullName',
    label: 'Tên đầy đủ',
    type: 'text' as const,
    placeholder: 'Nhập tên đầy đủ...'
  },
  {
    key: 'serviceType',
    label: 'Loại dịch vụ',
    type: 'select' as const,
    placeholder: 'Chọn loại dịch vụ...',
    options: [
      { value: 'DOMESTIC', label: 'Trong nước' },
      { value: 'INTERNATIONAL', label: 'Quốc tế' },
      { value: 'BOTH', label: 'Tất cả' }
    ]
  },
  {
    key: 'isPreferred',
    label: 'Đơn vị ưu tiên',
    type: 'select' as const,
    placeholder: 'Chọn trạng thái ưu tiên...',
    options: [
      { value: '1', label: 'Ưu tiên' },
      { value: '0', label: 'Không ưu tiên' }
    ]
  },
  {
    key: 'rating',
    label: 'Đánh giá',
    type: 'select' as const,
    placeholder: 'Chọn đánh giá...',
    options: [
      { value: '5', label: '5 sao' },
      { value: '4', label: '4 sao' },
      { value: '3', label: '3 sao' },
      { value: '2', label: '2 sao' },
      { value: '1', label: '1 sao' }
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

// Service type options for forms
export const serviceTypeOptions = [
  { value: 'DOMESTIC', label: 'Trong nước' },
  { value: 'INTERNATIONAL', label: 'Quốc tế' },
  { value: 'BOTH', label: 'Tất cả' }
];

// Rating options for forms
export const ratingOptions = [
  { value: 1, label: '1 sao' },
  { value: 2, label: '2 sao' },
  { value: 3, label: '3 sao' },
  { value: 4, label: '4 sao' },
  { value: 5, label: '5 sao' }
];

// Responsive styles
export const responsiveStyles = {
  container: {
    spacing: 2,
    alignItems: { xs: 'stretch', sm: 'center' },
    justifyContent: 'space-between',
    p: 2.5,
    pb: 0
  },
  actionStack: {
    spacing: 1,
    alignItems: 'center',
    minWidth: { xs: '100%', sm: 'auto' }
  },
  tableCell: {
    fontSize: { xs: '0.75rem', sm: '0.875rem' },
    padding: { xs: '8px 4px', sm: '16px' },
    '&:first-of-type': {
      paddingLeft: { xs: '8px', sm: '16px' }
    },
    '&:last-of-type': {
      paddingRight: { xs: '8px', sm: '16px' }
    }
  }
};

// Fuzzy filter function
export const fuzzyFilter = (row: any, columnId: string, value: string, addMeta: any) => {
  const itemRank = JSON.stringify(row.getValue(columnId)).toLowerCase().includes(value.toLowerCase());

  addMeta({ itemRank });

  return itemRank;
};

// CSV headers builder
export const buildCsvHeaders = (columns: ColumnDef<TShippingUnit>[]) => {
  return columns
    .filter((column) => 'accessorKey' in column && column.accessorKey)
    .map((column) => ({
      label: typeof column.header === 'string' ? column.header : '#',
      key: ('accessorKey' in column ? column.accessorKey : '') as string
    }));
};
