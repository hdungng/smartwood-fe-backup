import { ColumnDef } from '@tanstack/react-table';
import { ActionButtons } from 'common/ActionButton';
import { factoryChip } from 'common/StatusChips';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import { MouseEvent } from 'react';
import { TShippingUnit } from 'types/shipping-unit';
import { Chip } from '@mui/material';

// ==============================|| SHIPPING UNIT STATUS CONSTANTS ||============================== //
const SHIPPING_UNIT_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const;

const SHIPPING_UNIT_STATUS_CONFIG = {
  [SHIPPING_UNIT_STATUS.INACTIVE]: { color: 'error' as const, label: 'Inactive' },
  [SHIPPING_UNIT_STATUS.ACTIVE]: { color: 'success' as const, label: 'Active' }
};
const StatusChip = factoryChip(SHIPPING_UNIT_STATUS_CONFIG);

// ==============================|| SERVICE TYPE CONSTANTS ||============================== //
const SERVICE_TYPE_LABELS = {
  DOMESTIC: 'Trong nước',
  INTERNATIONAL: 'Quốc tế',
  BOTH: 'Tất cả'
};

const SERVICE_TYPE_COLORS = {
  DOMESTIC: 'primary' as const,
  INTERNATIONAL: 'secondary' as const,
  BOTH: 'info' as const
};

// ==============================|| PREFERRED STATUS CONSTANTS ||============================== //
const PREFERRED_CONFIG = {
  0: { color: 'default' as const, label: 'Không ưu tiên' },
  1: { color: 'warning' as const, label: 'Ưu tiên' }
};
const PreferredChip = factoryChip(PREFERRED_CONFIG);
// ==============================|| REGION CONSTANTS ||============================== //
const REGION_LABELS = {
  NORTH: 'Bắc',
  CENTRAL: 'Trung',
  SOUTH: 'Nam'
};
export const getShippingUnitColumns = (
  handleShippingUnitAction: (action: 'view' | 'edit', shippingUnitId: number) => void,
  handleDeleteShippingUnit: (shippingUnitId: number) => void,
  handleActivateShippingUnit: (shippingUnitId: number) => void
): ColumnDef<TShippingUnit>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <IndeterminateCheckbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <IndeterminateCheckbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    )
  },
  {
    header: '#',
    accessorKey: 'id',
    meta: { className: 'cell-center' }
  },
  {
    header: 'Mã',
    accessorKey: 'code'
  },
  {
    header: 'Tên',
    accessorKey: 'name'
  },
  {
    header: 'Miền',
    accessorKey: 'region',
    cell: (cell) => {
      const region = cell.getValue() as string;
      const label = REGION_LABELS[region as keyof typeof REGION_LABELS] || region;
      return label;
    }
  },
  {
    header: 'Tên công ty',
    accessorKey: 'companyName'
  },
  // {
  //   header: 'Mã số thuế',
  //   accessorKey: 'taxCode'
  // },
  // {
  //   header: 'Địa chỉ',
  //   accessorKey: 'address'
  // },
  // {
  //   header: 'Số tài khoản',
  //   accessorKey: 'bankAccount'
  // },
  // {
  //   header: 'Ngân hàng',
  //   accessorKey: 'bankName'
  // },
  // {
  //   header: 'Tên đầy đủ',
  //   accessorKey: 'fullName'
  // },
  // {
  //   header: 'Điện thoại',
  //   accessorKey: 'phone'
  // },
  // {
  //   header: 'Email',
  //   accessorKey: 'email'
  // },
  // {
  //   header: 'Loại dịch vụ',
  //   accessorKey: 'serviceType',
  //   cell: (cell) => {
  //     const serviceType = cell.getValue() as string;
  //     const label = SERVICE_TYPE_LABELS[serviceType as keyof typeof SERVICE_TYPE_LABELS] || serviceType;
  //     const color = SERVICE_TYPE_COLORS[serviceType as keyof typeof SERVICE_TYPE_COLORS] || 'default';
  //     return <Chip label={label} color={color} variant="light" size="small" />;
  //   },
  //   meta: { className: 'cell-center' }
  // },
  // {
  //   header: 'Giá cơ bản',
  //   accessorKey: 'basePrice',
  //   cell: (cell) => {
  //     const price = cell.getValue() as number;
  //     return new Intl.NumberFormat('vi-VN', {
  //       style: 'currency',
  //       currency: 'VND'
  //     }).format(price);
  //   },
  //   meta: { className: 'cell-right' }
  // },
  // {
  //   header: 'Giá/Kg',
  //   accessorKey: 'pricePerKg',
  //   cell: (cell) => {
  //     const price = cell.getValue() as number;
  //     return new Intl.NumberFormat('vi-VN', {
  //       style: 'currency',
  //       currency: 'VND'
  //     }).format(price);
  //   },
  //   meta: { className: 'cell-right' }
  // },
  // {
  //   header: 'Giá/Km',
  //   accessorKey: 'pricePerKm',
  //   cell: (cell) => {
  //     const price = cell.getValue() as number;
  //     return new Intl.NumberFormat('vi-VN', {
  //       style: 'currency',
  //       currency: 'VND'
  //     }).format(price);
  //   },
  //   meta: { className: 'cell-right' }
  // },
  // {
  //   header: 'Đánh giá',
  //   accessorKey: 'rating',
  //   cell: (cell) => {
  //     const rating = cell.getValue() as number;
  //     return `${rating} ⭐`;
  //   },
  //   meta: { className: 'cell-center' }
  // },
  // {
  //   header: 'Ưu tiên',
  //   accessorKey: 'isPreferred',
  //   cell: (cell) => {
  //     const isPreferred = cell.getValue() as number;
  //     return <PreferredChip status={isPreferred} />;
  //   },
  //   meta: { className: 'cell-center' }
  // },
  {
    header: 'Trạng thái',
    accessorKey: 'status',
    cell: (cell) => {
      const status = cell.getValue() as number;
      return <StatusChip status={status} />;
    }
  },
  {
    header: 'Thao tác',
    meta: { className: 'cell-center' },
    enableSorting: false,
    cell: ({ row }) => {
      const shippingUnitId = Number(row.original.id);
      const shippingUnit = row.original;
      const isInactive = shippingUnit.status === 0;
      return (
        <ActionButtons
          onView={() => handleShippingUnitAction('view', shippingUnitId)}
          onEdit={() => handleShippingUnitAction('edit', shippingUnitId)}
          onDelete={
            !isInactive
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleDeleteShippingUnit(shippingUnitId);
                }
              : undefined
          }
          onActivate={
            isInactive
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleActivateShippingUnit(shippingUnitId);
                }
              : undefined
          }
          permissionsOnAction={{
            view: 'M_SHIPPING_UNIT_VIEW',
            edit: 'M_SHIPPING_UNIT_UPDATE',
            delete: 'M_SHIPPING_UNIT_DELETE',
            activate: 'M_SHIPPING_UNIT_UPDATE'
          }}
        />
      );
    }
  }
];
