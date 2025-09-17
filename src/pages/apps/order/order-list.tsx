import { MouseEvent, useMemo, useState } from 'react';

// material-ui
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// third-party
import { ColumnDef } from '@tanstack/react-table';

// project imports
import IconButton from 'components/@extended/IconButton';
import { IndeterminateCheckbox } from 'components/third-party/react-table';

import OrderModal from 'sections/apps/order/OrderModal';
import AlertOrderDelete from 'sections/apps/order/AlertOrderDelete';
import OrderTable from 'sections/apps/order/OrderTable';
import EmptyReactTable from 'pages/tables/react-table/empty';

import { useGetOrder } from 'api/order';

// types
import { OrderList } from 'types/order';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// ==============================|| ORDER LIST ||============================== //

export default function OrderListPage() {
  const { ordersLoading, orders: lists } = useGetOrder();

  const [open, setOpen] = useState<boolean>(false);

  const [orderModal, setOrderModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderList | null>(null);
  const [orderDeleteId, setOrderDeleteId] = useState<any>('');

  const handleClose = () => {
    setOpen(!open);
  };

  const columns = useMemo<ColumnDef<OrderList>[]>(
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
        header: '#',
        accessorKey: 'id',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Customer Name',
        accessorKey: 'customerName',
        cell: ({ getValue }) => <Typography variant="subtitle1">{getValue() as string}</Typography>
      },
      {
        header: 'Product Name',
        accessorKey: 'productName',
        cell: ({ getValue }) => <Typography variant="subtitle2">{getValue() as string}</Typography>
      },
      {
        header: 'Delivery Location',
        accessorKey: 'deliveryLocation',
        cell: ({ getValue }) => <Typography>{getValue() as string}</Typography>
      },
      {
        header: 'Unit Price',
        accessorKey: 'unitPrice',
        cell: ({ getValue }) => (
          <Typography variant="body2" color="text.secondary">
            ${getValue() as number}
          </Typography>
        )
      },
      {
        header: 'Profit Margin (%)',
        accessorKey: 'profitMargin',
        cell: ({ getValue }) => (
          <Typography variant="body2" color="text.secondary">
            {getValue() as number}%
          </Typography>
        )
      },
      {
        header: 'Actions',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          const collapseIcon =
            row.getCanExpand() && row.getIsExpanded() ? <PlusOutlined style={{ transform: 'rotate(45deg)' }} /> : <EyeOutlined />;
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Tooltip title="View">
                <IconButton color={row.getIsExpanded() ? 'error' : 'secondary'} onClick={row.getToggleExpandedHandler()}>
                  {collapseIcon}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  color="primary"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setSelectedOrder(row.original);
                    setOrderModal(true);
                  }}
                >
                  <EditOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setOpen(true);
                    setOrderDeleteId(Number(row.original.id));
                  }}
                >
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    []
  );

  if (ordersLoading) return <EmptyReactTable />;

  return (
    <>
      <OrderTable
        {...{
          data: lists,
          columns,
          modalToggler: () => {
            setOrderModal(true);
            setSelectedOrder(null);
          }
        }}
      />
      <AlertOrderDelete id={Number(orderDeleteId)} title={orderDeleteId} open={open} handleClose={handleClose} />
      <OrderModal open={orderModal} modalToggler={setOrderModal} order={selectedOrder} />
    </>
  );
}
