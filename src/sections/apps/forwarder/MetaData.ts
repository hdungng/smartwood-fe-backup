import { rankItem } from '@tanstack/match-sorter-utils';
import { FilterFn } from '@tanstack/react-table';

import { ColumnDef } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';
import { TForwarder } from 'types/forwarder.types';

// ==============================|| CONSTANTS ||============================== //
export const INITIAL_FILTER_VALUES = {
  code: '',
  name: '',
  forwarderNameVn: '',
  forwarderNameEn: '',
  taxCode: '',
  address: '',
  status: ''
};

export const filterFields = [
  { key: 'code', label: 'Mã forwarder', type: 'text' as const, placeholder: 'Tìm kiếm mã...' },
  // { key: 'name', label: 'Tên forwarder', type: 'text' as const, placeholder: 'Tìm kiếm tên...' },
  { key: 'forwarderNameVn', label: 'Tên tiếng Việt', type: 'text' as const, placeholder: 'Tìm kiếm tên tiếng Việt...' },
  { key: 'forwarderNameEn', label: 'Tên tiếng Anh', type: 'text' as const, placeholder: 'Tìm kiếm tên tiếng Anh...' },
  { key: 'taxCode', label: 'Mã số thuế', type: 'text' as const, placeholder: 'Tìm kiếm mã số thuế...' },
  { key: 'address', label: 'Địa chỉ', type: 'text' as const, placeholder: 'Tìm kiếm địa chỉ...' },
  // {
  //   key: 'status',
  //   label: 'Trạng thái',
  //   type: 'select' as const,
  //   options: [
  //     { value: '', label: 'Tất cả' },
  //     { value: '1', label: 'Hoạt động' },
  //     { value: '0', label: 'Không hoạt động' }
  //   ]
  // }
];

// ==============================|| FUZZY FILTER ||============================== //
export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

// ==============================|| RESPONSIVE STYLES ||============================== //
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

// ==============================|| CSV HEADERS ||============================== //
export const buildCsvHeaders = (): LabelKeyObject[] => [
  { label: 'ID', key: 'id' },
  { label: 'Mã', key: 'code' },
  { label: 'Tên', key: 'name' },
  { label: 'Tên tiếng Việt', key: 'forwarderNameVn' },
  { label: 'Tên tiếng Anh', key: 'forwarderNameEn' },
  { label: 'Mã số thuế', key: 'taxCode' },
  { label: 'Địa chỉ', key: 'address' },
  { label: 'Số điện thoại', key: 'phone' },
  { label: 'Email', key: 'email' },
  { label: 'Website', key: 'website' },
  { label: 'Người liên hệ', key: 'contactPerson' },
  { label: 'SĐT liên hệ', key: 'contactPhone' },
  { label: 'Email liên hệ', key: 'contactEmail' },
  { label: 'Loại forwarder', key: 'forwarderType' },
  { label: 'Đánh giá', key: 'rating' },
  { label: 'Khu vực', key: 'region' },
  { label: 'Tỉnh/thành phố', key: 'province' },
  { label: 'Quận/huyện', key: 'district' },
  { label: 'Trạng thái', key: 'status' },
  { label: 'Ngày tạo', key: 'createdAt' },
  { label: 'Ngày cập nhật', key: 'lastUpdatedAt' }
];

// ==============================|| TABLE COLUMNS ||============================== //
export const getForwarderColumns = (): ColumnDef<TForwarder>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    meta: { className: 'cell-center' }
  },
  {
    accessorKey: 'code',
    header: 'Mã',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'name',
    header: 'Tên',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'forwarderNameVn',
    header: 'Tên tiếng Việt',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'forwarderNameEn',
    header: 'Tên tiếng Anh',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'taxCode',
    header: 'Mã số thuế',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'address',
    header: 'Địa chỉ',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'phone',
    header: 'Số điện thoại',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'email',
    header: 'Email',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'website',
    header: 'Website',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'contactPerson',
    header: 'Người liên hệ',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'contactPhone',
    header: 'SĐT liên hệ',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'contactEmail',
    header: 'Email liên hệ',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'forwarderType',
    header: 'Loại forwarder',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'rating',
    header: 'Đánh giá',
    meta: { className: 'cell-center' }
  },
  {
    accessorKey: 'region',
    header: 'Khu vực',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'province',
    header: 'Tỉnh/thành phố',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'district',
    header: 'Quận/huyện',
    meta: { className: 'cell-left' }
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    meta: { className: 'cell-center' }
  },
  {
    accessorKey: 'createdAt',
    header: 'Ngày tạo',
    meta: { className: 'cell-center' }
  },
  {
    accessorKey: 'lastUpdatedAt',
    header: 'Ngày cập nhật',
    meta: { className: 'cell-center' }
  }
];
