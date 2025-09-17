// shippingLineColumns.tsx
import { Box, Tooltip } from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { ActionButtons } from 'common/ActionButton';
import { StatusChipCommon } from 'common/StatusChips';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import { Status } from 'constants/status';
import { useIntl } from 'react-intl';
import { ShippingLine } from 'types/shipping-line';


// ==============================|| TruncatedCell ||============================== //

interface TruncatedCellProps {
  value: string | number | null | undefined;
  maxLength?: number;
  width?: string | number;
}

function TruncatedCell({ value, maxLength = 30, width }: TruncatedCellProps) {
  const displayValue = value?.toString() || '---';
  const shouldTruncate = displayValue.length > maxLength;
  const truncatedValue = shouldTruncate ? `${displayValue.substring(0, maxLength)}...` : displayValue;

  return (
    <Box sx={{ width, minWidth: width, maxWidth: width }}>
      {shouldTruncate ? (
        <Tooltip title={displayValue} arrow placement="top">
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'block',
              fontSize: '0.875rem'
            }}
          >
            {truncatedValue}
          </span>
        </Tooltip>
      ) : (
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            fontSize: '0.875rem'
          }}
        >
          {displayValue}
        </span>
      )}
    </Box>
  );
}


// ==============================|| SHIPPING LINE STATUS CONSTANTS ||============================== //

export const getShippingLineColumns = (
  handleShippingLineAction: (action: 'view' | 'edit', shippingLineId: number) => void,
  handleDeleteShippingLine: (shippingLineId: number) => void,
  handleActivateShippingLine: (shippingLineId: number) => void
): ColumnDef<ShippingLine>[] =>{
  const intl = useIntl();
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
      accessorKey: 'code',
      meta: { className: 'cell-left' },
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return <TruncatedCell value={value} maxLength={15} />;
      }
    },
    {
      header: 'Tên Shipping Line',
      accessorKey: 'name',
      meta: { className: 'cell-left' },
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return <TruncatedCell value={value} maxLength={30} />;
      }
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      meta: { className: 'cell-center' },
      cell: ({ getValue }) => {
        const status = getValue<number>() as Status;
        return <StatusChipCommon status={status} intl={intl} />;
      }
    },
    {
      header: 'Hành động',
      meta: { className: 'cell-left' },
      enableSorting: false,
      cell: ({ row }) => {
        const shippingLine = row.original;
  
        return (
          <ActionButtons
            onView={() => handleShippingLineAction('view', shippingLine.id)}
            onEdit={() => handleShippingLineAction('edit', shippingLine.id)}
            onActivate={shippingLine.status === 0 ? () => handleActivateShippingLine(shippingLine.id) : undefined}
            onDelete={shippingLine.status === 1 ? () => handleDeleteShippingLine(shippingLine.id) : undefined}
            permissionsOnAction={{
              view: 'M_SHIPPING_LINE_VIEW',
              edit: 'M_SHIPPING_LINE_UPDATE',
              activate: 'M_SHIPPING_LINE_UPDATE',
              delete: 'M_SHIPPING_LINE_DELETE',
            }}
          />
        );
      }
    }    
  ]
} 

export default getShippingLineColumns;
