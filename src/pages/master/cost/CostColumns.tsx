// CostColumns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { ActionButtons } from 'common/ActionButton';
import { factoryChip } from 'common/StatusChips';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import { MouseEvent } from 'react';
import { TCost } from 'types/cost';
import { dateHelper, formatCurrentMoney, getFormatDateMMDD } from 'utils';
import { Chip } from '@mui/material';

const COST_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const;

const COST_STATUS_CONFIG = {
  [COST_STATUS.INACTIVE]: { color: 'error' as const, label: 'Không hoạt động' },
  [COST_STATUS.ACTIVE]: { color: 'success' as const, label: 'Hoạt động' }
};
const StatusChip = factoryChip(COST_STATUS_CONFIG);

export const getCostColumns = (
  handleAction: (action: 'view' | 'edit', id: number) => void,
  handleDelete: (id: number) => void
): ColumnDef<TCost>[] => [
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
  { header: '#', accessorKey: 'id', meta: { className: 'cell-center' } },
  { header: 'Item Code', accessorKey: 'itemCode' },
  { header: 'Name', accessorKey: 'name' },
  {
    header: 'Type',
    accessorKey: 'costType',
    cell: ({ row }) => <Chip label={row.original.costType} variant="outlined" size="small" color="info" />
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: ({ row }) =>
      row.original.currency === '%'
        ? `${(row.original.amount || 0)}%`
        : formatCurrentMoney(row.original.amount, row.original.currency),
    meta: { className: 'cell-right' }
  },
  {
    header: 'Currency',
    accessorKey: 'currency',
    cell: ({ row }) => <Chip label={row.original.currency} variant="outlined" size="small" color="secondary" />
  },
  { header: 'Effective From', accessorKey: 'effectiveFrom', cell: ({ row }) => dateHelper.formatDate(row.original.effectiveFrom) },
  { header: 'Effective To', accessorKey: 'effectiveTo', cell: ({ row }) => dateHelper.formatDate(row.original.effectiveTo) },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <StatusChip status={row.original.status} />
  },
  {
    header: 'Actions',
    meta: { className: 'cell-center' },
    enableSorting: false,
    cell: ({ row }) => {
      const id = Number(row.original.id);
      const isInactive = row.original.status === 0;
      return (
        <ActionButtons
          onView={() => handleAction('view', id)}
          onEdit={() => handleAction('edit', id)}
          onDelete={!isInactive ? (e: MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleDelete(id); } : undefined}
          permissionsOnAction={{
            'view': 'M_LOGISTICS_COST_VIEW',
            'edit': 'M_LOGISTICS_COST_UPDATE',
            'delete': 'M_LOGISTICS_COST_DELETE'
          }}
        />
      );
    }
  }
];


