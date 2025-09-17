// forwarderColumns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { ActionButtons } from 'common/ActionButton';
import { factoryChip } from 'common/StatusChips';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import { MouseEvent } from 'react';
import { TForwarder } from 'types/forwarder.types';

// ==============================|| FORWARDER STATUS CONSTANTS ||============================== //
const FORWARDER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const;

const FORWARDER_STATUS_CONFIG = {
  [FORWARDER_STATUS.INACTIVE]: { color: 'error' as const, label: 'Không hoạt động' },
  [FORWARDER_STATUS.ACTIVE]: { color: 'success' as const, label: 'Đang hoạt động' }
};
const StatusChip = factoryChip(FORWARDER_STATUS_CONFIG);
// ==============================|| REGION CONSTANTS ||============================== //
const REGION_LABELS = {
  NORTH: 'Bắc',
  CENTRAL: 'Trung',
  SOUTH: 'Nam'
};
export const getForwarderColumns = (
  handleForwarderAction: (action: 'view' | 'edit', forwarderId: number) => void,
  handleDeleteForwarder: (forwarderId: number) => void,
  handleActivateForwarder: (forwarderId: number) => void
): ColumnDef<TForwarder>[] => [
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
    header: 'Tên tiếng Việt',
    accessorKey: 'forwarderNameVn',
    cell: (cell) => {
      const forwarderNameVn = cell.getValue() as string;
      if (!forwarderNameVn) return '-';
      // Truncate long names with tooltip
      if (forwarderNameVn.length > 40) {
        return <span title={forwarderNameVn}>{forwarderNameVn.substring(0, 40)}...</span>;
      }
      return forwarderNameVn;
    }
  },
  {
    header: 'Tên tiếng Anh',
    accessorKey: 'forwarderNameEn',
    cell: (cell) => {
      const forwarderNameEn = cell.getValue() as string;
      if (!forwarderNameEn) return '-';
      // Truncate long names with tooltip
      if (forwarderNameEn.length > 40) {
        return <span title={forwarderNameEn}>{forwarderNameEn.substring(0, 40)}...</span>;
      }
      return forwarderNameEn;
    }
  },
  // {
  //   header: 'Mã số thuế',
  //   accessorKey: 'taxCode',
  //   cell: (cell) => {
  //     const taxCode = cell.getValue() as string;
  //     if (!taxCode) return '-';
  //     return taxCode;
  //   }
  // },
  // {
  //   header: 'Địa chỉ',
  //   accessorKey: 'address',
  //   cell: (cell) => {
  //     const address = cell.getValue() as string;
  //     if (!address) return '-';
  //     // Truncate long addresses with tooltip
  //     if (address.length > 50) {
  //       return <span title={address}>{address.substring(0, 50)}...</span>;
  //     }
  //     return address;
  //   }
  // },
  // {
  //   header: 'Miền',
  //   accessorKey: 'region',
  //   cell: (cell) => {
  //     const region = cell.getValue() as string;
  //     const label = REGION_LABELS[region as keyof typeof REGION_LABELS] || region;
  //     return label;
  //   }
  // },
  // {
  //   header: 'Tên vận tải',
  //   accessorKey: 'transportName'
  // },
  // {
  //   header: 'Số tài khoản',
  //   accessorKey: 'bankAccount'
  // },
  // {
  //   header: 'Tên tài khoản',
  //   accessorKey: 'fwBankName'
  // },
  // {
  //   header: 'Mô tả',
  //   accessorKey: 'description'
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
      const forwarderId = Number(row.original.id);
      const forwarder = row.original;
      const isInactive = forwarder.status === 0;
      return (
        <ActionButtons
          onView={() => handleForwarderAction('view', forwarderId)}
          onEdit={() => handleForwarderAction('edit', forwarderId)}
          onDelete={
            !isInactive
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleDeleteForwarder(forwarderId);
                }
              : undefined
          }
          onActivate={
            isInactive
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleActivateForwarder(forwarderId);
                }
              : undefined
          }
          permissionsOnAction={{
            view: 'M_FORWARDER_VIEW',
            edit: 'M_FORWARDER_UPDATE',
            delete: 'M_FORWARDER_DELETE',
            activate: 'M_FORWARDER_UPDATE'
          }}
        />
      );
    }
  }
];
