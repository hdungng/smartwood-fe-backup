import { ColumnDef } from '@tanstack/react-table';
import { Chip, Tooltip, Typography, Stack, Box } from '@mui/material';
import { IndeterminateCheckbox } from 'components/third-party/react-table';
import { TDeliveryTerm } from 'types/delivery-term';
import { factoryChip, ConfigChip } from 'common/StatusChips';
import { ActionButtons } from 'common/ActionButton';

interface Props {
  onEdit: (deliveryTerm: TDeliveryTerm) => void;
  onView: (deliveryTerm: TDeliveryTerm) => void;
  onActivate: (deliveryTerm: TDeliveryTerm) => void;
  onDeactivate: (deliveryTerm: TDeliveryTerm) => void;
}

// Status configuration for chips
const statusConfig: Record<number, ConfigChip> = {
  0: { color: 'error', label: 'Không hoạt động' },
  1: { color: 'success', label: 'Hoạt động' }
};

const StatusChip = factoryChip(statusConfig);

const DeliveryTermColumns = ({ onEdit, onView, onActivate, onDeactivate }: Props): ColumnDef<TDeliveryTerm>[] => [
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
    header: 'Mã điều kiện',
    accessorKey: 'code',
    cell: ({ getValue }) => (
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {getValue() as string}
      </Typography>
    )
  },
  {
    header: 'Tên điều kiện',
    accessorKey: 'name',
    cell: ({ getValue }) => {
      const name = getValue() as string;
      return (
        <Tooltip title={name} placement="top" arrow>
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 200
            }}
          >
            {name}
          </Typography>
        </Tooltip>
      );
    }
  },
  // {
  //   header: 'Mô tả',
  //   accessorKey: 'description',
  //   cell: ({ getValue }) => {
  //     const description = getValue() as string;
  //     return (
  //       <Tooltip title={description} placement="top" arrow>
  //         <Typography
  //           variant="body2"
  //           color="text.secondary"
  //           sx={{
  //             overflow: 'hidden',
  //             textOverflow: 'ellipsis',
  //             whiteSpace: 'nowrap',
  //             maxWidth: 200
  //           }}
  //         >
  //           {description}
  //         </Typography>
  //       </Tooltip>
  //     );
  //   }
  // },
  // {
  //   header: 'Số ngày giao hàng',
  //   accessorKey: 'deliveryDays',
  //   cell: ({ getValue }) => (
  //     <Box sx={{ textAlign: 'center' }}>
  //       <Chip label={`${getValue() as number} ngày`} color="info" variant="light" size="small" />
  //     </Box>
  //   )
  // },
  // {
  //   header: 'Incoterm',
  //   accessorKey: 'incoterm',
  //   cell: ({ getValue }) => (
  //     <Box sx={{ textAlign: 'center' }}>
  //       <Chip label={getValue() as string} color="primary" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
  //     </Box>
  //   )
  // },
  // {
  //   header: 'Trách nhiệm',
  //   accessorKey: 'responsibility',
  //   cell: ({ getValue }) => {
  //     const responsibility = getValue() as string;
  //     return (
  //       <Box sx={{ textAlign: 'center' }}>
  //         <Chip
  //           label={responsibility === 'SELLER' ? 'Người bán' : 'Người mua'}
  //           color={responsibility === 'SELLER' ? 'success' : 'warning'}
  //           variant="light"
  //           size="small"
  //         />
  //       </Box>
  //     );
  //   }
  // },
  // {
  //   header: 'Địa điểm giao hàng',
  //   accessorKey: 'deliveryLocation',
  //   cell: ({ getValue }) => {
  //     const location = getValue() as string;
  //     const locationMap: Record<string, string> = {
  //       PORT: 'Cảng',
  //       SELLER_LOCATION: 'Địa điểm người bán',
  //       BUYER_LOCATION: 'Địa điểm người mua'
  //     };
  //     return (
  //       <Box sx={{ textAlign: 'center' }}>
  //         <Chip label={locationMap[location] || location} color="secondary" variant="light" size="small" />
  //       </Box>
  //     );
  //   }
  // },
  // {
  //   header: 'Bảo hiểm',
  //   accessorKey: 'insuranceRequired',
  //   cell: ({ getValue }) => {
  //     const required = getValue() as number;
  //     return (
  //       <Box sx={{ textAlign: 'center' }}>
  //         <Chip label={required === 1 ? 'Yêu cầu' : 'Không'} color={required === 1 ? 'success' : 'default'} variant="light" size="small" />
  //       </Box>
  //     );
  //   }
  // },
  // {
  //   header: 'Đóng gói',
  //   accessorKey: 'packagingRequired',
  //   cell: ({ getValue }) => {
  //     const required = getValue() as number;
  //     return (
  //       <Box sx={{ textAlign: 'center' }}>
  //         <Chip label={required === 1 ? 'Yêu cầu' : 'Không'} color={required === 1 ? 'success' : 'default'} variant="light" size="small" />
  //       </Box>
  //     );
  //   }
  // },
  // {
  //   header: 'Hướng dẫn đặc biệt',
  //   accessorKey: 'specialInstructions',
  //   cell: ({ getValue }) => {
  //     const instructions = getValue() as string;
  //     if (!instructions || instructions.trim() === '') {
  //       return (
  //         <Typography variant="body2" color="text.disabled" fontStyle="italic">
  //           Không có
  //         </Typography>
  //       );
  //     }
  //     return (
  //       <Tooltip title={instructions} placement="top" arrow>
  //         <Typography
  //           variant="body2"
  //           sx={{
  //             overflow: 'hidden',
  //             textOverflow: 'ellipsis',
  //             whiteSpace: 'nowrap',
  //             maxWidth: 150
  //           }}
  //         >
  //           {instructions}
  //         </Typography>
  //       </Tooltip>
  //     );
  //   }
  // },
  {
    header: 'Trạng thái',
    accessorKey: 'status',
    cell: ({ getValue }) => <StatusChip status={getValue() as number} />
  },
  {
    header: 'Ngày tạo',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <Typography variant="body2">
          {date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </Typography>
      );
    }
  },
  {
    id: 'actions',
    header: 'Thao tác',
    cell: ({ row }) => {
      const deliveryTerm = row.original;
      return (
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
          <ActionButtons
            onEdit={() => onEdit(deliveryTerm)}
            onView={() => onView(deliveryTerm)}
            onActivate={deliveryTerm.status === 0 ? () => onActivate(deliveryTerm) : undefined}
            onDelete={deliveryTerm.status === 1 ? () => onDeactivate(deliveryTerm) : undefined}
            permissionsOnAction={{
              edit: 'M_DELIVERY_TERM_UPDATE',
              view: 'M_DELIVERY_TERM_VIEW',
              activate: 'M_DELIVERY_TERM_UPDATE',
              delete: 'M_DELIVERY_TERM_DELETE'
            }}
          />
        </Stack>
      );
    },
    meta: {
      className: 'cell-center'
    }
  }
];

export default DeliveryTermColumns;
