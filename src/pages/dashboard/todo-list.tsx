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
import { PAGE_LIMIT, PAGE_SIZE, TODO_LIST_STATUS, TYPE_ASC_DESC } from '../../constants';
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
};

const DEFAULT_COUNT_LIST: TodoCountList = {
  noPoForPAKD: 0,
  noSaleContractForPAKD: 0,
  notPushedToEcus: 0,
  notPlannedLogistics: 0,
  notPlanVessel: 0,
  containerSummary7Days: 0,
  workshopPackingPlan2Days: 0,
  pendingContracts: 0
};

const COUNT_KEY_BY_STATUS: { [key: number]: keyof TodoCountList } = {
  1: 'noPoForPAKD',
  2: 'noSaleContractForPAKD',
  3: 'notPushedToEcus',
  4: 'notPlannedLogistics',
  5: 'notPlanVessel',
  6: 'containerSummary7Days',
  7: 'workshopPackingPlan2Days',
  8: 'pendingContracts'
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
  statuses: {
    id: number; label: string;
    color: Dynamic;
  }[];
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
            const countKey = COUNT_KEY_BY_STATUS[status.id];
            const countValue = countKey ? countList[countKey] : 0;
            return (
              <Tab
                key={index}
                label={`${intl.formatMessage({ id: status.label, defaultMessage: status.label })}`}
                value={status.id}
                icon={<Chip label={countValue ?? 0} color={status.color} variant="light" size="small" />}
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

  const visibleStatuses = useMemo(() => {
    switch (roleCode) {
      case 'DOMESTIC':
        return TODO_LIST_STATUS.filter((s) => s.id === 4);
      case 'LOGISTIC':
        return TODO_LIST_STATUS.filter((s) => s.id === 5);
      case 'QC':
        return TODO_LIST_STATUS.filter((s) => [6, 7].includes(s.id));
      case 'SALES':
        return TODO_LIST_STATUS.filter((s) => [1, 2, 3, 8].includes(s.id));
      default:
        return TODO_LIST_STATUS;
    }
  }, [roleCode]);

  const [todoList, setTodoList] = useState<Dynamic[]>([]);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [countList, setCountList] = useState<TodoCountList>({ ...DEFAULT_COUNT_LIST });

  const handleRowAction = useCallback(
    (statusId: number, rowData: Dynamic) => {
      const status = TODO_LIST_STATUS.find((item) => item.id === statusId);
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
        case 'todo_tab_type8':
          window.alert(`${formattedLabel}: Rà soát hợp đồng chờ xử lý của ${codeDisplay}`);
          break;
        default:
          window.alert(`${formattedLabel}: ${codeDisplay}`);
          break;
      }
    },
    [intl]
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
        const formatData: Dynamic[] = data.data?.map((item: any) => ({
          code: item.code,
          customerName: item.customerName,
          totalQuantity: item.totalQuantity,
          unitPrice: item.unitPrice,
          deliveryLocation: item.deliveryLocation,
          expectedDelivery: item.expectedDelivery,
          quality: item.quality,
          deliveryTime: item.deliveryTime,
          location: item.location,
          bookingCode: item.bookingCode,
          factoryName: item.factoryName,
          numberOfVehicles: item.numberOfVehicles,
          country: item.country,
          shipmentDate: item.shipmentDate
        }));
        setTodoList(formatData);
        setTotalPage(data.meta?.totalPages || 0);
        getTodoCount();

        const statusId = Number(type);
        const countKey = COUNT_KEY_BY_STATUS[statusId];
        if (countKey) {
          setCountList((prev) => ({
            ...prev,
            [countKey]: data.meta?.totalElements ?? formatData.length ?? 0
          }));
        }
      }
    } catch (err: any) {
      enqueueSnackbar(err?.message || 'Something went wrong!', { variant: 'error' });
    }
  };

  const columns = useMemo<{ [key: number]: ColumnDef<Dynamic>[] }>(
    () => ({
      1: [
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
      2: [
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
      3: [
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
      4: [
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
      5: [
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
      6: [
        {
          id: 'bookingCode',
          header: intl.formatMessage({ id: 'booking_code_label', defaultMessage: 'Booking Code' }),
          accessorKey: 'bookingCode',
          cell: ({ row }) => <TruncatedCell value={row.original.bookingCode} maxLength={20} />
        },
        {
          id: 'factoryName',
          header: intl.formatMessage({ id: 'factory_name_label', defaultMessage: 'Factory Name' }),
          accessorKey: 'factoryName',
          cell: ({ row }) => <TruncatedCell value={row.original.factoryName} maxLength={20} />
        },
        {
          id: 'numberOfVehicles',
          header: intl.formatMessage({ id: 'number_of_vehicles_label', defaultMessage: 'Number Of Vehicles' }),
          accessorKey: 'numberOfVehicles',
          cell: ({ row }) => <TruncatedCell value={row.original.numberOfVehicles} maxLength={12} />
        }
      ],
      7: [
        {
          id: 'bookingCode',
          header: intl.formatMessage({ id: 'booking_code_label', defaultMessage: 'Booking Code' }),
          accessorKey: 'bookingCode',
          cell: ({ row }) => <TruncatedCell value={row.original.bookingCode} maxLength={20} />
        },
        {
          id: 'factoryName',
          header: intl.formatMessage({ id: 'factory_name_label', defaultMessage: 'Factory Name' }),
          accessorKey: 'factoryName',
          cell: ({ row }) => <TruncatedCell value={row.original.factoryName} maxLength={20} />
        },
        {
          id: 'numberOfVehicles',
          header: intl.formatMessage({ id: 'number_of_vehicles_label', defaultMessage: 'Number Of Vehicles' }),
          accessorKey: 'numberOfVehicles',
          cell: ({ row }) => <TruncatedCell value={row.original.numberOfVehicles} maxLength={12} />
        }
      ],
      8: [
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
      ]
    }),
    [intl]
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