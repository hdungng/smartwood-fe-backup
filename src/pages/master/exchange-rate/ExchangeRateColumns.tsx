// ExchangeRateColumns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { ActionButtons } from 'common/ActionButton';
import { factoryChip } from 'common/StatusChips';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import { MouseEvent } from 'react';
import { TExchangeRate } from 'types/exchange-rate';
import { formatCurrentMoney, getFormatDateMMDD } from 'utils';
import { Chip } from '@mui/material';

// ==============================|| EXCHANGE RATE STATUS CONSTANTS ||============================== //
const EXCHANGE_RATE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
} as const;

const EXCHANGE_RATE_STATUS_CONFIG = {
  [EXCHANGE_RATE_STATUS.INACTIVE]: { color: 'error' as const, label: 'Không hoạt động' },
  [EXCHANGE_RATE_STATUS.ACTIVE]: { color: 'success' as const, label: 'Hoạt động' }
};
const StatusChip = factoryChip(EXCHANGE_RATE_STATUS_CONFIG);

// ==============================|| RATE TYPE CONSTANTS ||============================== //
const RATE_TYPE_LABELS = {
  OFFICIAL: 'Chính thức',
  MARKET: 'Thị trường',
  BANK: 'Ngân hàng'
};

const RATE_TYPE_COLORS = {
  OFFICIAL: 'success' as const,
  MARKET: 'warning' as const,
  BANK: 'info' as const
};

export const getExchangeRateColumns = (
  handleExchangeRateAction: (action: 'view' | 'edit', exchangeRateId: number) => void,
  handleDeleteExchangeRate: (exchangeRateId: number) => void,
  handleActivateExchangeRate: (exchangeRateId: number) => void
): ColumnDef<TExchangeRate>[] => [
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
  // {
  //   header: 'Mã tỷ giá',
  //   accessorKey: 'code',
  //   cell: ({ row }) => <Chip label={row.original.code} variant="outlined" size="small" color="primary" />
  // },
  // {
  //   header: 'Tên tỷ giá',
  //   accessorKey: 'name'
  // },
  {
    header: 'Tiền tệ nguồn',
    accessorKey: 'fromCurrency',
    cell: ({ row }) => <Chip label={row.original.fromCurrency} variant="outlined" size="small" color="info" />
  },
  {
    header: 'Tiền tệ đích',
    accessorKey: 'toCurrency',
    cell: ({ row }) => <Chip label={row.original.toCurrency} variant="outlined" size="small" color="secondary" />
  },
  // {
  //   header: 'Tỷ giá',
  //   accessorKey: 'exchangeRate',
  //   cell: ({ row }) => formatCurrentMoney(row.original.exchangeRate, row.original.toCurrency),
  //   meta: { className: 'cell-right' }
  // },
  {
    header: 'Giá mua',
    accessorKey: 'buyRate',
    cell: ({ row }) => formatCurrentMoney(row.original.buyRate, row.original.toCurrency),
    meta: { className: 'cell-right' }
  },
  {
    header: 'Giá bán',
    accessorKey: 'sellRate',
    cell: ({ row }) => formatCurrentMoney(row.original.sellRate, row.original.toCurrency),
    meta: { className: 'cell-right' }
  },
  {
    header: 'Loại tỷ giá',
    accessorKey: 'rateType',
    cell: ({ row }) => {
      const rateType = row.original.rateType;
      const label = RATE_TYPE_LABELS[rateType as keyof typeof RATE_TYPE_LABELS] || rateType;
      const color = RATE_TYPE_COLORS[rateType as keyof typeof RATE_TYPE_COLORS] || 'default';
      return <Chip label={label} variant="filled" size="small" color={color} />;
    }
  },
  // {
  //   header: 'Nguồn',
  //   accessorKey: 'source'
  // },
  {
    header: 'Ngày hiệu lực',
    accessorKey: 'effectiveDate',
    cell: ({ row }) => getFormatDateMMDD(row.original.effectiveDate)
  },
  {
    header: 'Ngày hết hạn',
    accessorKey: 'expiryDate',
    cell: ({ row }) => getFormatDateMMDD(row.original.expiryDate)
  },
  {
    header: 'Trạng thái',
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.original.status;
      return <StatusChip status={status} />;
    }
  },
  {
    header: 'Hành động',
    meta: { className: 'cell-center' },
    enableSorting: false,
    cell: ({ row }) => {
      const exchangeRateId = Number(row.original.id);
      const exchangeRate = row.original;
      const isInactive = exchangeRate.status === 0;
      return (
        <ActionButtons
          onView={() => handleExchangeRateAction('view', exchangeRateId)}
          onEdit={() => handleExchangeRateAction('edit', exchangeRateId)}
          onDelete={
            !isInactive
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleDeleteExchangeRate(exchangeRateId);
                }
              : undefined
          }
          onActivate={
            isInactive
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleActivateExchangeRate(exchangeRateId);
                }
              : undefined
          }
          permissionsOnAction={{

          }}
        />
      );
    }
  }
];
