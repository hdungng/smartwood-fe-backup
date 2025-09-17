import { useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

// third-party
import { ColumnDef } from '@tanstack/react-table';

// project imports
import { ActionButtons } from 'common/ActionButton';
import { IndeterminateCheckbox } from 'components/third-party/react-table';

// types
import { TPaymentTerm } from 'types/payment-term';

// ==============================|| COLUMNS DEFINITION ||============================== //

interface PaymentTermColumnsProps {
  onNavigate: (path: string) => void;
  onDeactivate?: (id: number, name: string) => void;
  onActivate?: (id: number, name: string) => void;
}

// Status configuration
const statusConfig = {
  1: { color: 'success' as const, label: 'Hoạt động' },
  0: { color: 'error' as const, label: 'Không hoạt động' }
};

export const usePaymentTermColumns = ({ onNavigate, onDeactivate, onActivate }: PaymentTermColumnsProps) => {
  return useMemo<ColumnDef<TPaymentTerm>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      {
        header: 'Mã điều kiện thanh toán',
        accessorKey: 'code',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Stack spacing={0}>
              <Box
                component="span"
                sx={{
                  fontWeight: 500,
                  color: 'text.primary',
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' }
                }}
                onClick={() => onNavigate(`/master/payment-term/view/${row.original.id}`)}
              >
                {getValue() as string}
              </Box>
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Tên điều kiện thanh toán',
        accessorKey: 'name',
        cell: ({ getValue }) => (
          <Box component="span" sx={{ fontWeight: 500 }}>
            {getValue() as string}
          </Box>
        )
      },
      {
        header: 'Mô tả',
        accessorKey: 'description',
        cell: ({ getValue }) => {
          const description = getValue() as string;
          const truncatedDescription = description?.length > 50 ? `${description.substring(0, 50)}...` : description;

          return (
            <Tooltip title={description} placement="top">
              <Box
                component="span"
                sx={{
                  display: 'block',
                  maxWidth: { xs: '120px', sm: '200px' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {truncatedDescription}
              </Box>
            </Tooltip>
          );
        }
      },
      {
        header: 'Số ngày thanh toán',
        accessorKey: 'paymentDays',
        cell: ({ getValue }) => <Box component="span">{getValue() as number} ngày</Box>
      },
      // {
      //   header: 'Phương thức thanh toán',
      //   accessorKey: 'paymentMethod',
      //   cell: ({ getValue }) => {
      //     const method = getValue() as string;
      //     const methodLabel =
      //       {
      //         CASH: 'Tiền mặt',
      //         CREDIT: 'Tín dụng',
      //         BANK_TRANSFER: 'Chuyển khoản',
      //         CHECK: 'Séc'
      //       }[method] || method;

      //     return <Box component="span">{methodLabel}</Box>;
      //   }
      // },
      {
        header: 'Trạng thái',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue() as number;
          const config = statusConfig[status as keyof typeof statusConfig];

          return <Chip color={config?.color || 'default'} label={config?.label || 'Không xác định'} size="small" variant="light" />;
        }
      },
      {
        header: 'Thao tác',
        id: 'actions',
        cell: ({ row }) => {
          const isActive = row.original.status === 1;

          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <ActionButtons
                onView={() => onNavigate(`/master/payment-term/view/${row.original.id}`)}
                onEdit={() => onNavigate(`/master/payment-term/edit/${row.original.id}`)}
                {...(isActive
                  ? { onDelete: () => onDeactivate?.(row.original.id, row.original.name) }
                  : { onActivate: () => onActivate?.(row.original.id, row.original.name) })}
                permissionsOnAction={{
                  edit: 'M_PAYMENT_TERM_UPDATE',
                  view: 'M_PAYMENT_TERM_VIEW',
                  delete: 'M_PAYMENT_TERM_DELETE',
                  activate: 'M_PAYMENT_TERM_UPDATE'
                }}
              />
            </Stack>
          );
        }
      }
    ],
    [onNavigate, onDeactivate, onActivate]
  );
};
