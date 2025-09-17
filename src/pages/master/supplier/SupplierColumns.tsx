// supplierColumns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { ActionButtons } from 'common/ActionButton';
import { factoryChip } from 'common/StatusChips';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import { MouseEvent } from 'react';
import { Supplier } from 'types/supplier';
import { supplierTypes } from 'constants/banks';

const SUPPLIER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const;

const SUPPLIER_STATUS_CONFIG = {
  [SUPPLIER_STATUS.INACTIVE]: { color: 'error' as const, label: 'Không hoạt động' },
  [SUPPLIER_STATUS.ACTIVE]: { color: 'success' as const, label: 'Đang hoạt động' }
};
const StatusChip = factoryChip(SUPPLIER_STATUS_CONFIG);

const getSupplierTypeName = (code: string): string => {
  const supplierType = supplierTypes.find((type) => type.code === code);
  return supplierType ? supplierType.name : code;
};

export const getSupplierColumns = (
  handleSupplierAction: (action: 'view' | 'edit', supplierId: number) => void,
  handleDeleteSupplier: (supplierId: number) => void,
  handleActivateSupplier: (supplierId: number) => void
): ColumnDef<Supplier>[] => {
  return [
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
      header: 'Mã',
      accessorKey: 'code'
    },
    {
      header: 'Tên',
      accessorKey: 'name'
    },
    {
      header: 'Loại',
      accessorKey: 'supplierType',
      cell: (cell) => {
        const type = cell.getValue() as string;
        return getSupplierTypeName(type);
      }
    },
    {
      header: 'Điểm đánh giá',
      accessorKey: 'rating',
      cell: (cell) => {
        const rating = cell.getValue() as number;
        return `${rating}/5`
      },
      meta: { className: 'cell-center' }
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
      header: 'Hành động',
      meta: { className: 'cell-center' },
      enableSorting: false,
      cell: ({ row }) => {
        const supplierId = Number(row.original.id);
        const supplier = row.original;
        const isInactive = supplier.status === 0;
        return (
          <ActionButtons
            onView={() => handleSupplierAction('view', supplierId)}
            onEdit={() => handleSupplierAction('edit', supplierId)}
            onDelete={
              !isInactive
                ? (e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleDeleteSupplier(supplierId);
                  }
                : undefined
            }
            onActivate={
              isInactive
                ? (e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleActivateSupplier(supplierId);
                  }
                : undefined
            }
            permissionsOnAction={{
              view: 'M_SUPPLIER_VIEW',
              edit: 'M_SUPPLIER_UPDATE',
              delete: 'M_SUPPLIER_DELETE',
              activate: 'M_SUPPLIER_UPDATE'
            }}
          />
        );
      }
    }
  ];
};
