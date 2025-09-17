import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import AlertColumnDelete from 'components/AlertColumnDelete';
// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';

// third-party
import { rankItem } from '@tanstack/match-sorter-utils';
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  HeaderGroup,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project imports
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import EmptyReactTable from 'pages/tables/react-table/empty';

import { openSnackbar } from 'api/snackbar';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

// types
import { SnackbarProps } from 'types/snackbar';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// mock data
import { CheckCircleOutlined } from '@ant-design/icons';

const fuzzyFilter: FilterFn<Dynamic> = (row, columnId, value, addMeta) => {
  // rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // store the ranking info
  addMeta(itemRank);

  // return if the item should be filtered in/out
  return itemRank.passed;
};

interface Props {
  data: Dynamic[];
  columns: ColumnDef<Dynamic>[];
}

interface TableCellWithFilterProps extends TableCellProps {
  filterComponent?: any;
}

interface Column {
  filterValue: string | undefined;
  setFilter: (value: string | undefined) => void;
}

interface ExactValueFilterProps {
  column: Column;
}

function TableCellWithFilterComponent({ filterComponent, ...props }: TableCellWithFilterProps) {
  return <TableCell {...props} />;
}

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns }: Props) {
  const navigation = useNavigate();

  const groups = ['All', ...new Set(data.map((item: Dynamic) => item.status))];

  const countGroup = data.map((item: Dynamic) => item.status);
  const counts = countGroup.reduce(
    (acc: any, value: any) => ({
      ...acc,
      [value]: (acc[value] || 0) + 1
    }),
    {}
  );

  const [activeTab, setActiveTab] = useState(groups[0]);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'sellerName',
      desc: false
    }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      globalFilter
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: true
  });

  const headers: LabelKeyObject[] = [];
  columns.map(
    (columns) =>
      // @ts-expect-error Type 'string | undefined' is not assignable to type 'string'.
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        // @ts-expect-error Type 'string | undefined' is not assignable to type 'string'.
        key: columns.accessorKey
      })
  );

  useEffect(() => {
    setColumnFilters(activeTab === 'All' ? [] : [{ id: 'status', value: activeTab }]);
  }, [activeTab]);

  return (
    <MainCard content={false}>
      <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(e: ChangeEvent<unknown>, value: string) => setActiveTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {groups.map((status: string, index: number) => (
            <Tab
              key={index}
              label={status}
              value={status}
              icon={
                <Chip
                  label={
                    status === 'All'
                      ? data.length
                      : status === 'Active'
                        ? counts.Active
                        : status === 'Pending'
                          ? counts.Pending
                          : counts.Completed
                  }
                  color={status === 'All' ? 'primary' : status === 'Active' ? 'success' : status === 'Pending' ? 'warning' : 'info'}
                  variant="light"
                  size="small"
                />
              }
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Box>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
        />

        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={(e: any) => {
              e.stopPropagation();
              navigation(`/forms/contract/input`);
            }}
          >
            Thêm đơn hàng
          </Button>
          <CSVExport
            {...{ data: table.getSelectedRowModel().flatRows.map((row) => row.original), headers, filename: 'contract-list.csv' }}
          />
        </Stack>
      </Stack>
      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
                        Object.assign(header.column.columnDef.meta, {
                          className: header.column.columnDef.meta.className + ' cursor-pointer prevent-select'
                        });
                      }

                      return (
                        <TableCellWithFilterComponent
                          key={header.id}
                          {...header.column.columnDef.meta}
                          onClick={header.column.getToggleSortingHandler()}
                          {...(header.column.getCanSort() &&
                            header.column.columnDef.meta === undefined && {
                              className: 'cursor-pointer prevent-select'
                            })}
                        >
                          {header.isPlaceholder ? null : (
                            <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                              <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                              {header.column.getCanSort() && <HeaderSort column={header.column} />}
                            </Stack>
                          )}
                        </TableCellWithFilterComponent>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCellWithFilterComponent key={cell.id} {...cell.column.columnDef.meta}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCellWithFilterComponent>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <TablePagination
                {...{
                  setPageSize: table.setPageSize,
                  setPageIndex: table.setPageIndex,
                  getState: table.getState,
                  getPageCount: table.getPageCount
                }}
              />
            </Box>
          </>
        </Stack>
      </ScrollX>
    </MainCard>
  );
}

// ==============================|| CONTRACT LIST ||============================== //

export default function POApprove() {
  const navigation = useNavigate();

  // Using mock data
  const loading = false;

  const [contractId, setContractId] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleClose = (status: boolean) => {
    if (status) {
      // Here you would delete the contract
      openSnackbar({
        open: true,
        message: 'Contract deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    }
    setAlertOpen(false);
  };

  const columns = useMemo<ColumnDef<Dynamic>[]>(
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
        header: 'Mã đơn hàng',
        accessorKey: 'contractNumber'
      },
      {
        header: 'Tên khách hàng',
        accessorKey: 'customerName'
      },
      {
        header: 'Sản phẩm',
        accessorKey: 'productName'
      },
      {
        header: 'Ngày đặt hàng',
        accessorKey: 'orderDate'
      },
      {
        header: 'Giao hàng dự kiến',
        accessorKey: 'expectedDeliveryDate'
      },
      {
        header: 'Tổng tiền',
        accessorKey: 'totalAmount',
        cell: ({ row }) => {
          const amount = row.original.totalAmount;
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: row.original?.currency
          }).format(amount);
        }
      },
      {
        header: 'Trạng thái thanh toán',
        accessorKey: 'paymentStatus',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 'Paid':
              return <Chip color="success" label="Đã thanh toán" size="small" variant="light" />;
            case 'Partial':
              return <Chip color="warning" label="Thanh toán một phần" size="small" variant="light" />;
            case 'Pending':
            default:
              return <Chip color="error" label="Chưa thanh toán" size="small" variant="light" />;
          }
        }
      },
      {
        header: 'Trạng thái đơn hàng',
        accessorKey: 'status',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 'Completed':
              return <Chip color="info" label="Hoàn thành" size="small" variant="light" />;
            case 'Active':
              return <Chip color="success" label="Đang xử lý" size="small" variant="light" />;
            case 'Pending':
            default:
              return <Chip color="warning" label="Chờ xử lý" size="small" variant="light" />;
          }
        }
      },
      {
        header: 'Thao tác',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Tooltip title="Xem chi tiết">
                <IconButton
                  color="secondary"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    navigation(`/forms/contract/view/${row.original.id}`);
                  }}
                >
                  <EyeOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Duyệt">
                <IconButton
                  color="success"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    // Handle approval
                    navigation(`/forms/custom/approve/${row.original.id}`);
                  }}
                >
                  <CheckCircleOutlined />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    []
  );

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          {loading ? <EmptyReactTable /> : <ReactTable {...{ data: [], columns }} />}
          <AlertColumnDelete title={`Contract #${contractId}`} open={alertOpen} handleClose={handleClose} handleDelete={() => {}} />
        </Grid>
      </Grid>
    </>
  );
}
