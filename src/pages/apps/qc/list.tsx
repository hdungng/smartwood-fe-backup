import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { MenuItem, TextField } from '@mui/material';

// tanstack / utils
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

// project components
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

// icons
import { NodeIndexOutlined, SolutionOutlined, PlusOutlined } from '@ant-design/icons';

// axios & constants
import axiosServices from 'utils/axios';
import { REPORT_API, CUSTOMER_API, CONTRACT_API } from 'api/constants';

// types
import { SnackbarProps } from 'types/snackbar';

// -------------------- Types --------------------
interface ReportItem {
  id: number;
  code: string;
  createdAt?: string | null;
  lastUpdatedAt?: string | null;
  statusRequestPayment?: number | null;
  contractId?: number | null;
  customerId?: number | null;
  checkDate?: string | null;
  customerName?: string;
  contractCode?: string;
  contractStatus?: number;
}

type StatusLabel = 'Active' | 'Pending' | 'Completed';
type ReportRow = ReportItem & { statusLabel: StatusLabel };

// -------------------- Filter --------------------
const fuzzyFilter: FilterFn<ReportRow> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(String(row.getValue(columnId)), value);
  addMeta(itemRank);
  return itemRank.passed;
};

// -------------------- Helpers --------------------
function formatDateDDMMYYYY(dateStr?: string | null) {
  if (!dateStr) return 'Chưa có';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Chưa có';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const computeStatusLabel = (r: ReportItem): StatusLabel => {
  if (r.contractStatus === 1) return 'Completed';
  if (r.statusRequestPayment === 1) return 'Active';
  return 'Pending';
};

interface TableCellWithFilterProps extends TableCellProps {
  filterComponent?: any;
}
function TableCellWithFilterComponent({ filterComponent, ...props }: TableCellWithFilterProps) {
  return <TableCell {...props} />;
}

// ================= Table component =================
interface Props {
  data: ReportRow[];
  columns: ColumnDef<ReportRow>[];
}

function ReactTable({ data, columns }: Props) {
  const navigate = useNavigate();
  const FIXED_TABS = [
    { value: 'All', label: 'Tất cả' },
    { value: 'Active', label: 'Đang xử lý' },
    { value: 'Pending', label: 'Chờ xử lý' },
    { value: 'Completed', label: 'Hoàn thành' }
  ];

  const [activeTab, setActiveTab] = useState<string>('All');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'code', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, rowSelection, globalFilter },
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
    autoResetPageIndex: false // **quan trọng để tránh vòng lặp vô hạn**
  });

  // Counts
  const countTable = useReactTable({
    data,
    columns,
    state: { globalFilter, columnFilters: [], sorting: [], rowSelection: {} },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter
  });

  const filteredRowsForCounts = countTable.getFilteredRowModel().rows;
  const counts = useMemo(
    () =>
      filteredRowsForCounts.reduce((acc: Record<string, number>, row) => {
        const status = row.original.statusLabel;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, { All: filteredRowsForCounts.length }),
    [filteredRowsForCounts]
  );

  const headers: LabelKeyObject[] = [];
  columns.forEach((c) => {
    // @ts-ignore
    if (c.accessorKey) {
      headers.push({
        label: typeof c.header === 'string' ? c.header : '#',
        // @ts-ignore
        key: c.accessorKey
      });
    }
  });

  // Chỉ set filter khi activeTab thay đổi
  useEffect(() => {
    const newFilters = activeTab === 'All' ? [] : [{ id: 'statusLabel', value: activeTab }];
    const isEqual = JSON.stringify(newFilters) === JSON.stringify(columnFilters);
    if (!isEqual) {
      setColumnFilters(newFilters);
      table.setPageIndex(0); // reset page index khi filter thay đổi
    }
  }, [activeTab]);

  return (
    <MainCard content={false}>
      <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
        <Typography variant="caption" color="text.secondary">
          Cập nhật: {new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
        </Typography>

        <Tabs value={activeTab} onChange={(e: ChangeEvent<unknown>, v: string) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
          {FIXED_TABS.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              value={tab.value}
              icon={
                <Chip
                  label={counts[tab.value] || 0}
                  color={tab.value === 'All' ? 'primary' : tab.value === 'Active' ? 'success' : tab.value === 'Pending' ? 'warning' : 'info'}
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
        <DebouncedInput value={globalFilter ?? ''} onFilterChange={(v) => setGlobalFilter(String(v))} placeholder={`Tìm kiếm ${table.getFilteredRowModel().rows.length} bản ghi...`} />
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <Button
            variant="contained"
            startIcon={<PlusOutlined />}
            onClick={(e: any) => {
              e.stopPropagation();
              navigate(`/quality-control/reports/add`);
            }}
          >
            Thêm mới
          </Button>
          <CSVExport
            data={table.getSelectedRowModel().flatRows.map((row) => row.original)}
            headers={headers}
            filename="report-list.csv"
          />
        </Stack>
      </Stack>

      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      if (header.column.getCanSort()) {
                        header.column.columnDef.meta = {
                          ...(header.column.columnDef.meta || {}),
                          className: ((header.column.columnDef.meta && (header.column.columnDef.meta as any).className) || '') + ' cursor-pointer prevent-select'
                        };
                      }
                      return (
                        <TableCellWithFilterComponent key={header.id} {...(header.column.columnDef.meta || {})} onClick={header.column.getToggleSortingHandler()}>
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
                      <TableCellWithFilterComponent key={cell.id} {...(cell.column.columnDef.meta || {})}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCellWithFilterComponent>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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
        </Stack>
      </ScrollX>
    </MainCard>
  );
}

// ================= Main =================
export default function QCList() {
  const navigate = useNavigate();
  const [data, setData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const reportRes = await axiosServices.get(REPORT_API.COMMON);
        const customerRes = await axiosServices.get(CUSTOMER_API.COMMON);
        const contractRes = await axiosServices.get(CONTRACT_API.GET_LIST);

        const customerMap = new Map<number, string>();
        customerRes.data.data.forEach((c: any) => customerMap.set(c.id, c.name));

        const contractMap = new Map<number, { code: string; status: number
        }>();
        contractRes.data.data.forEach((ct: any) =>
          contractMap.set(ct.id, { code: ct.code, status: ct.status })
        );

        const combined: ReportRow[] = reportRes.data.data.map((r: ReportItem) => {
          const customerName = r.customerId ? customerMap.get(r.customerId) || 'N/A' : 'N/A';
          const contractInfo = r.contractId ? contractMap.get(r.contractId) : undefined;
          const base: ReportItem = {
            ...r,
            customerName,
            contractCode: contractInfo?.code || 'N/A',
            contractStatus: contractInfo?.status || 0
          };
          return { ...base, statusLabel: computeStatusLabel(base) } as ReportRow;
        });

        setData(combined);
      } catch (error) {
        console.error(error);
        openSnackbar({
          open: true,
          message: 'Lỗi khi tải dữ liệu',
          variant: 'alert',
          alert: { color: 'error' }
        } as SnackbarProps);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = useMemo<ColumnDef<ReportRow>[]>(
    () => [
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
        ),
        meta: { style: { width: 40 } }
      },
      { header: 'MÃ ĐƠN HÀNG', accessorKey: 'code' },
      { header: 'TÊN KHÁCH HÀNG', accessorKey: 'customerName' },
      {
        header: 'Ngày báo cáo',
        accessorKey: 'checkDate',
        cell: ({ cell }) => formatDateDDMMYYYY(cell.getValue() as string)
      },
      {
        header: 'Trạng thái thanh toán',
        accessorKey: 'statusRequestPayment',
        cell: (cell) => {
          const status = cell.getValue() as number;
          return status === 1 ? (
            <Chip color="success" label="Đã thanh toán" size="small" variant="light" />
          ) : (
            <Chip color="error" label="Chưa thanh toán" size="small" variant="light" />
          );
        }
      },
      {
        header: 'TRẠNG THÁI ĐƠN HÀNG',
        accessorKey: 'statusLabel',
        cell: ({ cell }) => {
          const v = cell.getValue() as StatusLabel;
          if (v === 'Completed')
            return <Chip color="info" label="Hoàn thành" size="small" variant="light" />;
          if (v === 'Active')
            return <Chip color="success" label="Đang xử lý" size="small" variant="light" />;
          return <Chip color="warning" label="Chờ xử lý" size="small" variant="light" />;
        }
      },
      {
        header: 'THAO TÁC',
        meta: { className: 'cell-center' },
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Tooltip title="Báo cáo chất lượng">
              <IconButton
                color="secondary"
                onClick={(e: any) => {
                  e.stopPropagation();
                  navigate(`/quality-control/reports/${row.original.id}`);
                }}
              >
                <SolutionOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Báo cáo xuất hàng">
              <IconButton
                color="primary"
                onClick={(e: any) => {
                  e.stopPropagation();
                  navigate(`/quality-control/export-reports/${row.original.id}`);
                }}
              >
                <NodeIndexOutlined />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [navigate]
  );

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : data.length === 0 ? (
          <EmptyReactTable />
        ) : (
          <ReactTable data={data} columns={columns} />
        )}
      </Grid>
    </Grid>
  );
}
