// customerColumns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { ActionButtons } from 'common/ActionButton';
import { factoryChip } from 'common/StatusChips';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import { MouseEvent } from 'react';
import { Customer } from 'types/customer';

// ==============================|| CUSTOMER STATUS CONSTANTS ||============================== //
const CUSTOMER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const;

const CUSTOMER_STATUS_CONFIG = {
  [CUSTOMER_STATUS.INACTIVE]: { color: 'error' as const, label: 'Không hoạt động' },
  [CUSTOMER_STATUS.ACTIVE]: { color: 'success' as const, label: 'Đang hoạt động' }
};
const StatusChip = factoryChip(CUSTOMER_STATUS_CONFIG);

export const getCustomerColumns = (
  handleCustomerAction: (action: 'view' | 'edit', customerId: number) => void,
  handleDeleteCustomer: (customerId: number) => void,
  handleActivateCustomer: (customerId: number) => void
): ColumnDef<Customer>[] => [
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
    header: 'Đại diện',
    accessorKey: 'represented'
  },
  {
    header: 'Số điện thoại',
    accessorKey: 'phone'
  },
  {
    header: 'Email',
    accessorKey: 'email'
  },
  {
    header: 'Địa chỉ',
    accessorKey: 'address',
    cell: (cell) => {
      const address = cell.getValue() as string;
      if (!address) return '-';
      // Truncate long addresses with tooltip
      if (address.length > 30) {
        return <span title={address}>{address.substring(0, 30)}...</span>;
      }
      return address;
    }
  },
  {
    header: 'Mã số thuế',
    accessorKey: 'taxCode'
  },
  {
    header: 'Số fax',
    accessorKey: 'fax',
    cell: (cell) => {
      const fax = cell.getValue() as string;
      if (!fax) return '-';
      return fax;
    }
  },
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
      const customerId = Number(row.original.id);
      const customer = row.original;
      const isInactive = customer.status === 0;
      return (
        <ActionButtons
          onView={() => handleCustomerAction('view', customerId)}
          onEdit={() => handleCustomerAction('edit', customerId)}
          onDelete={
            !isInactive
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleDeleteCustomer(customerId);
                }
              : undefined
          }
          onActivate={
            isInactive
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleActivateCustomer(customerId);
                }
              : undefined
          }
          permissionsOnAction={{
            view: 'M_CUSTOMER_VIEW',
            edit: 'M_CUSTOMER_UPDATE',
            delete: 'M_CUSTOMER_DELETE',
            activate: 'M_CUSTOMER_UPDATE'
          }}
        />
      );
    }
  }
];
