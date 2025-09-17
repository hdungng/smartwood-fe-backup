import CopyOutlined from '@ant-design/icons/CopyOutlined';
import moment from 'moment';
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import axiosServices from 'utils/axios';

import AlertColumnDelete from 'components/AlertColumnDelete';
// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
  // getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project imports
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  SelectColumnVisibility,
  TablePagination
} from 'components/third-party/react-table';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// mock data
import { PO_API } from 'api/constants';
import { LIST_STATUS_PO, PAGE_LIMIT, PAGE_SIZE, TYPE_ASC_DESC } from '../../../constants';

// utils
import Typography from '@mui/material/Typography';
import { useRole } from 'contexts/RoleContext';
import { useRouter } from 'hooks';
import { useIntl } from 'react-intl';
import { PO } from 'types/po';
import {
  CommonStatus,
  formatCurrentMoney,
  formatLabelPaymentStatus,
  formatLabelStatus,
  getKeyFromValue,
  getStatusColor,
  getTabColor
} from 'utils';
import { copyToClipboard } from 'utils/clipboard';
import { mapGoodTypesFromConfig } from 'utils/mapGoodTypesFromConfig';
import { useGlobal } from '../../../contexts';
import { PermissionGuard } from 'components/guards';
import { CustomIconButton } from 'components/buttons';

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

// ==============================|| COLUMN WIDTHS CONFIGURATION ||============================== //

const COLUMN_WIDTHS = {
  select: 50,
  contractCode: 140,
  customerName: 140,
  deliveryLocation: 120,
  importCountry: 100,
  goodName: 150,
  deliveryMethod: 110,
  paymentMethod: 110,
  paymentCurrency: 80,
  unitPrice: 120,
  quantity: 90,
  qualityType: 100,
  expectedDelivery: 110,
  totalAmount: 120,
  paymentStatus: 100,
  status: 125,
  actions: 100
};

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
  totalPage: number;
  onCallData: (page: number, size: number, search: string, sort: string, sortDirection: any, active: number | string) => void;
  countListPO: {
    ALL: number;
    INACTIVE: number;
    ACTIVE: number;
    PENDING: number;
    APPROVED: number;
  };
  setCountListPO: React.Dispatch<
    React.SetStateAction<{
      ALL: number;
      INACTIVE: number;
      ACTIVE: number;
      PENDING: number;
      APPROVED: number;
    }>
  >;
}

interface TableCellWithFilterProps extends TableCellProps {
  filterComponent?: any;
}

function TableCellWithFilterComponent({ filterComponent, ...props }: TableCellWithFilterProps) {
  return <TableCell {...props} />;
}

function ReactTable({ data, columns, totalPage, onCallData, countListPO, setCountListPO }: Props) {
  const navigation = useNavigate();
  const intl = useIntl();

  // Safe useGlobal hook with error handling
  let configs: any[] = [];
  let qualityTypesData: any[] = [];
  try {
    const globalContext = useGlobal();
    configs = globalContext.configs || [];
    qualityTypesData = configs && configs.length > 0 ? mapGoodTypesFromConfig(configs) : [];
  } catch (error) {
    console.warn('GlobalProvider not ready yet:', error);
    // Use empty arrays as fallback
    configs = [];
    qualityTypesData = [];
  }
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGE_SIZE,
    pageSize: PAGE_LIMIT
  });
  const { hasPermission } = useRole();

  const [activeTab, setActiveTab] = useState(LIST_STATUS_PO[0].id);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: '',
      desc: false
    }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    onCallData(
      pagination.pageIndex,
      globalFilter ? countListPO.ALL : pagination.pageSize,
      globalFilter,
      sorting[0]?.id,
      sorting[0]?.desc ? sorting[0]?.desc : '',
      activeTab === 100 ? '' : activeTab
    );
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, sorting[0]?.id, sorting[0]?.desc /* , activeTab */]);

  // Default column visibility - only show main columns
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    select: true,
    contractCode: true,
    customerName: true,
    goodName: true,
    quantity: true,
    unitPrice: true,
    expectedDelivery: true,
    status: true,
    actions: true,
    // Hidden by default
    deliveryLocation: false,
    importCountry: false,
    deliveryMethod: false,
    paymentMethod: false,
    paymentCurrency: false,
    qualityType: false,
    totalAmount: false,
    paymentStatus: false
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      // globalFilter,
      columnVisibility,
      pagination
    },
    manualPagination: true,
    pageCount: totalPage,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getRowCanExpand: () => true,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
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

  const formatCsvData = useCallback(
    (arr: any = []) => {
      const formatData = arr.map((item: any) => {
        const { qualityType, paymentStatus, status, quantity, unitPrice, totalAmount, currency, ...rest } = item || {};
        return {
          qualityType: qualityTypesData.find((item) => item.value === qualityType)?.label || intl.formatMessage({ id: 'no_identify' }),
          status: formatLabelStatus(status, (v: string) => intl.formatMessage({ id: v })) || intl.formatMessage({ id: 'no_identify' }),
          paymentStatus:
            formatLabelPaymentStatus(paymentStatus, (v: string) => intl.formatMessage({ id: v })) ||
            intl.formatMessage({ id: 'no_identify' }),
          quantity: quantity.toLocaleString(),
          unitPrice: unitPrice.toLocaleString(),
          totalAmount: formatCurrentMoney(totalAmount, currency),
          ...rest
        };
      });
      return formatData;
    },
    [data]
  );

  return (
    <MainCard content={false}>
      <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(e: ChangeEvent<unknown>, value: string) => {
            setPagination({
              pageIndex: PAGE_SIZE,
              pageSize: PAGE_LIMIT
            });
            onCallData(
              PAGE_SIZE,
              PAGE_LIMIT,
              globalFilter,
              sorting[0]?.id,
              sorting[0]?.desc ? sorting[0]?.desc : '',
              Number(value) === 100 ? '' : Number(value)
            );
            setActiveTab(Number(value));
          }}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {LIST_STATUS_PO.map(
            (
              status: {
                id: number;
                code: string;
                label: string;
              },
              index: number
            ) => (
              <Tab
                key={index}
                label={intl.formatMessage({ id: status.label })}
                value={status.id}
                icon={
                  <Chip
                    label={(countListPO as any)[status.code] || 0}
                    variant="light"
                    size="small"
                    color={getTabColor(status.id)}
                    sx={{ ml: 0.5 }}
                  />
                }
                iconPosition="end"
              />
            )
          )}
        </Tabs>
      </Box>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}>
        <DebouncedInput
          style={{ width: 300 }}
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={intl.formatMessage({ id: 'search_by_contract_code' }, { value: /* globalFilter */ '' })}
        />

        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
          <SelectColumnVisibility
            {...{
              getVisibleLeafColumns: table.getVisibleLeafColumns,
              getIsAllColumnsVisible: table.getIsAllColumnsVisible,
              getToggleAllColumnsVisibilityHandler: table.getToggleAllColumnsVisibilityHandler,
              getAllColumns: table.getAllColumns
            }}
          />
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <PermissionGuard permission="DRAFT_PO_CREATE">
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={(e: any) => {
                e.stopPropagation();
                navigation(`/po/create`);
              }}
            >
              {intl.formatMessage({ id: 'add_po_label' })}
            </Button>
          </PermissionGuard>
          <CSVExport
            {...{
              // data: table.getSelectedRowModel().flatRows.map((row) => row.original),
              data: formatCsvData(
                table.getSelectedRowModel().flatRows.map((row) => row.original).length > 0
                  ? table.getSelectedRowModel().flatRows.map((row) => row.original)
                  : data
              ),
              headers,
              filename: `po-list-${Date.now()}.csv`
            }}
          />
        </Stack>
      </Stack>
      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer>
            <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
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
                      );
                    })}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCellWithFilterComponent
                        key={cell.id}
                        {...cell.column.columnDef.meta}
                        onDoubleClick={() => {
                          if (cell.column.id === 'select') return;

                          if (hasPermission('DRAFT_PO_UPDATE') && row.original.canEdit) {
                            navigation(`/po/edit/${row.original.id}`);
                          } else if (hasPermission('DRAFT_PO_VIEW')) {
                            navigation(`/po/view/${row.original.id}`, {
                              state: {
                                isView: true,
                                code: row.original.contractCode
                              }
                            });
                          }
                        }}
                      >
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

export default function POList() {
  const router = useRouter();
  const intl = useIntl();
  const { hasPermission } = useRole();

  // Safe useGlobal hook with error handling
  let configs: any[] = [];
  let getGoodNameById: any = () => '';
  let qualityTypesData: any[] = [];
  try {
    const globalContext = useGlobal();
    configs = globalContext.configs || [];
    getGoodNameById = globalContext.getGoodNameById || (() => '');
    qualityTypesData = configs && configs.length > 0 ? mapGoodTypesFromConfig(configs) : [];
  } catch (error) {
    console.warn('GlobalProvider not ready yet:', error);
    // Use empty arrays and default functions as fallback
    configs = [];
    getGoodNameById = () => '';
    qualityTypesData = [];
  }

  const [poId, setPoId] = useState(0);
  const [selectedDraftPo, setSelectedDraftPo] = useState<Dynamic | undefined>(undefined);
  const [alertOpen, setAlertOpen] = useState(false);
  const [listPO, setListpo] = useState<Dynamic[]>([]);
  const [totalPage, setTotalPage] = useState<number>(0);

  // Count state moved from ReactTable to parent component
  const [countListPO, setCountListPO] = useState({
    ALL: 0,
    INACTIVE: 0,
    ACTIVE: 0,
    PENDING: 0,
    APPROVED: 0
  });

  const pageRef = useRef(0);

  const getListPO = async (
    page: number = PAGE_SIZE,
    size: number = PAGE_LIMIT,
    key_search: string = '',
    key_sort: string = '',
    key_sort_direction: string = '',
    key_active: string | number
  ) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', (page + 1).toString());
      params.append('size', size.toString());
      if (key_active !== '' && key_active !== undefined) {
        params.append('Status', key_active.toString());
      }
      if (key_search) {
        params.append('ContractCode', key_search);
      }
      if (key_sort) {
        params.append('sortBy', key_sort);
      }
      if (key_sort_direction) {
        params.append('SortDirection', key_sort_direction);
      }

      const { data, status } = await axiosServices.get(PO_API.GET_PAGE + `?${params.toString()}`);
      if (status === 200 || status === 201) {
        const formatData: Dynamic[] = data.data?.map((item: PO) => {
          const {
            id,
            createdAt,
            code,
            contractCode,
            status,
            customerName,
            deliveryLocation,
            importCountry,
            goodId,
            deliveryMethod,
            paymentMethod,
            paymentCurrency,
            unitPrice,
            unitOfMeasure,
            quantity,
            qualityType,
            expectedDelivery,
            businessPlanId,
            contractId,
            canEdit
          } = item || {};
          return {
            expectedDelivery: expectedDelivery,
            // status: formatStatus(status),
            orderDate: moment(createdAt).format('DD/MM/YYYY HH:mm:ss'),
            qualityType: qualityTypesData.find((type) => type.value === qualityType)?.label,
            unitOfMeasure,
            id,
            code,
            contractCode,
            customerName,
            deliveryLocation,
            importCountry,
            goodId,
            deliveryMethod,
            paymentMethod,
            paymentCurrency,
            unitPrice,
            quantity,
            businessPlanId,
            contractId,
            status,
            canEdit
          };
        });
        setListpo(formatData);
        setTotalPage(data.meta.totalPages || 0);

        // Update count from response meta
        if (data.meta?.count) {
          setCountListPO({
            ALL:
              (data.meta.count.activeCount || 0) +
              (data.meta.count.inactiveCount || 0) +
              (data.meta.count.pendingCount || 0) +
              (data.meta.count.approvedCount || 0) +
              (data.meta.count.rejectCount || 0),
            INACTIVE: data.meta.count.inactiveCount || 0,
            ACTIVE: data.meta.count.activeCount || 0,
            PENDING: data.meta.count.pendingCount || 0,
            APPROVED: data.meta.count.approvedCount || 0
          });
        }
      }
    } catch (err) {
      console.log('FETCH FAIL!', err);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axiosServices.delete(PO_API.COMMON + `/${poId}`);
      if (response.status === 200 || response.status === 204) {
        enqueueSnackbar(intl.formatMessage({ id: 'common_delete_success_text' }), {
          autoHideDuration: 3000,
          variant: 'success',
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
        // @ts-ignore
        getListPO(pageRef.current);
        handleClose(false);
      }
    } catch (error) {
      console.error('FETCH FAIL!', error);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        autoHideDuration: 3000,
        variant: 'error',
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };

  const handleClose = (status: boolean) => {
    setAlertOpen(status);
  };

  const getStatusText = useCallback((status: any) => {
    switch (status) {
      case 0:
        return intl.formatMessage({ id: 'inactive_label' });
      case 1:
        return intl.formatMessage({ id: 'active_label' });
      case 2:
        return intl.formatMessage({ id: 'pending_label' });
      case 3:
        return intl.formatMessage({ id: 'approval_label' });
      default:
        return '---';
    }
  }, []);

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
            sx={{
              color: '#1976d2',
              '&.Mui-checked': {
                color: '#1976d2'
              },
              '&.MuiCheckbox-indeterminate': {
                color: '#1976d2'
              }
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
            sx={{
              color: '#1976d2',
              '&.Mui-checked': {
                color: '#1976d2'
              },
              '&.MuiCheckbox-indeterminate': {
                color: '#1976d2'
              }
            }}
          />
        ),
        meta: {
          style: { width: `75px` }
        }
      },
      {
        id: 'contractCode',
        header: intl.formatMessage({ id: 'contract_code_label' }),
        accessorKey: 'contractCode',
        cell: ({ row }) => (
          <Box sx={{ width: COLUMN_WIDTHS.contractCode, minWidth: COLUMN_WIDTHS.contractCode, maxWidth: COLUMN_WIDTHS.contractCode }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <TruncatedCell value={row.original.contractCode} maxLength={15} width={COLUMN_WIDTHS.contractCode - 40} />
              <Tooltip title={intl.formatMessage({ id: 'copy_to_clipboard' })} arrow placement="top">
                <IconButton
                  size="small"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const success = await copyToClipboard(row.original.contractCode || '');
                    if (success) {
                      enqueueSnackbar(intl.formatMessage({ id: 'copied_to_clipboard' }), {
                        variant: 'success',
                        autoHideDuration: 2000,
                        anchorOrigin: { horizontal: 'right', vertical: 'top' }
                      });
                    } else {
                      enqueueSnackbar(intl.formatMessage({ id: 'copy_failed' }), {
                        variant: 'error',
                        autoHideDuration: 2000,
                        anchorOrigin: { horizontal: 'right', vertical: 'top' }
                      });
                    }
                  }}
                  sx={{ width: 24, height: 24, color: 'primary.main' }}
                >
                  <CopyOutlined style={{ fontSize: '12px' }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        ),
        meta: {
          style: {
            width: `${COLUMN_WIDTHS.contractCode}px`,
            minWidth: `${COLUMN_WIDTHS.contractCode}px`,
            maxWidth: `${COLUMN_WIDTHS.contractCode}px`
          }
        }
      },
      {
        id: 'customerName',
        header: intl.formatMessage({ id: 'customer_name_label' }),
        accessorKey: 'customerName',
        cell: ({ row }) => <TruncatedCell value={row.original.customerName} maxLength={15} width={COLUMN_WIDTHS.customerName} />,
        meta: {
          style: {
            width: `${COLUMN_WIDTHS.customerName}px`,
            minWidth: `${COLUMN_WIDTHS.customerName}px`,
            maxWidth: `${COLUMN_WIDTHS.customerName}px`
          }
        }
      },
      {
        id: 'deliveryLocation',
        header: intl.formatMessage({ id: 'delibery_location_label' }),
        accessorKey: 'deliveryLocation',
        cell: ({ row }) => <TruncatedCell value={row.original.deliveryLocation} maxLength={12} width={COLUMN_WIDTHS.deliveryLocation} />,
        meta: {
          style: {
            width: `${COLUMN_WIDTHS.deliveryLocation}px`,
            minWidth: `${COLUMN_WIDTHS.deliveryLocation}px`,
            maxWidth: `${COLUMN_WIDTHS.deliveryLocation}px`
          }
        }
      },
      {
        id: 'importCountry',
        header: intl.formatMessage({ id: 'import_country_label' }),
        accessorKey: 'importCountry',
        cell: ({ row }) => <TruncatedCell value={row.original.importCountry} maxLength={10} width={COLUMN_WIDTHS.importCountry} />,
        meta: {
          style: {
            width: `${COLUMN_WIDTHS.importCountry}px`,
            minWidth: `${COLUMN_WIDTHS.importCountry}px`,
            maxWidth: `${COLUMN_WIDTHS.importCountry}px`
          }
        }
      },
      {
        id: 'goodName',
        header: intl.formatMessage({ id: 'product_name_label' }),
        accessorKey: 'goodId',
        cell: ({ row }) => <TruncatedCell value={getGoodNameById(row.original.goodId)} maxLength={18} width={COLUMN_WIDTHS.goodName} />,
        meta: {
          style: {
            width: `${COLUMN_WIDTHS.goodName}px`,
            minWidth: `${COLUMN_WIDTHS.goodName}px`,
            maxWidth: `${COLUMN_WIDTHS.goodName}px`
          }
        }
      },
      {
        id: 'deliveryMethod',
        header: intl.formatMessage({ id: 'delivery_method_label' }),
        accessorKey: 'deliveryMethod',
        cell: ({ row }) => <TruncatedCell value={row.original.deliveryMethod} maxLength={10} width={COLUMN_WIDTHS.deliveryMethod} />,
        meta: {
          style: {
            width: `${COLUMN_WIDTHS.deliveryMethod}px`,
            minWidth: `${COLUMN_WIDTHS.deliveryMethod}px`,
            maxWidth: `${COLUMN_WIDTHS.deliveryMethod}px`
          }
        }
      },
      {
        id: 'paymentMethod',
        header: intl.formatMessage({ id: 'payment_method_label' }),
        accessorKey: 'paymentMethod',
        cell: ({ row }) => <TruncatedCell value={row.original.paymentMethod} maxLength={10} width={COLUMN_WIDTHS.paymentMethod} />,
        meta: {
          style: {
            width: `${COLUMN_WIDTHS.paymentMethod}px`,
            minWidth: `${COLUMN_WIDTHS.paymentMethod}px`,
            maxWidth: `${COLUMN_WIDTHS.paymentMethod}px`
          }
        }
      },
      {
        id: 'paymentCurrency',
        header: intl.formatMessage({ id: 'currency_label' }),
        accessorKey: 'paymentCurrency',
        cell: ({ row }) => <TruncatedCell value={row.original.paymentCurrency} maxLength={6} width={COLUMN_WIDTHS.paymentCurrency} />,
        meta: {
          style: {
            width: `${COLUMN_WIDTHS.paymentCurrency}px`,
            minWidth: `${COLUMN_WIDTHS.paymentCurrency}px`,
            maxWidth: `${COLUMN_WIDTHS.paymentCurrency}px`
          }
        }
      },
      {
        id: 'unitPrice',
        header: intl.formatMessage({ id: 'unit_price_label' }),
        accessorKey: 'unitPrice',
        meta: {
          className: 'cell-right',
          style: {
            width: `${COLUMN_WIDTHS.unitPrice}px`,
            minWidth: `${COLUMN_WIDTHS.unitPrice}px`,
            maxWidth: `${COLUMN_WIDTHS.unitPrice}px`
          }
        },
        cell: ({ row }) => {
          const priceText = `${row.original.unitPrice.toLocaleString()} (${row.original.paymentCurrency}/${row.original.unitOfMeasure || intl.formatMessage({ id: 'no_identify' })})`;
          return (
            <Box
              sx={{
                textAlign: 'right',
                width: COLUMN_WIDTHS.unitPrice,
                minWidth: COLUMN_WIDTHS.unitPrice,
                maxWidth: COLUMN_WIDTHS.unitPrice
              }}
            >
              <Tooltip title={priceText} arrow placement="top">
                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span>{row.original.unitPrice.toLocaleString()}</span>
                  <span style={{ fontSize: '0.8em', color: '#666' }}>
                    <span style={{ fontSize: '0.8em' }}>
                      {' '}
                      ({row.original.paymentCurrency}/{row.original.unitOfMeasure || intl.formatMessage({ id: 'no_identify' })})
                    </span>
                  </span>
                </Box>
              </Tooltip>
            </Box>
          );
        }
      },
      {
        id: 'quantity',
        header: intl.formatMessage({ id: 'quantity_label' }),
        accessorKey: 'quantity',
        meta: {
          className: 'cell-right',
          style: {
            width: `${COLUMN_WIDTHS.quantity}px`,
            minWidth: `${COLUMN_WIDTHS.quantity}px`,
            maxWidth: `${COLUMN_WIDTHS.quantity}px`
          }
        },
        cell: ({ row }) => {
          const quantityText = `${row.original.quantity.toLocaleString()} ${getKeyFromValue(row.original.unitOfMeasure) || ''}`;
          return (
            <Box
              sx={{
                textAlign: 'right',
                width: COLUMN_WIDTHS.quantity,
                minWidth: COLUMN_WIDTHS.quantity,
                maxWidth: COLUMN_WIDTHS.quantity
              }}
            >
              <Tooltip title={quantityText} arrow placement="top">
                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span>{row.original.quantity.toLocaleString()}</span>
                  <span
                    style={{
                      fontSize: '0.8em',
                      color: '#666'
                    }}
                  >
                    {' '}
                    {getKeyFromValue(row.original.unitOfMeasure) || ''}
                  </span>
                </Box>
              </Tooltip>
            </Box>
          );
        }
      },
      {
        id: 'qualityType',
        header: intl.formatMessage({ id: 'quantity_type_label' }),
        accessorKey: 'qualityType',
        cell: ({ row }) => <TruncatedCell value={row.original.qualityType} maxLength={10} width={COLUMN_WIDTHS.qualityType} />,
        meta: {
          style: {
            width: `${COLUMN_WIDTHS.qualityType}px`,
            minWidth: `${COLUMN_WIDTHS.qualityType}px`,
            maxWidth: `${COLUMN_WIDTHS.qualityType}px`
          }
        }
      },
      {
        id: 'expectedDelivery',
        header: intl.formatMessage({ id: 'expected_delivery_date_label' }),
        accessorKey: 'expectedDelivery',
        cell: ({ row }) => {
          const date = row.original.expectedDelivery;
          let formattedDate = '---';

          if (date) {
            // If the date is already formatted as DD/MM/YYYY, use it as is
            if (typeof date === 'string' && date.includes('/')) {
              formattedDate = date;
            } else {
              // If it's a date object or ISO string, format it as DD/MM/YYYY
              try {
                const dateObj = new Date(date);
                if (!isNaN(dateObj.getTime())) {
                  const day = dateObj.getDate().toString().padStart(2, '0');
                  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                  const year = dateObj.getFullYear();
                  formattedDate = `${day}/${month}/${year}`;
                }
              } catch {
                formattedDate = '---';
              }
            }
          }

          return <TruncatedCell value={formattedDate} maxLength={10} width={COLUMN_WIDTHS.expectedDelivery} />;
        },
        meta: {
          style: {
            width: `${COLUMN_WIDTHS.expectedDelivery}px`,
            minWidth: `${COLUMN_WIDTHS.expectedDelivery}px`,
            maxWidth: `${COLUMN_WIDTHS.expectedDelivery}px`
          }
        }
      },
      // {
      //   id: 'totalAmount',
      //   header: intl.formatMessage({ id: 'total_amount_label' }),
      //   accessorKey: 'totalAmount',
      //   cell: ({ row }) => {
      //     const amount = row.original.totalAmount;
      //     return new Intl.NumberFormat('en-US', {
      //       style: 'currency',
      //       currency: row.original.currency
      //     }).format(amount);
      //   }
      // },
      // {
      //   id: 'paymentStatus',
      //   header: intl.formatMessage({ id: 'payment_status_label' }),
      //   accessorKey: 'paymentStatus',
      //   cell: (cell) => {
      //     switch (cell.getValue()) {
      //       case 'Paid':
      //         return <Chip color="success" label={intl.formatMessage({ id: 'payment_status_done_label' })} size="small" variant="light" />;
      //       case 'Partial':
      //         return <Chip color="warning" label={intl.formatMessage({ id: 'payment_status_partial_label' })} size="small" variant="light" />;
      //       case 'Pending':
      //       default:
      //         return <Chip color="error" label={intl.formatMessage({ id: 'payment_status_notdone_label' })} size="small" variant="light" />;
      //     }
      //   }
      // },
      {
        id: 'status',
        header: intl.formatMessage({ id: 'status_label' }),
        accessorKey: 'status',
        cell: (cell) => {
          const value = cell.getValue() as CommonStatus;
          return (
            <Box sx={{ width: COLUMN_WIDTHS.status, minWidth: COLUMN_WIDTHS.status, maxWidth: COLUMN_WIDTHS.status }}>
              <Chip
                label={getStatusText(value)}
                color={getStatusColor(value)}
                size="medium"
                variant="filled"
                sx={{
                  width: '100%',
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  '& .MuiChip-label': {
                    textAlign: 'center',
                    width: '100%'
                  }
                }}
              />
            </Box>
          );
        },
        meta: {
          style: {
            width: `${COLUMN_WIDTHS.status}px`,
            minWidth: `${COLUMN_WIDTHS.status}px`,
            maxWidth: `${COLUMN_WIDTHS.status}px`
          }
        }
      },
      {
        id: 'actions',
        header: intl.formatMessage({ id: 'action_label' }),
        meta: {
          className: 'cell-center',
          style: {
            width: `${COLUMN_WIDTHS.actions}px`,
            minWidth: `${COLUMN_WIDTHS.actions}px`,
            maxWidth: `${COLUMN_WIDTHS.actions}px`
          }
        },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Box sx={{ width: COLUMN_WIDTHS.actions, minWidth: COLUMN_WIDTHS.actions, maxWidth: COLUMN_WIDTHS.actions }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 1, py: 0.5 }}>
                {/* Delete Icon - Only visible for non-logistic and non-domestic roles */}
                <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PermissionGuard permission='DRAFT_PO_DELETE'>
                    <CustomIconButton
                      tooltip={intl.formatMessage({ id: 'delete_label' })}
                      color="error"
                      size="small"
                      disabled={Number(row.original.status) !== CommonStatus.Inactive}
                      icon={<DeleteOutlined style={{ fontSize: '16px' }} />}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setPoId(row.original.id);
                        setSelectedDraftPo(row.original);
                        setAlertOpen(true);
                      }}
                    />
                  </PermissionGuard>
                </Box>
              </Stack>
            </Box>
          );
        }
      }
    ],
    [router]
  );

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <ReactTable
            {...{
              data: listPO,
              columns,
              totalPage,
              countListPO,
              setCountListPO,
              onCallData: (
                page: number,
                size: number,
                search: string = '',
                sort: string = '',
                sortDirection: any,
                active: string | number
              ) => {
                pageRef.current = page;
                getListPO(page, size, search, sort, sortDirection ? TYPE_ASC_DESC.DESC : TYPE_ASC_DESC.ASC, active);
              }
            }}
          />
          <AlertColumnDelete
            open={alertOpen}
            message={
              <Stack spacing={1}>
                <Typography align="center" variant="h4">
                  Bạn có chắc chắn muốn xoá?
                </Typography>
                <Typography align="center" component="span">
                  Đơn hàng số: <strong>#{selectedDraftPo?.contractCode}</strong>
                </Typography>
                <Typography align="center">Sau khi xoá thì draft po sẽ không thể khôi phục.</Typography>
              </Stack>
            }
            handleClose={handleClose}
            handleDelete={handleDelete}
          />
        </Grid>
      </Grid>
    </>
  );
}
