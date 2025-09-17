import { ColumnDef } from '@tanstack/react-table';
import { ActionButtons } from 'common/ActionButton';
import { factoryChip } from 'common/StatusChips';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import { MouseEvent } from 'react';
import { Config } from 'types/config';

// ==============================|| CONFIG STATUS CONSTANTS ||============================== //
const CONFIG_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const;

const CONFIG_STATUS_CONFIG = {
  [CONFIG_STATUS.INACTIVE]: { color: 'error' as const, label: 'Không hoạt động' },
  [CONFIG_STATUS.ACTIVE]: { color: 'success' as const, label: 'Hoạt động' }
};
const StatusChip = factoryChip(CONFIG_STATUS_CONFIG);

export const getConfigColumns = (
  handleConfigAction: (action: 'create' | 'view' | 'edit' | 'detail', configId?: number) => void,
  handleDeactivateConfig: (configId: number) => void,
  handleActivateConfig: (configId: number) => void
): ColumnDef<Config>[] => [
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
    header: 'MÃ CẤU HÌNH',
    accessorKey: 'code'
  },
  {
    header: 'TÊN CẤU HÌNH',
    accessorKey: 'name'
  },
  {
    header: 'MÔ TẢ',
    accessorKey: 'description'
  },
  {
    header: 'LOẠI MÃ',
    accessorKey: 'codeType'
  },
  {
    header: 'Trạng thái',
    accessorKey: 'status',
    cell: (cell) => {
      const status = cell.getValue() as number;
      return <StatusChip status={status} />;
    },
    meta: { className: 'cell-center' }
  },
  {
    header: 'Hành động',
    meta: { className: 'cell-center' },
    enableSorting: false,
    cell: ({ row }) => {
      const configId = Number(row.original.id);
      const config = row.original;
      const isInactive = config.status === 0;
      return (
        <ActionButtons
          onView={() => handleConfigAction('view', configId)}
          onEdit={() => handleConfigAction('edit', configId)}
          onDelete={
            !isInactive
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleDeactivateConfig(configId);
                }
              : undefined
          }
          onActivate={
            isInactive
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleActivateConfig(configId);
                }
              : undefined
          }
          // TODO: update permissions
          permissionsOnAction={{

          }}
        />
      );
    }
  }
];
