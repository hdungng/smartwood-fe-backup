import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import axiosServices from 'utils/axios';
import { enqueueSnackbar } from 'notistack';

// material-ui
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// third-party
import { rankItem } from '@tanstack/match-sorter-utils';
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  HeaderGroup,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';

// project imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { HeaderSort, TablePagination } from 'components/third-party/react-table';
import { TODO_API } from 'api/constants';
import {
  PAGE_LIMIT,
  PAGE_SIZE,
  TODO_LIST_ROLE_STATUS,
  TodoCountKey,
  TodoListStatusConfig,
  TYPE_ASC_DESC
} from '../../constants';
import { useIntl } from 'react-intl';
import { useAuth } from 'hooks';
import { Chip } from '@mui/material';

// ==============================|| TRUNCATED CELL COMPONENT ||============================== //

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

// ==============================|| FILTER FUNCTION ||============================== //

const fuzzyFilter: FilterFn<Dynamic> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

interface TodoCountList {
  noPoForPAKD: number;
  noSaleContractForPAKD: number;
  notPushedToEcus: number;
  notPlannedLogistics: number;
  notPlanVessel: number;
  containerSummary7Days: number;
  workshopPackingPlan2Days: number;
  pendingContracts: number;
  domesticTruckScheduleByLoadingDate: number;
  domesticTruckPerformance: number;
};

const DEFAULT_COUNT_LIST: TodoCountList = {
  noPoForPAKD: 0,
  noSaleContractForPAKD: 0,
  notPushedToEcus: 0,
  notPlannedLogistics: 0,
  notPlanVessel: 0,
  containerSummary7Days: 0,
  workshopPackingPlan2Days: 0,
  pendingContracts: 0,
  domesticTruckScheduleByLoadingDate: 0,
  domesticTruckPerformance: 0
};

interface TableCellWithFilterProps extends TableCellProps {
  filterComponent?: any;
}

function TableCellWithFilterComponent({ filterComponent, ...props }: TableCellWithFilterProps) {
  return <TableCell {...props} />;
}

interface ReactTableProps {
  data: Dynamic[];
  columns: { [key: number]: ColumnDef<Dynamic>[] };
  totalPage: number;
  countList: TodoCountList;
  statuses: TodoListStatusConfig[];
  onCallData: (
    page: number,
    size: number,
    search: string,
    sort: string,
    sortDirection: any,
    active: number | string
  ) => void;
  onRowAction?: (statusId: number, rowData: Dynamic) => void;
}

function ReactTable({ data, columns, totalPage, countList, statuses, onCallData, onRowAction }: ReactTableProps) {
  const intl = useIntl();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGE_SIZE,
    pageSize: PAGE_LIMIT
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: '', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [activeTab, setActiveTab] = useState(statuses[0]?.id || 1);

  useEffect(() => {
    if (statuses.length) {
      setActiveTab(statuses[0].id);
    }
  }, [statuses]);

  useEffect(() => {
    onCallData(
      pagination.pageIndex,
      pagination.pageSize,
      '',
      sorting[0]?.id,
      sorting[0]?.desc ? sorting[0]?.desc : '',
      activeTab
    );
  }, [pagination.pageIndex, pagination.pageSize, sorting[0]?.id, sorting[0]?.desc, activeTab]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const tableColumns = useMemo<ColumnDef<Dynamic>[]>(
    () => columns[activeTab] || [],
    [columns, activeTab]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      columnFilters,
      sorting,
      columnVisibility,
      pagination
    },
    manualPagination: true,
    pageCount: totalPage,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    globalFilterFn: fuzzyFilter
  });

  return (
    <MainCard content={false}>
      <Box sx={{ p: 2.5, pb: 0, width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e: ChangeEvent<unknown>, value: number) => {
            setPagination({
              pageIndex: PAGE_SIZE,
              pageSize: PAGE_LIMIT
            });
            setActiveTab(value);
          }}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {statuses.map((status, index) => {
            const countValue = countList[status.countKey] ?? 0;
            return (
              <Tab
                key={index}
                label={`${intl.formatMessage({ id: status.label, defaultMessage: status.label })}`}
                value={status.id}
                icon={<Chip label={countValue} color={status.color} variant="light" size="small" />}
                iconPosition="end"
              />
            );
          })}
        </Tabs>
      </Box>
      <ScrollX>
        <Stack>
          <TableContainer>
            <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCellWithFilterComponent
                        key={header.id}
                        {...header.column.columnDef.meta}
                        onClick={header.column.getToggleSortingHandler()}
                        {...(header.column.getCanSort() &&
                          header.column.columnDef.meta === undefined && {
                          className: 'cursor-pointer prevent-select'
                        })}
                        sx={{
                          ...(header.column.columnDef.meta && 'style' in header.column.columnDef.meta
                            ? (header.column.columnDef.meta as any)['style']
                            : {}),
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          padding: '8px 16px'
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', overflow: 'hidden' }}>
                            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </Box>
                            {header.column.getCanSort() && <HeaderSort column={header.column} />}
                          </Stack>
                        )}
                      </TableCellWithFilterComponent>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} hover={!!onRowAction}
                    sx={onRowAction ? { cursor: 'pointer' } : undefined}
                    onClick={() => {
                      if (onRowAction) {
                        onRowAction(activeTab, row.original);
                      }
                    }}>
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

// ==============================|| TODO LIST PAGE ||============================== //

export default function ToDoList() {
  const intl = useIntl();
  const { user } = useAuth();
  const roleCode = user?.roles?.[0]?.code;

  const visibleStatuses = useMemo<TodoListStatusConfig[]>(() => {
    if (roleCode && TODO_LIST_ROLE_STATUS[roleCode]) {
      return TODO_LIST_ROLE_STATUS[roleCode];
    }
    return TODO_LIST_ROLE_STATUS.DEFAULT;
  }, [roleCode]);

  const [todoList, setTodoList] = useState<Dynamic[]>([]);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [countList, setCountList] = useState<TodoCountList>({ ...DEFAULT_COUNT_LIST });

  const handleRowAction = useCallback(
    (statusId: number, rowData: Dynamic) => {
      const status = visibleStatuses.find((item) => item.id === statusId);
      const formattedLabel = status
        ? intl.formatMessage({ id: status.label, defaultMessage: status.label })
        : `Status ${statusId}`;
      const codeDisplay = rowData?.code ?? '---';

      switch (status?.label) {
        case 'todo_tab_type1':
          window.alert(`${formattedLabel}: Thực hiện hành động tạo PO cho ${codeDisplay}`);
          break;
        case 'todo_tab_type2':
          window.alert(`${formattedLabel}: Kiểm tra hợp đồng bán cho ${codeDisplay}`);
          break;
        case 'todo_tab_type3':
          window.alert(`${formattedLabel}: Đẩy dữ liệu ECUS cho ${codeDisplay}`);
          break;
        case 'todo_tab_type4':
          window.alert(`${formattedLabel}: Lên kế hoạch logistics cho ${codeDisplay}`);
          break;
        case 'todo_tab_type5':
          window.alert(`${formattedLabel}: Chuẩn bị kế hoạch tàu cho ${codeDisplay}`);
          break;
        case 'todo_tab_type6':
          window.alert(`${formattedLabel}: Rà soát container 7 ngày cho ${codeDisplay}`);
          break;
        case 'todo_tab_type7':
          window.alert(`${formattedLabel}: Lập kế hoạch đóng gói 2 ngày cho ${codeDisplay}`);
          break;
        case 'todo_tab_type9':
          window.alert(`${formattedLabel}: Kiểm tra lịch xe tải nội địa cho ${codeDisplay}`);
          break;
        case 'todo_tab_type10':
          window.alert(`${formattedLabel}: Đánh giá hiệu suất xe tải nội địa của ${codeDisplay}`);
          break;
        case 'todo_tab_type8':
          window.alert(`${formattedLabel}: Rà soát hợp đồng chờ xử lý của ${codeDisplay}`);
          break;
        default:
          window.alert(`${formattedLabel}: ${codeDisplay}`);
          break;
      }
    },
    [intl, visibleStatuses]
  );

  const getTodoCount = useCallback(async () => {
    try {

      const { data, status } = await axiosServices.get(
        `${TODO_API.GET_COUNT}`
      );
      if (status === 200 || status === 201) {
        const responseCounts = (data?.data ?? data ?? {}) as Partial<TodoCountList>;
        setCountList({ ...DEFAULT_COUNT_LIST, ...responseCounts });
      }
    } catch (err: any) {
      enqueueSnackbar(err?.message || 'Something went wrong!', { variant: 'error' });
    }
  }, [roleCode]);

  const getTodoList = async (
    page: number = PAGE_SIZE,
    size: number = PAGE_LIMIT,
    search: string = '',
    sort: string = '',
    sortDirection: string = '',
    type: string | number = 1
  ) => {
    try {
      const params = new URLSearchParams();
      params.append('page', (page + 1).toString());
      params.append('size', size.toString());
      params.append('type', type.toString());
      if (roleCode) {
        params.append('role', roleCode);
      }
      if (search) {
        params.append('search', search);
      }
      if (sort) {
        params.append('sortBy', sort);
      }
      if (sortDirection) {
        params.append('sortDirection', sortDirection);
      }

      const { data, status } = await axiosServices.get(TODO_API.GET_PAGE + `?${params.toString()}`);

      if (status === 200 || status === 201) {
        const formatData: Dynamic[] = (data.data ?? []).map((item: any) => ({ ...item }));
        setTodoList(formatData);
        setTotalPage(data.meta?.totalPages || 0);
        getTodoCount();

        const statusId = Number(type);
        const activeStatus = visibleStatuses.find((item) => item.id === statusId);
        if (activeStatus) {
          setCountList((prev) => ({
            ...prev,
            [activeStatus.countKey]: data.meta?.totalElements ?? formatData.length ?? 0
          }));
        }
      }
    } catch (err: any) {
      enqueueSnackbar(err?.message || 'Something went wrong!', { variant: 'error' });
    }
  };

  const columnDefinitions = useMemo<Record<TodoCountKey, ColumnDef<Dynamic>[]>>(() => ({
    noPoForPAKD: [
      {
        id: 'code',
        header: intl.formatMessage({ id: 'code_label', defaultMessage: 'Code' }),
        accessorKey: 'code',
        cell: ({ row }) => <TruncatedCell value={row.original.code} maxLength={15} />
      },
      {
        id: 'customerName',
        header: intl.formatMessage({ id: 'customer_name_label', defaultMessage: 'Customer Name' }),
        accessorKey: 'customerName',
        cell: ({ row }) => <TruncatedCell value={row.original.customerName} maxLength={20} />
      },
      {
        id: 'totalQuantity',
        header: intl.formatMessage({ id: 'quantity_label_po', defaultMessage: 'Quantity' }),
        accessorKey: 'totalQuantity',
        cell: ({ row }) => <TruncatedCell value={row.original.totalQuantity} maxLength={12} />
      },
      {
        id: 'unitPrice',
        header: intl.formatMessage({ id: 'unit_price_label_po', defaultMessage: 'Unit Price' }),
        accessorKey: 'unitPrice',
        cell: ({ row }) => <TruncatedCell value={row.original.unitPrice} maxLength={12} />
      },
      {
        id: 'deliveryLocation',
        header: intl.formatMessage({ id: 'delivery_location', defaultMessage: 'Delivery Location' }),
        accessorKey: 'deliveryLocation',
        cell: ({ row }) => <TruncatedCell value={row.original.deliveryLocation} maxLength={12} />
      },
      {
        id: 'expectedDelivery',
        header: intl.formatMessage({ id: 'expected_delivery_date_label', defaultMessage: 'Expected Delivery' }),
        accessorKey: 'expectedDelivery',
        cell: ({ row }) => <TruncatedCell value={row.original.expectedDelivery} maxLength={12} />
      }
    ],
    noSaleContractForPAKD: [
      {
        id: 'code',
        header: intl.formatMessage({ id: 'code_label', defaultMessage: 'Code' }),
        accessorKey: 'code',
        cell: ({ row }) => <TruncatedCell value={row.original.code} maxLength={15} />
      },
      {
        id: 'customerName',
        header: intl.formatMessage({ id: 'customer_name_label', defaultMessage: 'Customer Name' }),
        accessorKey: 'customerName',
        cell: ({ row }) => <TruncatedCell value={row.original.customerName} maxLength={20} />
      },
      {
        id: 'totalQuantity',
        header: intl.formatMessage({ id: 'quantity_label_po', defaultMessage: 'Quantity' }),
        accessorKey: 'totalQuantity',
        cell: ({ row }) => <TruncatedCell value={row.original.totalQuantity} maxLength={12} />
      },
      {
        id: 'unitPrice',
        header: intl.formatMessage({ id: 'unit_price_label_po', defaultMessage: 'Unit Price' }),
        accessorKey: 'unitPrice',
        cell: ({ row }) => <TruncatedCell value={row.original.unitPrice} maxLength={12} />
      },
      {
        id: 'deliveryLocation',
        header: intl.formatMessage({ id: 'delivery_location', defaultMessage: 'Delivery Location' }),
        accessorKey: 'deliveryLocation',
        cell: ({ row }) => <TruncatedCell value={row.original.deliveryLocation} maxLength={12} />
      },
      {
        id: 'expectedDelivery',
        header: intl.formatMessage({ id: 'expected_delivery_date_label', defaultMessage: 'Expected Delivery' }),
        accessorKey: 'expectedDelivery',
        cell: ({ row }) => <TruncatedCell value={row.original.expectedDelivery} maxLength={12} />
      }
    ],
    notPushedToEcus: [
      {
        id: 'code',
        header: intl.formatMessage({ id: 'code_label', defaultMessage: 'Code' }),
        accessorKey: 'code',
        cell: ({ row }) => <TruncatedCell value={row.original.code} maxLength={15} />
      },
      {
        id: 'customerName',
        header: intl.formatMessage({ id: 'customer_name_label', defaultMessage: 'Customer Name' }),
        accessorKey: 'customerName',
        cell: ({ row }) => <TruncatedCell value={row.original.customerName} maxLength={20} />
      },
      {
        id: 'totalQuantity',
        header: intl.formatMessage({ id: 'quantity_label_po', defaultMessage: 'Quantity' }),
        accessorKey: 'totalQuantity',
        cell: ({ row }) => <TruncatedCell value={row.original.totalQuantity} maxLength={12} />
      },
      {
        id: 'unitPrice',
        header: intl.formatMessage({ id: 'unit_price_label_po', defaultMessage: 'Unit Price' }),
        accessorKey: 'unitPrice',
        cell: ({ row }) => <TruncatedCell value={row.original.unitPrice} maxLength={12} />
      },
      {
        id: 'deliveryLocation',
        header: intl.formatMessage({ id: 'delivery_location', defaultMessage: 'Delivery Location' }),
        accessorKey: 'deliveryLocation',
        cell: ({ row }) => <TruncatedCell value={row.original.deliveryLocation} maxLength={12} />
      }
    ],
    notPlannedLogistics: [
      {
        id: 'customerName',
        header: intl.formatMessage({ id: 'customer_name_label', defaultMessage: 'Customer Name' }),
        accessorKey: 'customerName',
        cell: ({ row }) => <TruncatedCell value={row.original.customerName} maxLength={20} />
      },
      {
        id: 'totalQuantity',
        header: intl.formatMessage({ id: 'quantity_label_po', defaultMessage: 'Quantity' }),
        accessorKey: 'totalQuantity',
        cell: ({ row }) => <TruncatedCell value={row.original.totalQuantity} maxLength={12} />
      },
      {
        id: 'quality',
        header: intl.formatMessage({ id: 'quality', defaultMessage: 'Quality' }),
        accessorKey: 'quality',
        cell: ({ row }) => <TruncatedCell value={row.original.quality} maxLength={12} />
      },
      {
        id: 'deliveryTime',
        header: intl.formatMessage({ id: 'delivery_time_label', defaultMessage: 'Delivery Time' }),
        accessorKey: 'deliveryTime',
        cell: ({ row }) => <TruncatedCell value={row.original.deliveryTime} maxLength={12} />
      }
    ],
    notPlanVessel: [
      {
        id: 'customerName',
        header: intl.formatMessage({ id: 'customer_name_label', defaultMessage: 'Customer Name' }),
        accessorKey: 'customerName',
        cell: ({ row }) => <TruncatedCell value={row.original.customerName} maxLength={20} />
      },
      {
        id: 'totalQuantity',
        header: intl.formatMessage({ id: 'quantity_label_po', defaultMessage: 'Quantity' }),
        accessorKey: 'totalQuantity',
        cell: ({ row }) => <TruncatedCell value={row.original.totalQuantity} maxLength={12} />
      },
      {
        id: 'deliveryTime',
        header: intl.formatMessage({ id: 'delivery_time_label', defaultMessage: 'Delivery Time' }),
        accessorKey: 'deliveryTime',
        cell: ({ row }) => <TruncatedCell value={row.original.deliveryTime} maxLength={12} />
      },
      {
        id: 'deliveryLocation',
        header: intl.formatMessage({ id: 'delivery_location', defaultMessage: 'Delivery Location' }),
        accessorKey: 'deliveryLocation',
        cell: ({ row }) => <TruncatedCell value={row.original.deliveryLocation} maxLength={12} />
      },
      {
        id: 'location',
        header: intl.formatMessage({ id: 'location_region_label', defaultMessage: 'Region' }),
        accessorKey: 'location',
        cell: ({ row }) => <TruncatedCell value={row.original.location} maxLength={12} />
      }
    ],
    containerSummary7Days: [
      {
        id: 'shipName',
        header: intl.formatMessage({ id: 'ship_name_label', defaultMessage: 'Ship Name' }),
        accessorKey: 'shipName',
        cell: ({ row }) => <TruncatedCell value={row.original.shipName} maxLength={20} />
      },
      {
        id: 'etdDate',
        header: intl.formatMessage({ id: 'etd_date_label', defaultMessage: 'ETD Date' }),
        accessorKey: 'etdDate',
        cell: ({ row }) => <TruncatedCell value={row.original.etdDate} maxLength={16} />
      },
      {
        id: 'etaDate',
        header: intl.formatMessage({ id: 'eta_date_label', defaultMessage: 'ETA Date' }),
        accessorKey: 'etaDate',
        cell: ({ row }) => <TruncatedCell value={row.original.etaDate} maxLength={16} />
      },
      {
        id: 'containerQuantity',
        header: intl.formatMessage({ id: 'container_quantity_label', defaultMessage: 'Container Quantity' }),
        accessorKey: 'containerQuantity',
        cell: ({ row }) => <TruncatedCell value={row.original.containerQuantity} maxLength={12} />
      },
      {
        id: 'description',
        header: intl.formatMessage({ id: 'description_label', defaultMessage: 'Description' }),
        accessorKey: 'description',
        cell: ({ row }) => <TruncatedCell value={row.original.description} maxLength={20} />
      }
    ],
    workshopPackingPlan2Days: [
      {
        id: 'supplierName',
        header: intl.formatMessage({ id: 'supplier_name_label', defaultMessage: 'Supplier Name' }),
        accessorKey: 'supplierName',
        cell: ({ row }) => <TruncatedCell value={row.original.supplierName} maxLength={20} />
      },
      {
        id: 'region',
        header: intl.formatMessage({ id: 'location_region_label', defaultMessage: 'Region' }),
        accessorKey: 'region',
        cell: ({ row }) => <TruncatedCell value={row.original.region} maxLength={16} />
      },
      {
        id: 'province',
        header: intl.formatMessage({ id: 'province_label', defaultMessage: 'Province' }),
        accessorKey: 'province',
        cell: ({ row }) => <TruncatedCell value={row.original.province} maxLength={16} />
      },
      {
        id: 'daysUntilStart',
        header: intl.formatMessage({ id: 'days_until_start_label', defaultMessage: 'Days Until Start' }),
        accessorKey: 'daysUntilStart',
        cell: ({ row }) => <TruncatedCell value={row.original.daysUntilStart} maxLength={12} />
      },
      {
        id: 'daysUntilEnd',
        header: intl.formatMessage({ id: 'days_until_end_label', defaultMessage: 'Days Until End' }),
        accessorKey: 'daysUntilEnd',
        cell: ({ row }) => <TruncatedCell value={row.original.daysUntilEnd} maxLength={12} />
      },
      {
        id: 'plannedQuantity',
        header: intl.formatMessage({ id: 'planned_quantity_label', defaultMessage: 'Planned Quantity' }),
        accessorKey: 'plannedQuantity',
        cell: ({ row }) => <TruncatedCell value={row.original.plannedQuantity} maxLength={14} />
      }
    ],
    pendingContracts: [
      {
        id: 'bookingCode',
        header: intl.formatMessage({ id: 'booking_code_label', defaultMessage: 'Booking Code' }),
        accessorKey: 'bookingCode',
        cell: ({ row }) => <TruncatedCell value={row.original.bookingCode} maxLength={20} />
      },
      {
        id: 'customerName',
        header: intl.formatMessage({ id: 'customer_name_label', defaultMessage: 'Customer Name' }),
        accessorKey: 'customerName',
        cell: ({ row }) => <TruncatedCell value={row.original.customerName} maxLength={20} />
      },
      {
        id: 'country',
        header: intl.formatMessage({ id: 'country_label', defaultMessage: 'Country' }),
        accessorKey: 'country',
        cell: ({ row }) => <TruncatedCell value={row.original.country} maxLength={12} />
      },
      {
        id: 'shipmentDate',
        header: intl.formatMessage({ id: 'shipment_date_label', defaultMessage: 'Shipment Date' }),
        accessorKey: 'shipmentDate',
        cell: ({ row }) => <TruncatedCell value={row.original.shipmentDate} maxLength={12} />
      }
    ],
    domesticTruckScheduleByLoadingDate: [
      {
        id: 'supplierName',
        header: intl.formatMessage({ id: 'supplier_name_label', defaultMessage: 'Supplier Name' }),
        accessorKey: 'supplierName',
        cell: ({ row }) => <TruncatedCell value={row.original.supplierName} maxLength={20} />
      },
      {
        id: 'deliveryLocation',
        header: intl.formatMessage({ id: 'delivery_location', defaultMessage: 'Delivery Location' }),
        accessorKey: 'deliveryLocation',
        cell: ({ row }) => <TruncatedCell value={row.original.deliveryLocation} maxLength={18} />
      },
      {
        id: 'quantity',
        header: intl.formatMessage({ id: 'quantity_label', defaultMessage: 'Quantity' }),
        accessorKey: 'quantity',
        cell: ({ row }) => <TruncatedCell value={row.original.quantity} maxLength={12} />
      },
      {
        id: 'totalCont',
        header: intl.formatMessage({ id: 'total_cont_label', defaultMessage: 'Total Cont' }),
        accessorKey: 'totalCont',
        cell: ({ row }) => <TruncatedCell value={row.original.totalCont} maxLength={12} />
      },
      {
        id: 'shipName',
        header: intl.formatMessage({ id: 'ship_name_label', defaultMessage: 'Ship Name' }),
        accessorKey: 'shipName',
        cell: ({ row }) => <TruncatedCell value={row.original.shipName} maxLength={18} />
      },
      {
        id: 'forwarderName',
        header: intl.formatMessage({ id: 'forwarder_name_label', defaultMessage: 'Forwarder Name' }),
        accessorKey: 'forwarderName',
        cell: ({ row }) => <TruncatedCell value={row.original.forwarderName} maxLength={18} />
      }
    ],
    domesticTruckPerformance: [
      {
        id: 'supplierName',
        header: intl.formatMessage({ id: 'supplier_name_label', defaultMessage: 'Supplier Name' }),
        accessorKey: 'supplierName',
        cell: ({ row }) => <TruncatedCell value={row.original.supplierName} maxLength={20} />
      },
      {
        id: 'region',
        header: intl.formatMessage({ id: 'location_region_label', defaultMessage: 'Region' }),
        accessorKey: 'region',
        cell: ({ row }) => <TruncatedCell value={row.original.region} maxLength={16} />
      },
      {
        id: 'startDate',
        header: intl.formatMessage({ id: 'start_date_label', defaultMessage: 'Start Date' }),
        accessorKey: 'startDate',
        cell: ({ row }) => <TruncatedCell value={row.original.startDate} maxLength={16} />
      },
      {
        id: 'endDate',
        header: intl.formatMessage({ id: 'end_date_label', defaultMessage: 'End Date' }),
        accessorKey: 'endDate',
        cell: ({ row }) => <TruncatedCell value={row.original.endDate} maxLength={16} />
      },
      {
        id: 'plannedQuantity',
        header: intl.formatMessage({ id: 'planned_quantity_label', defaultMessage: 'Planned Quantity' }),
        accessorKey: 'plannedQuantity',
        cell: ({ row }) => <TruncatedCell value={row.original.plannedQuantity} maxLength={14} />
      },
      {
        id: 'actualQuantity',
        header: intl.formatMessage({ id: 'actual_quantity_label', defaultMessage: 'Actual Quantity' }),
        accessorKey: 'actualQuantity',
        cell: ({ row }) => <TruncatedCell value={row.original.actualQuantity} maxLength={14} />
      },
      {
        id: 'delayRatio',
        header: intl.formatMessage({ id: 'delay_ratio_label', defaultMessage: 'Delay Ratio' }),
        accessorKey: 'delayRatio',
        cell: ({ row }) => <TruncatedCell value={row.original.delayRatio} maxLength={12} />
      }
    ]
  }), [intl]);

  const columns = useMemo<{ [key: number]: ColumnDef<Dynamic>[] }>(() =>
    visibleStatuses.reduce((acc, status) => {
      acc[status.id] = columnDefinitions[status.columnKey] || [];
      return acc;
    }, {} as { [key: number]: ColumnDef<Dynamic>[] }),
  [visibleStatuses, columnDefinitions]
  );

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h4" gutterBottom>
          Danh sách công việc
        </Typography>
      </Grid>

      <Grid size={12}>
        <ReactTable
          data={todoList}
          columns={columns}
          totalPage={totalPage}
          countList={countList}
          statuses={visibleStatuses}
          onRowAction={handleRowAction}
          onCallData={(page, size, search, sort, sortDirection, active) => {
            getTodoList(page, size, search, sort, sortDirection ? TYPE_ASC_DESC.DESC : TYPE_ASC_DESC.ASC, active);
          }}
        />
      </Grid>
    </Grid>
  );
}