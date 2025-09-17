import { ChangeEvent, Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
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
  ExpandedState,
  FilterFn,
  HeaderGroup,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
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
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import FundProjectionScreenOutlined from '@ant-design/icons/FundProjectionScreenOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';

// mock data
import AlertColumnDelete from 'components/AlertColumnDelete';
import { CODE_DESTINATION, CODE_EXPORT_PORT, CODE_UNIT_OF_MEASURE } from 'constants/code';
import { useRole } from 'contexts/RoleContext';
import * as _ from 'lodash';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { actionDeleteContractByID, actionFetchContract, contractSelector } from 'redux/Contract';
import { ContractStatus } from 'redux/Contract/constant';
import { SaleContract, TContractStae } from 'redux/Contract/type';
import { copyToClipboard } from 'utils/clipboard';
import { CURRENCIES } from 'utils/mapCurrenciesFromConfig';
import { PAGE_LIMIT, PAGE_SIZE } from '../../../../constants';
import { useGlobal, useToast } from 'contexts';
import { useConfiguration } from 'hooks';
import { PermissionGuard } from 'components/guards';
import { CustomIconButton } from 'components/buttons';

const fuzzyFilter: FilterFn<SaleContract> = (row, columnId, value, addMeta) => {
  // rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // store the ranking info
  addMeta(itemRank);

  // return if the item should be filtered in/out
  return itemRank.passed;
};

interface TableCellWithFilterProps extends TableCellProps {
  filterComponent?: any;
}

function TableCellWithFilterComponent({ filterComponent, ...props }: TableCellWithFilterProps) {
  return <TableCell {...props} />;
}

type TContractStatusFormat = {
  label: string;
  color: 'primary' | 'error' | 'default' | 'secondary' | 'info' | 'success' | 'warning';
  value: number;
};

function formatDate(date: string) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0'); // 01-31
  const month = String(d.getMonth() + 1).padStart(2, '0'); // 01-12
  const year = d.getFullYear(); // 4-digit year

  return `${day}-${month}-${year}`;
}

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
              display: 'block'
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
            display: 'block'
          }}
        >
          {displayValue}
        </span>
      )}
    </Box>
  );
}

// ==============================|| CONTRACT LIST ||============================== //

export default function ContractSellList() {
  const navigation = useNavigate();
  const { getGoodNameById } = useGlobal();
  const dispatch = useDispatch();
  const intl = useIntl();
  const toast = useToast();
  const { hasPermission } = useRole();

  const { contracts: data, meta, success, error }: TContractStae = useSelector(contractSelector);

  const { mapConfigObject } = useConfiguration();

  const groups: TContractStatusFormat[] = [
    {
      label: 'Tất cả',
      color: 'primary',
      value: -1
    },
    {
      label: 'Hoạt động',
      color: 'success',
      value: ContractStatus.ACTIVE
    },
    {
      label: 'Ngưng hoạt động',
      color: 'error',
      value: ContractStatus.INACTIVE
    }
  ];

  // Use count data from API response instead of calculating from data array
  const counts: Record<number, number> = {
    [-1]: (meta?.count?.activeCount || 0) + (meta?.count?.inactiveCount || 0),
    [ContractStatus.ACTIVE]: meta?.count?.activeCount || 0,
    [ContractStatus.INACTIVE]: meta?.count?.inactiveCount || 0
  };

  const [contractId, setContractId] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(groups[0].value);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGE_SIZE,
    pageSize: PAGE_LIMIT
  });

  useEffect(() => {
    dispatch(
      actionFetchContract({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        ...(sorting?.length > 0 && sorting[0]?.id
          ? {
              sortKey: sorting[0].id
            }
          : {}),
        ...(globalFilter.length > 0
          ? {
              SaleContractCode: globalFilter
            }
          : ''),
        ...(activeTab !== undefined && activeTab !== -1
          ? {
              Status: Number(activeTab)
            }
          : {})
      })
    );
  }, [dispatch, pagination.pageIndex, pagination.pageSize, sorting, globalFilter, columnFilters, activeTab]);

  const handleClose = (status: boolean) => {
    if (status) {
      // Here you would delete the sell contract
      openSnackbar({
        open: true,
        message: 'Sell contract deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    }
    setAlertOpen(false);
  };

  const onHandleDelete = () => {
    dispatch(actionDeleteContractByID(Number(contractId)));

    if (success === true && _.isEmpty(error)) {
      toast.success(intl.formatMessage({ id: 'common_success_text' }));
    }

    if (success === false && !_.isEmpty(error)) {
      toast.error(intl.formatMessage({ id: 'common_error_text' }));
    }

    dispatch(
      actionFetchContract({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        ...(sorting?.length > 0 && sorting[0]?.id
          ? {
              sortKey: sorting[0].id
            }
          : {}),
        ...(globalFilter.length > 0
          ? {
              ContractCode: globalFilter
            }
          : ''),
        ...(activeTab !== undefined && activeTab !== -1
          ? {
              Status: Number(activeTab)
            }
          : {})
      })
    );

    setAlertOpen(false);
  };

  const columns = useMemo<ColumnDef<SaleContract>[]>(
    () => [
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <IconButton
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: { cursor: 'pointer' }
              }}
            >
              {row.getIsExpanded() ? <DownOutlined /> : <RightOutlined />}
            </IconButton>
          ) : null;
        }
      },
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
        id: 'saleContractCode',
        header: 'Mã hợp đồng bán',
        accessorKey: 'saleContractCode',
        cell: ({ row }) => {
          const saleContractCode = row?.original?.saleContractCode;
          return (
            <Box sx={{ width: 180, minWidth: 180, maxWidth: 180 }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <TruncatedCell value={saleContractCode} maxLength={20} width={140} />
                {saleContractCode && (
                  <Tooltip title={intl.formatMessage({ id: 'copy_to_clipboard' })} arrow placement="top">
                    <IconButton
                      size="small"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const success = await copyToClipboard(saleContractCode);
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
                )}
              </Stack>
            </Box>
          );
        }
      },
      {
        id: 'contractDate',
        header: 'Ngày hợp đồng',
        accessorKey: 'contractDate',
        cell: ({ row }) => {
          return row.original.contractDate ? formatDate(row.original.contractDate) : 'N/A';
        }
      },
      {
        id: 'goodName',
        header: 'Tên hàng hóa',
        accessorKey: 'goodId',
        cell: ({ row }) => {
          const contract = row.original as any;
          const goodId = contract.goodId;
          const goodType = contract.goodType;
          const goodName = getGoodNameById(goodId);
          return (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {goodName || 'N/A'}
              </Typography>
              {goodType && (
                <Typography variant="caption" color="text.secondary">
                  Loại: {goodType}
                </Typography>
              )}
            </Box>
          );
        }
      },
      {
        id: 'unitPrice',
        header: 'Đơn giá',
        accessorKey: 'unitPrice',
        cell: ({ row }) => {
          const contract = row.original as any;
          const unitPrice = contract.unitPrice;
          const currency = contract.currency;
          return (
            <Typography variant="body1">
              {unitPrice ? `${unitPrice.toLocaleString()} ${CURRENCIES?.[currency]?.symbol ?? currency ?? ''}` : 'N/A'}
            </Typography>
          );
        }
      },
      {
        id: 'totalWeight',
        header: 'Tổng khối lượng',
        accessorKey: 'totalWeight',
        cell: ({ row }) => {
          const contract = row.original as any;
          const totalWeight = contract.totalWeight;
          const unit = contract.unit;
          const tolerancePercentage = contract.tolerancePercentage;
          return (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {totalWeight && unit ? `${totalWeight.toLocaleString()} ${mapConfigObject(CODE_UNIT_OF_MEASURE, unit)}` : 'N/A'}
              </Typography>
              {tolerancePercentage && (
                <Typography variant="caption" color="text.secondary">
                  Sai số: ±{tolerancePercentage}%
                </Typography>
              )}
            </Box>
          );
        }
      },
      {
        id: 'weightPerContainer',
        header: 'KL/Container',
        accessorKey: 'weightPerContainer',
        cell: ({ row }) => {
          const contract = row.original as any;
          const weightPerContainer = contract.weightPerContainer;
          const unit = contract.unit;
          return (
            <Typography variant="body1">
              {weightPerContainer && unit ? `${weightPerContainer} ${mapConfigObject(CODE_UNIT_OF_MEASURE, unit)}` : 'N/A'}
            </Typography>
          );
        }
      },
      {
        id: 'lcInfo',
        header: 'Thông tin về LC',
        accessorKey: 'lcNumber',
        cell: ({ row }) => {
          return (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {row.original.lcNumber || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.original.lcDate ? formatDate(row.original.lcDate) : 'N/A'}
              </Typography>
            </Box>
          );
        }
      },
      {
        id: 'status',
        header: 'Trạng thái',
        accessorKey: 'status',
        cell: (cell) => {
          const format = groups.find((group) => group.value === cell.getValue());
          return <Chip color={format?.color} label={format?.label} size="small" variant="light" />;
        }
      },
      {
        id: 'actions',
        header: 'Thao tác',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <PermissionGuard permission="SALE_CONTRACT_DELETE">
                <CustomIconButton
                  color="error"
                  icon={<DeleteOutlined />}
                  tooltip="Xóa"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setContractId(row.original.id);
                    setAlertOpen(true);
                  }}
                />
              </PermissionGuard>
            </Stack>
          );
        }
      }
    ],
    [navigation, intl, mapConfigObject]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      // globalFilter,
      expanded,
      pagination
    },
    enableRowSelection: true,
    enableExpanding: true,
    manualPagination: true,
    pageCount: meta.totalPages,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    globalFilterFn: fuzzyFilter
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

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <MainCard content={false}>
            <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
              <Tabs
                value={activeTab}
                onChange={(e: ChangeEvent<unknown>, value: number) => setActiveTab(value)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                {groups.map((group, index: number) => (
                  <Tab
                    key={index}
                    label={group.label}
                    value={group.value}
                    icon={<Chip label={counts?.[group.value] ?? 0} color={group.color} variant="light" size="small" />}
                    iconPosition="end"
                  />
                ))}
              </Tabs>
            </Box>
            <Stack
              direction="row"
              sx={{
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2.5
              }}
            >
              <DebouncedInput
                value={globalFilter ?? ''}
                onFilterChange={(value) => setGlobalFilter(String(value))}
                placeholder={intl.formatMessage({ id: 'search_by_contract_code' }, { value: data.length })}
              />

              <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                <SelectColumnSorting
                  {...{
                    getState: table.getState,
                    getAllColumns: table.getAllColumns,
                    setSorting
                  }}
                />
                <PermissionGuard permission="SALE_CONTRACT_CREATE">
                  <Button
                    variant="contained"
                    startIcon={<PlusOutlined />}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      navigation(`/contracts/sales/create`);
                    }}
                  >
                    {intl.formatMessage({ id: 'contract_add' })}
                  </Button>
                </PermissionGuard>
                <CSVExport
                  {...{
                    data: table.getSelectedRowModel().flatRows.map((row) => row.original),
                    headers,
                    filename: 'sell-contracts-list.csv'
                  }}
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
                        <Fragment key={row.id}>
                          <TableRow
                            onDoubleClick={() => {
                              // For Sales role, navigate to edit page
                              if (hasPermission('SALE_CONTRACT_UPDATE')) {
                                navigation(`/contracts/sales/edit/${row.original.id}`, {
                                  state: {
                                    isView: false,
                                    code: row.original.code
                                  }
                                });
                              } else if (hasPermission('SALE_CONTRACT_VIEW')) {
                                // For other roles, navigate to view page
                                navigation(`/contracts/sales/view/${row.original.id}`, {
                                  state: {
                                    isView: true,
                                    code: row.original.code
                                  }
                                });
                              }
                            }}
                            sx={{ cursor: 'pointer' }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCellWithFilterComponent key={cell.id} {...cell.column.columnDef.meta}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCellWithFilterComponent>
                            ))}
                          </TableRow>
                          {row.getIsExpanded() && (
                            <TableRow>
                              <TableCell colSpan={row.getVisibleCells().length} sx={{ py: 0 }}>
                                <Collapse in={row.getIsExpanded()} timeout="auto" unmountOnExit>
                                  <Box sx={{ margin: 1, width: '100%', overflowX: 'auto' }}>
                                    <Typography variant="h6" gutterBottom component="div">
                                      Chi tiết booking
                                    </Typography>
                                    <Table size="small" aria-label="booking-details" sx={{ tableLayout: 'fixed', width: '100%' }}>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell sx={{ width: '12%' }}>Mã booking</TableCell>
                                          <TableCell sx={{ width: '12%' }}>Tên tàu</TableCell>
                                          <TableCell sx={{ width: '12%' }}>Hãng tàu</TableCell>
                                          <TableCell sx={{ width: '10%' }}>Số container</TableCell>
                                          <TableCell sx={{ width: '15%' }}>Cảng xuất</TableCell>
                                          <TableCell sx={{ width: '15%' }}>Cảng nhập</TableCell>
                                          <TableCell sx={{ width: '10%' }}>ETD</TableCell>
                                          <TableCell sx={{ width: '10%' }}>ETA</TableCell>
                                          <TableCell sx={{ width: '4%', textAlign: 'center' }}>Thao tác</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {(row.original as any).codeBookings?.map((booking: any) => (
                                          <TableRow key={booking.id}>
                                            <TableCell sx={{ width: '12%' }}>
                                              <Typography variant="body1" fontWeight="bold" color="primary">
                                                {booking.codeBooking || 'N/A'}
                                              </Typography>
                                            </TableCell>
                                            <TableCell sx={{ width: '12%' }}>
                                              <Typography variant="body1">{booking.shipName || 'N/A'}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ width: '12%' }}>
                                              <Typography variant="body1">{booking.shippingLine || 'N/A'}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ width: '10%' }}>
                                              <Typography variant="body1">
                                                {booking.containerQuantity ? booking.containerQuantity.toLocaleString() : 'N/A'}
                                              </Typography>
                                            </TableCell>
                                            <TableCell sx={{ width: '15%' }}>
                                              <Typography variant="body1">
                                                {mapConfigObject(CODE_EXPORT_PORT, booking.exportPort) || 'N/A'}
                                              </Typography>
                                            </TableCell>
                                            <TableCell sx={{ width: '15%' }}>
                                              <Typography variant="body1">
                                                {mapConfigObject(CODE_DESTINATION, booking.importPort) || 'N/A'}
                                              </Typography>
                                            </TableCell>
                                            <TableCell sx={{ width: '10%' }}>
                                              <Typography variant="body1">
                                                {booking.etdDate ? formatDate(booking.etdDate) : 'N/A'}
                                              </Typography>
                                            </TableCell>
                                            <TableCell sx={{ width: '10%' }}>
                                              <Typography variant="body1">
                                                {booking.etaDate ? formatDate(booking.etaDate) : 'N/A'}
                                              </Typography>
                                            </TableCell>
                                            <TableCell sx={{ width: '4%', textAlign: 'center' }}>
                                              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
                                                <PermissionGuard permission="SALE_CONTRACT_UPDATE">
                                                  <CustomIconButton
                                                    color="info"
                                                    tooltip="Xuất cân"
                                                    size="medium"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      navigation(
                                                        `/contracts/sales/weighing-slip-export/${row.original.id}?bookingId=${booking.id}`
                                                      );
                                                    }}
                                                    icon={<FundProjectionScreenOutlined />}
                                                  />
                                                </PermissionGuard>
                                              </Stack>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
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
          <AlertColumnDelete
            title={`Sell Contract #${contractId}`}
            open={alertOpen}
            handleClose={handleClose}
            handleDelete={onHandleDelete}
          />
        </Grid>
      </Grid>
    </>
  );
}
