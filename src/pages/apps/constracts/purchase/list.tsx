import { ChangeEvent, useEffect, useMemo, useState, Fragment, useRef, useCallback } from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router';
import { useIntl } from 'react-intl';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  useReactTable,
  PaginationState
} from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project imports
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import EmptyReactTable from 'pages/tables/react-table/empty';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

// assets
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// @utils
import axiosServices from 'utils/axios';
import { formatNumber, getStatusColor, getTabColor, PurchasePoStatus } from 'utils';

// @constants
import { PURCHASE_CONTRACT_API } from 'api/constants';
import { PAGE_SIZE, PAGE_LIMIT, TYPE_ASC_DESC, LIST_STATUS } from '../../../../constants';
import { Chip } from '@mui/material';
import { useToast } from 'contexts';
import { useBoolean } from 'hooks';
import { PurchaseContract } from 'types/purchase-contract';
import AlertColumnDelete from 'components/AlertColumnDelete';

const fuzzyFilter: FilterFn<PurchaseContract> = (row, columnId, value, addMeta) => {
  // rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // store the ranking info
  addMeta(itemRank);

  // return if the item should be filtered in/out
  return itemRank.passed;
};

interface Props {
  data: PurchaseContract[] | undefined;
  columns: ColumnDef<PurchaseContract>[];
  totalPage: number;
  onCallData: (page: number, size: number, search: string, sort: string, sortDirection: any, active: number | string) => void;
}

interface TableCellWithFilterProps extends TableCellProps {
  filterComponent?: any;
}

// interface Column {
//   filterValue: string | undefined;
//   setFilter: (value: string | undefined) => void;
// }

// interface ExactValueFilterProps {
//   column: Column;
// }

function TableCellWithFilterComponent({ filterComponent, ...props }: TableCellWithFilterProps) {
  return <TableCell {...props} />;
}

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data = [], columns, totalPage, onCallData }: Props) {
  const navigation = useNavigate();
  const intl = useIntl();

  const [activeTab, setActiveTab] = useState(LIST_STATUS[0].id);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: '',
      desc: false
    }
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGE_SIZE,
    pageSize: PAGE_LIMIT
  });

  /* ==== LIST WITHOUT PAGING */
  const [counts, setCounts] = useState({
    ALL: 0,
    INACTIVE: 0,
    ACTIVE: 0,
    PENDING: 0,
    APPROVED: 0
  });
  useEffect(() => {
    const getListPOWithoutPaging = async () => {
      try {
        const { data, status } = await axiosServices.get(PURCHASE_CONTRACT_API.GET_LIST + `/count`);
        if (status === 200 || status === 201) {
          setCounts({
            ALL: data?.data?.totalCount,
            INACTIVE: data?.data?.inactiveCount,
            ACTIVE: data?.data?.activeCount,
            PENDING: data?.data?.pendingCount,
            APPROVED: data?.data?.approveCount
          });
        }
      } catch (err) {
        console.log('FETCH FAIL!', err);
      }
    };
    getListPOWithoutPaging();
  }, []);
  /* END */

  useEffect(() => {
    onCallData(
      pagination.pageIndex,
      pagination.pageSize,
      globalFilter,
      sorting[0]?.id,
      sorting[0]?.desc ? sorting[0]?.desc : '',
      activeTab === 100 ? '' : activeTab
    );
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, sorting[0]?.id, sorting[0]?.desc /* , activeTab */]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      // globalFilter
      pagination
    },
    manualPagination: true,
    pageCount: totalPage,
    enableRowSelection: true,
    // onGlobalFilterChange: setGlobalFilter,
    // getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    globalFilterFn: fuzzyFilter,
    getExpandedRowModel: getExpandedRowModel()
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
        const { buyerName,  code, contractDate, status, purchaseContractPackingPlan } = item || {};
        return {
          buyerName,
          code,
          contractDate: moment(contractDate).isValid()
            ? `${intl.formatMessage({ id: 'date_signed_contract' })} ${moment(contractDate).format('DD/MM/YYYY')}`
            : intl.formatMessage({ id: 'no_identify' }),
          status: intl.formatMessage({ id: LIST_STATUS.find((item) => item.id === status)?.label }),
          purchaseContractPackingPlan: {
            totalQuantity: purchaseContractPackingPlan?.totalQuantity ? formatNumber(purchaseContractPackingPlan?.totalQuantity) : 0,
            totalValue: purchaseContractPackingPlan?.totalValue ? formatNumber(purchaseContractPackingPlan?.totalValue) : 0
          }
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
          // onChange={(e: ChangeEvent<unknown>, value: string) => setActiveTab(Number(value))}
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
          {LIST_STATUS.map((status: { id: number; code: string; label: string }, index: number) => (
            <Tab
              key={`${index}-${status.label}-${status.code}`}
              label={intl.formatMessage({ id: status.label })}
              value={status.id}
              iconPosition="end"
              icon={
                <Chip
                  label={(counts as any)[status.code] || 0}
                  variant="light"
                  size="small"
                  color={getTabColor(status.id)}
                  sx={{ ml: 0.5 }}
                />
              }
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
              navigation(`/contracts/purchase/create`);
            }}
          >
            {intl.formatMessage({ id: 'add_contract' })}
          </Button>
          <CSVExport
            {...{
              data: formatCsvData(
                table.getSelectedRowModel().flatRows.map((row) => row.original).length > 0
                  ? table.getSelectedRowModel().flatRows.map((row) => row.original)
                  : data
              ),
              headers,
              filename: 'contract-list-po-buy.csv'
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
                    <TableRow onClick={row.getToggleExpandedHandler()} sx={{ cursor: 'pointer' }}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCellWithFilterComponent key={cell.id} {...cell.column.columnDef.meta}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCellWithFilterComponent>
                      ))}
                    </TableRow>
                    {/* {row.getIsExpanded() && (
                      <TableRow
                        sx={(theme) => ({
                          bgcolor: alpha(theme.palette.primary.lighter, 0.1),
                          '&:hover': { bgcolor: `${alpha(theme.palette.primary.lighter, 0.1)} !important` }
                        })}
                      >
                        <TableCell colSpan={row.getVisibleCells().length}>
                          <ContractDetail data={row.original} />
                        </TableCell>
                      </TableRow>
                    )} */}
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
  );
}

// ==============================|| CONTRACT LIST ||============================== //

export default function ContractPurchaseList() {
  const navigation = useNavigate();
  const intl = useIntl();
  const toast = useToast();

  const [contractId, setContractId] = useState<string>('');
  const [deleteId, setDeleteId] = useState<number>(0);
  const alertOpen = useBoolean();
  const loading = useBoolean();
  const [list, setList] = useState<PurchaseContract[]>();
  const [totalPage, setTotalPage] = useState<number>(0);

  const pageRef = useRef(0);

  const fetchGetListPurchaseContract = async (
    page: number = PAGE_SIZE,
    size: number = PAGE_LIMIT,
    key_search: string = '',
    key_sort: string = '',
    key_sort_direction: string = '',
    key_active: string | number
  ) => {
    try {
      const { data, status } = await axiosServices.get(
        PURCHASE_CONTRACT_API.GET_LIST +
          `/page` +
          `?page=${page + 1}&size=${size}&Status=${key_active}&Code=${key_search}&sortBy=${key_sort}&SortDirection=${key_sort_direction}`
      );
      if (status === 200 || status === 201) {
        setTotalPage(data.meta.totalPages || 0);
        setList(data.data);
      }
    } catch {
      toast.error(intl.formatMessage({ id: 'common_error_text' }));
    } finally {
      loading.onFalse();
    }
  };

  const fetchDeleteContract = useCallback(async () => {
    try {
      const response = await axiosServices.delete(PURCHASE_CONTRACT_API.DELETE + `/${deleteId}`);
      if (response.status === 200 || response.status === 204) {
        toast.success(intl.formatMessage({ id: 'common_delete_success_text' }));

        await fetchGetListPurchaseContract(pageRef.current, PAGE_LIMIT, '', '', '', '');
      }
    } catch (error) {
      console.log('FETCH FAIL!', error);
      toast.error(intl.formatMessage({ id: 'common_error_text' }));
    } finally {
      alertOpen.onFalse();
    }
  }, [deleteId]);

  const getStatusText = useCallback((status: PurchasePoStatus) => {
    const STATUSES_TEXT: Record<PurchasePoStatus, string> = {
      [PurchasePoStatus.Inactive]: intl.formatMessage({ id: 'inactive_label' }),
      [PurchasePoStatus.Active]: intl.formatMessage({ id: 'active_label' }),
      [PurchasePoStatus.Pending]: intl.formatMessage({ id: 'pending_label' }),
      [PurchasePoStatus.Approval]: intl.formatMessage({ id: 'approval_label' })
    };

    return STATUSES_TEXT[status];
  }, []);

  const columns = useMemo<ColumnDef<PurchaseContract>[]>(
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
        header: intl.formatMessage({ id: 'code_contract' }),
        accessorKey: 'code'
      },
      {
        header: intl.formatMessage({ id: 'buyer_name' }),
        accessorKey: 'buyerName'
      },
      {
        header: intl.formatMessage({ id: 'date_signed_contract' }),
        accessorKey: 'contractDate',
        cell: ({ cell }) =>
          moment(cell.getValue() as string).isValid()
            ? moment(cell.getValue() as string).format('DD/MM/YYYY')
            : intl.formatMessage({ id: 'no_identify' })
      },
      {
        header: intl.formatMessage({ id: 'total_quantity' }),
        accessorKey: 'purchaseContractPackingPlan.totalQuantity',
        cell: ({ cell }) => (cell.getValue() ? formatNumber(cell.getValue()) : '---')
      },
      {
        header: intl.formatMessage({ id: 'total_money' }),
        accessorKey: 'purchaseContractPackingPlan.totalValue',
        cell: ({ cell }) => (cell.getValue() ? formatNumber(cell.getValue()) : '---')
      },
      {
        header: intl.formatMessage({ id: 'status_label' }),
        accessorKey: 'status',
        cell: (cell) => {
          const value = cell.getValue() as PurchasePoStatus;
          return <Chip label={getStatusText(value)} color={getStatusColor(value)} size="small" />;
        }
      },
      {
        header: intl.formatMessage({ id: 'action' }),
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Tooltip title={intl.formatMessage({ id: 'preview_label' })}>
                <IconButton
                  color="secondary"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    navigation(`/contracts/purchase/view/${row.original.id}`, { state: { code: row.original.code } });
                  }}
                >
                  <EyeOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title={intl.formatMessage({ id: 'edit_label' })}>
                <IconButton
                  color="primary"
                  disabled={row.original.status === PurchasePoStatus.Inactive}
                  onClick={(e: any) => {
                    e.stopPropagation();
                    navigation(`/contracts/purchase/edit/${row.original.id}`, { state: { code: row.original.code } });
                  }}
                >
                  <EditOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title={intl.formatMessage({ id: 'delete_label' })}>
                <IconButton
                  color="error"
                  disabled={row.original.status === PurchasePoStatus.Inactive}
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setContractId(row.original.code);
                    setDeleteId(row.original.id);
                    alertOpen.onTrue();
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

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          {loading.value ? (
            <EmptyReactTable />
          ) : (
            <ReactTable
              {...{
                data: list,
                columns,
                totalPage,
                onCallData: async (
                  page: number,
                  size: number,
                  search: string = '',
                  sort: string = '',
                  sortDirection: any,
                  active: string | number
                ) => {
                  pageRef.current = page;
                  await fetchGetListPurchaseContract(
                    page,
                    size,
                    search,
                    sort,
                    sortDirection ? TYPE_ASC_DESC.DESC : TYPE_ASC_DESC.ASC,
                    active
                  );
                }
              }}
            />
          )}
          <AlertColumnDelete
            title={intl.formatMessage({ id: 'contract_label' }, { value: contractId })}
            open={alertOpen.value}
            handleClose={alertOpen.onFalse}
            handleDelete={() => fetchDeleteContract()}
          />
        </Grid>
      </Grid>
    </>
  );
}

// ==============================|| CONTRACT DETAIL COMPONENT ||============================== //

// interface ContractDetailProps {
//   data: PurchaseContract;
// }

// function ContractDetail({ data }: ContractDetailProps) {
//   const theme = useTheme();

//   // Calculate completion percentage
//   const completionPercentage = ((data.shippedQuantity / data.quantity) * 100).toFixed(1);

//   // Pie chart data
//   const chartOptions = {
//     chart: {
//       type: 'pie' as const,
//       height: 350
//     },
//     labels: ['Đã xuất', 'Còn lại'],
//     colors: [theme.palette.primary.main, theme.palette.warning.main],
//     legend: {
//       position: 'bottom' as const,
//       horizontalAlign: 'center' as const,
//       fontSize: '14px',
//       fontFamily: theme.typography.fontFamily,
//       labels: {
//         colors: theme.palette.text.primary
//       }
//     },
//     dataLabels: {
//       enabled: true,
//       formatter: function (val: number) {
//         return val.toFixed(1) + '%';
//       },
//       style: {
//         fontSize: '14px',
//         fontWeight: 'bold',
//         colors: ['#fff']
//       }
//     },
//     plotOptions: {
//       pie: {
//         donut: {
//           size: '60%',
//           labels: {
//             show: true,
//             total: {
//               show: true,
//               label: 'Tổng số lượng',
//               fontSize: '16px',
//               fontWeight: 600,
//               color: theme.palette.text.primary,
//               formatter: function () {
//                 return data.quantity.toLocaleString();
//               }
//             },
//             value: {
//               show: true,
//               fontSize: '24px',
//               fontWeight: 700,
//               color: theme.palette.primary.main
//             }
//           }
//         }
//       }
//     },
//     responsive: [{
//       breakpoint: 480,
//       options: {
//         chart: {
//           width: 280,
//           height: 280
//         },
//         legend: {
//           position: 'bottom' as const
//         }
//       }
//     }]
//   };

//   const chartSeries = [data.shippedQuantity, data.remainingQuantity];

//   return (
//     <Stack spacing={3} sx={{ p: 2.5 }}>
//       <Typography variant="h6">Tóm tắt kế hoạch đóng hàng - {data.contractNumber}</Typography>

//       {/* Main content with pie chart and planned shipments */}
//       <Grid container spacing={3}>
//         {/* Left side - Pie Chart */}
//         <Grid size={{ xs: 12, md: 5 }}>
//           <MainCard>
//             <Stack spacing={2} sx={{ alignItems: 'center' }}>
//               <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 1 }}>
//                 Tiến độ thực hiện ({completionPercentage}%)
//               </Typography>
//               <Box sx={{ width: '100%', maxWidth: 350 }}>
//                 <ReactApexChart
//                   options={chartOptions}
//                   series={chartSeries}
//                   type="donut"
//                   height={320}
//                 />
//               </Box>
//               {/* Additional stats */}
//               <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
//                 <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
//                   <Typography variant="h6" color="primary.main">
//                     {data.shippedQuantity.toLocaleString()}
//                   </Typography>
//                 </Stack>
//                 <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
//                   <Typography variant="h6" color="warning.main">
//                     {data.remainingQuantity.toLocaleString()}
//                   </Typography>
//                 </Stack>
//               </Stack>
//             </Stack>
//           </MainCard>
//         </Grid>

//         {/* Right side - Planned Shipments */}
//         <Grid size={{ xs: 12, md: 7 }}>
//           <MainCard>
//             <Stack spacing={2}>
//               <Typography variant="subtitle1">
//                 Kế hoạch xuất hàng
//               </Typography>
//               <TableContainer>
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Ngày xuất</TableCell>
//                       <TableCell align="center">Số lượng dự kiến</TableCell>
//                       <TableCell align="center">Số lượng thực tế</TableCell>
//                       <TableCell align="center">Trạng thái</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {data.plannedShipments.map((shipment, index) => (
//                       <TableRow key={index}>
//                         <TableCell>
//                           {new Date(shipment.shipmentDate).toLocaleDateString('vi-VN')}
//                         </TableCell>
//                         <TableCell align="center">
//                           {shipment.plannedQuantity.toLocaleString()}
//                         </TableCell>
//                         <TableCell align="center">
//                           {shipment.actualQuantity ? shipment.actualQuantity.toLocaleString() : '-'}
//                         </TableCell>
//                         <TableCell align="center">
//                           {shipment.status === 'Completed' && (
//                             <Chip color="success" label="Hoàn thành" size="small" variant="light" />
//                           )}
//                           {shipment.status === 'Shipped' && (
//                             <Chip color="info" label="Đã xuất" size="small" variant="light" />
//                           )}
//                           {shipment.status === 'Pending' && (
//                             <Chip color="warning" label="Chờ xuất" size="small" variant="light" />
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             </Stack>
//           </MainCard>
//         </Grid>
//       </Grid>
//     </Stack>
//   );
// }
