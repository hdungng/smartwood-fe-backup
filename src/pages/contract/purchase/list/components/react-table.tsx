import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  HeaderGroup,
  PaginationState,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import { PurchaseContractDetailResponse } from 'services/contract';
import { SortDirection } from 'services/core';
import { useIntl } from 'react-intl';
import { useRouter } from 'hooks';
import { ChangeEvent, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { LabelKeyObject } from 'react-csv/lib/core';
import moment from 'moment/moment';
import { CommonStatus, formatNumber, getTabColor } from 'utils';
import MainCard from 'components/MainCard';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import { CSVExport, DebouncedInput, HeaderSort, RowSelection, TablePagination } from 'components/third-party/react-table';
import Button from '@mui/material/Button';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { routing } from 'routes/routing';
import ScrollX from 'components/ScrollX';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import Divider from '@mui/material/Divider';
import TableCell from '@mui/material/TableCell';
import { PAGE_LIMIT, PAGE_SIZE } from '../../../../../constants';
import ContractDetail from './contract-detail';
import { alpha } from '@mui/material/styles';
import { Tab } from '@mui/material';
import Chip from '@mui/material/Chip';
import { useRole } from 'contexts/RoleContext';
import { PermissionGuard } from 'components/guards';

type Props = {
  data: PurchaseContractDetailResponse[] | undefined;
  columns: ColumnDef<PurchaseContractDetailResponse>[];
  totalPage: number;
  onCallData: (page: number, size: number, search: string, sort: string, sortDirection: SortDirection, status?: number) => void;
  counts?: Record<string, number>;
};

const CONTRACT_PURCHASE_STATUS = [
  {
    id: CommonStatus.All,
    key: 'all',
    label: 'Tất cả',
    color: 'default'
  },
  {
    id: CommonStatus.Active,
    key: 'active',
    label: 'Hoạt động',
    color: 'success'
  },
  {
    id: CommonStatus.Approved,
    key: 'approved',
    label: 'Đã duyệt',
    color: 'info'
  },
  {
    id: CommonStatus.RequestApproval,
    key: 'requestApprove',
    label: 'Yêu cầu phê duyệt',
    color: 'default'
  },

  {
    id: CommonStatus.Rejected,
    key: 'rejected',
    label: 'Từ chối',
    color: 'error'
  }
];

const ReactTable = ({ data = [], counts, columns, totalPage, onCallData }: Props) => {
  const { hasPermission } = useRole();
  const intl = useIntl();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(CONTRACT_PURCHASE_STATUS[0].id);
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

  useEffect(() => {
    onCallData(
      pagination.pageIndex,
      pagination.pageSize,
      globalFilter,
      sorting[0]?.id,
      sorting[0]?.desc ? 'desc' : 'asc',
      activeTab === 100 ? undefined : activeTab
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
    getExpandedRowModel: getExpandedRowModel()
  });

  const headers: LabelKeyObject[] = [];
  columns.map(
    (columns) =>
      // @ts-expect-error Type 'string | undefinedz' is not assignable to type 'string'.
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
        const { buyerName, sellerName, code, contractDate, status, purchaseContractPackingPlan } = item || {};
        return {
          buyerName,
          sellerName,
          code,
          contractDate: moment(contractDate).isValid()
            ? `${intl.formatMessage({ id: 'date_signed_contract' })} ${moment(contractDate).format('DD/MM/YYYY')}`
            : intl.formatMessage({ id: 'no_identify' }),
          status: CONTRACT_PURCHASE_STATUS.find((item: Dynamic) => item.id === status)?.label,
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

  const groups = useMemo(() => {
    const result: { id: number; label: string; color: string; key: string; value: number }[] = [
      {
        id: 100,
        label: 'Tất cả',
        color: 'primary',
        key: 'all',
        value: 0
      }
    ];

    const countsStatus = counts || {};

    for (let i = 0; i < CONTRACT_PURCHASE_STATUS.length; i++) {
      if (i === 0) {
        continue; // Skip the first item which is 'All'
      }
      const contractPurchaseStatus = CONTRACT_PURCHASE_STATUS[i];
      const statusCount = countsStatus[`${contractPurchaseStatus.key}Count`] || 0;

      result[0] = {
        ...result[0],
        value: (result[0]?.value ?? 0) + statusCount
      };

      result.push({
        ...contractPurchaseStatus,
        value: statusCount
      });
    }

    return result;
  }, [counts]);

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
              sorting[0]?.desc ? 'desc' : 'asc',
              Number(value) === 100 ? undefined : Number(value)
            );
            setActiveTab(Number(value));
          }}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {groups.map((group, index: number) => (
            <Tab
              key={`${index}-${group.label}-${group.key}`}
              label={group.label}
              value={group.id}
              iconPosition="end"
              icon={<Chip label={group.value} variant="light" size="small" color={getTabColor(group.id)} sx={{ ml: 0.5 }} />}
            />
          ))}
        </Tabs>
      </Box>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder="Tìm kiếm theo mã hợp đồng"
          sx={{
            minWidth: 300
          }}
        />

        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
          <PermissionGuard permission="PURCHASE_ORDER_CREATE">
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={(e: any) => {
                e.stopPropagation();
                router.push(routing.contractPurchase.create);
              }}
            >
              Thêm hợp đồng
            </Button>
          </PermissionGuard>
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
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        {...header.column.columnDef.meta}
                        onClick={header.column.getToggleSortingHandler()}
                        {...(header.column.getCanSort() &&
                          !!header.column.columnDef.meta && {
                            className: 'cursor-pointer prevent-select'
                          })}
                      >
                        {header.isPlaceholder ? null : (
                          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                            {header.column.getCanSort() && <HeaderSort column={header.column} />}
                          </Stack>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>

              {table.getRowModel().rows.length > 0 ? (
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <Fragment key={row.id}>
                      <TableRow
                        onClick={row.getToggleExpandedHandler()}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (hasPermission(['PURCHASE_ORDER_UPDATE'])) {
                            router.push(routing.contractPurchase.edit(row.original.id));
                          } else if (hasPermission(['PURCHASE_ORDER_VIEW'])) {
                            router.push(routing.contractPurchase.detail(row.original.id));
                          }
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                      {row.getIsExpanded() && (
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
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={columns.length} sx={{ textAlign: 'center', p: 3 }}>
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
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
};

export default ReactTable;
