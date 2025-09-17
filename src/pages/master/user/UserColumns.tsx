// userColumns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { ActionButtons } from 'common/ActionButton';
import { factoryChip } from 'common/StatusChips';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import { MouseEvent } from 'react';
import { User } from 'types/user.type';

const USER_STATUS = {
  PENDING: 2,
  VERIFIED: 1,
  REJECTED: 0
} as const;

const USER_STATUS_CONFIG = {
  [USER_STATUS.REJECTED]: { color: 'error' as const, label: 'Rejected' },
  [USER_STATUS.VERIFIED]: { color: 'success' as const, label: 'Verified' },
  [USER_STATUS.PENDING]: { color: 'warning' as const, label: 'Pending' }
};
const StatusChip = factoryChip(USER_STATUS_CONFIG);

export const getUserColumns = (
  handleUserAction: (action: 'view' | 'edit', userId: number) => void,
  handleDeleteUser: (userId: number) => void
): ColumnDef<User>[] => [
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
    header: 'Name',
    accessorKey: 'name'
  },
  {
    header: 'Email',
    accessorKey: 'email'
  },
  {
    header: 'Username',
    accessorKey: 'username'
  },
  {
    header: 'Language',
    accessorKey: 'language',
    cell: (cell) => {
      const language = cell.getValue() as string;
      const languageMap: Record<string, string> = {
        vi: 'Tiếng Việt',
        en: 'English'
      };
      return languageMap[language] || language || '-';
    }
  },
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
      const userId = Number(row.original.id);
      return (
        <ActionButtons
          onView={() => handleUserAction('view', userId)}
          onEdit={() => handleUserAction('edit', userId)}
          onDelete={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleDeleteUser(userId);
          }}
          permissionsOnAction={{
            view: 'M_USER_VIEW',
            edit: 'M_USER_UPDATE',
            delete: 'M_USER_DELETE'
          }}
        />
      );
    }
  }
];
