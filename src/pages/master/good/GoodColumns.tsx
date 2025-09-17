// goodColumns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { ActionButtons } from 'common/ActionButton';
import { factoryChip } from 'common/StatusChips';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import { MouseEvent } from 'react';
import { Good } from 'types/good';

// ==============================|| GOOD STATUS CONSTANTS ||============================== //
const GOOD_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const;

const GOOD_STATUS_CONFIG = {
  [GOOD_STATUS.INACTIVE]: { color: 'error' as const, label: 'Inactive' },
  [GOOD_STATUS.ACTIVE]: { color: 'success' as const, label: 'Active' }
};
const StatusChip = factoryChip(GOOD_STATUS_CONFIG);

// ==============================|| GOOD CATEGORY CONSTANTS ||============================== //
const GOOD_CATEGORY_CONFIG = {
  Sawdust: { color: 'primary' as const, label: 'Sawdust' },
  'Wood Pellets': { color: 'secondary' as const, label: 'Wood Pellets' },
  'Wood Chips': { color: 'info' as const, label: 'Wood Chips' }
};
const CategoryChip = factoryChip(GOOD_CATEGORY_CONFIG);

// ==============================|| SELLABLE/PURCHASABLE CONSTANTS ||============================== //
const BOOLEAN_CONFIG = {
  0: { color: 'error' as const, label: 'No' },
  1: { color: 'success' as const, label: 'Yes' }
};
const BooleanChip = factoryChip(BOOLEAN_CONFIG);

export const getGoodColumns = (
  handleGoodAction: (action: 'view' | 'edit', goodId: number) => void,
  handleDeleteGood: (goodId: number) => void,
  handleActivateGood: (goodId: number) => void
): ColumnDef<Good>[] => [
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
    header: 'Code',
    accessorKey: 'code'
  },
  {
    header: 'Name',
    accessorKey: 'name'
  },
  // {
  //   header: 'Category',
  //   accessorKey: 'category',
  //   cell: (cell) => {
  //     const category = cell.getValue() as string;
  //     return category;
  //   }
  // },
  // {
  //   header: 'Brand',
  //   accessorKey: 'brand'
  // },
  // {
  //   header: 'SKU',
  //   accessorKey: 'sku'
  // },
  // {
  //   header: 'Unit',
  //   accessorKey: 'unitOfMeasure'
  // },
  // {
  //   header: 'Purchase Price',
  //   accessorKey: 'purchasePrice',
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
  //   header: 'Selling Price',
  //   accessorKey: 'sellingPrice',
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
  //   header: 'Stock Level',
  //   accessorKey: 'minStockLevel',
  //   cell: ({ row }) => {
  //     const min = row.original.minStockLevel;
  //     const max = row.original.maxStockLevel;
  //     return `${min} - ${max}`;
  //   },
  //   meta: { className: 'cell-center' }
  // },
  // {
  //   header: 'Sellable',
  //   accessorKey: 'isSellable',
  //   cell: (cell) => {
  //     const isSellable = cell.getValue() as number;
  //     return <BooleanChip status={isSellable} />;
  //   },
  //   meta: { className: 'cell-center' }
  // },
  // {
  //   header: 'Purchasable',
  //   accessorKey: 'isPurchasable',
  //   cell: (cell) => {
  //     const isPurchasable = cell.getValue() as number;
  //     return <BooleanChip status={isPurchasable} />;
  //   },
  //   meta: { className: 'cell-center' }
  // },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: (cell) => {
      const status = cell.getValue() as number;
      return <StatusChip status={status} />;
    }
  },
  {
    header: 'Actions',
    meta: { className: 'cell-center' },
    enableSorting: false,
    cell: ({ row }) => {
      const goodId = Number(row.original.id);
      const good = row.original;
      const isInactive = good.status === 0;
      return (
        <ActionButtons
          onView={() => handleGoodAction('view', goodId)}
          onEdit={() => handleGoodAction('edit', goodId)}
          onDelete={
            !isInactive
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleDeleteGood(goodId);
                }
              : undefined
          }
          onActivate={
            isInactive
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleActivateGood(goodId);
                }
              : undefined
          }
          permissionsOnAction={{
            view: 'M_GOOD_VIEW',
            edit: 'M_GOOD_UPDATE',
            delete: 'M_GOOD_DELETE',
            activate: 'M_GOOD_UPDATE'
          }}
        />
      );
    }
  }
];
