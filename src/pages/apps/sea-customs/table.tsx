import { ChangeEvent, Fragment, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
// third-party
import {
  ColumnFiltersState,
  HeaderGroup,
  SortingFn,
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
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  RowSelection,
  SelectColumnSorting,
  SelectColumnVisibility,
  TablePagination
} from 'components/third-party/react-table';
// types
// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { Props, TabCounts, TableRowData } from './models';
import { CircularProgress } from '@mui/material';
import type { ColumnMeta } from '@tanstack/react-table';
import React from 'react';
import { formatDate } from 'utils/formatDate';
import { getCsvHeaders } from './columns';
const statusOrder = ['Thất bại', 'Chờ duyệt', 'Hoàn thành'];

const statusSortingFn: SortingFn<TableRowData> = (rowA, rowB, columnId) => {
  const statusA = rowA.getValue<string>(columnId);
  const statusB = rowB.getValue<string>(columnId);

  const indexA = statusOrder.indexOf(statusA);
  const indexB = statusOrder.indexOf(statusB);

  if (indexA === -1 && indexB === -1) return 0;
  if (indexA === -1) return 1;
  if (indexB === -1) return -1;

  return indexA - indexB;
};

export function ReactTable({
  data,
  columns,
  meta,
  page,
  size,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  tabCounts,
  loading,
  error,
  sorting,
  setSorting
}: Props & {
  meta: any;
  page: number;
  size: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  tabCounts: TabCounts | null;
  loading: boolean;
  error: string | null;
  sorting: SortingState;
  setSorting: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
}) {
  const navigation = useNavigate();
  const csvHeaders = getCsvHeaders();

  const [contractTypeFilter, setContractTypeFilter] = useState<string>('All');
  const [poTypeFilter, setPoTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // const [sorting, setSorting] = useState<SortingState>([
  //   {
  //     id: 'status',
  //     desc: false
  //   }
  // ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const processedData = useMemo(() => {
    let filtered = data;

    if (searchQuery) {
      const normalizeString = (str: string | undefined | null): string => {
        if (!str) return '';
        return str.toLowerCase().replace(/\s/g, '').trim().trimEnd().trimStart();
      };

      const normalizedQuery = normalizeString(searchQuery);

      filtered = filtered
        .map((saleContract) => {
          const isParentMatch =
            normalizeString(saleContract.saleContractCode).includes(normalizedQuery) ||
            normalizeString(saleContract.saleContractName).includes(normalizedQuery) ||
            normalizeString(saleContract.customerCode).includes(normalizedQuery) ||
            normalizeString(saleContract.customerAddress).includes(normalizedQuery) ||
            normalizeString(saleContract.customerPhone).includes(normalizedQuery);

          const matchingSubRows =
            saleContract.subRows?.filter((booking) => {
              const normalizedBookingNumber = normalizeString(booking.bookingNumber);
              const normalizedProductName = normalizeString(booking.productName);

              const isMatch = normalizedBookingNumber.includes(normalizedQuery) || normalizedProductName.includes(normalizedQuery);

              return isMatch;
            }) || [];

          if (isParentMatch) {
            return saleContract;
          }

          if (matchingSubRows.length > 0) {
            return { ...saleContract, subRows: matchingSubRows };
          }

          return null;
        })
        .filter((saleContract): saleContract is TableRowData => saleContract !== null);
    }

    if (contractTypeFilter !== 'All') {
      filtered = filtered.filter((row) => row.contractType === contractTypeFilter);
    }

    if (poTypeFilter !== 'All') {
      filtered = filtered
        .map((saleContract) => {
          const filteredSubRows = saleContract.subRows?.filter((booking) => booking.bookingType === poTypeFilter);
          if (filteredSubRows && filteredSubRows.length > 0) {
            return { ...saleContract, subRows: filteredSubRows };
          }
          return null;
        })
        .filter((saleContract) => saleContract !== null) as TableRowData[];
    }

    if (statusFilter !== 'All') {
      filtered = filtered.slice().sort((a, b) => {
        const aHasMatchingStatus = a.subRows?.some((booking) => booking.status === statusFilter) ?? false;
        const bHasMatchingStatus = b.subRows?.some((booking) => booking.status === statusFilter) ?? false;

        if (aHasMatchingStatus && !bHasMatchingStatus) return -1;
        if (!bHasMatchingStatus && aHasMatchingStatus) return 1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchQuery, contractTypeFilter, poTypeFilter, statusFilter]);

  const tabConfig = [
    { label: 'Tất cả', value: 'All', color: 'primary', countKey: 'totalCount' },
    { label: 'Hoàn thành', value: 'Hoàn thành', apiStatus: 3, color: 'success', countKey: 'approvedCount' },
    { label: 'Chờ duyệt', value: 'Chờ duyệt', apiStatus: 2, color: 'warning', countKey: 'pendingCount' },
    { label: 'Thất bại', value: 'Thất bại', apiStatus: 4, color: 'error', countKey: 'rejectedCount' }
  ];

  const table = useReactTable({
    data: processedData,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      // globalFilter: searchQuery,
      pagination: {
        pageIndex: page,
        pageSize: size
      }
    },
    manualPagination: true,
    pageCount: meta?.totalPages ?? -1,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater({ pageIndex: page, pageSize: size }) : updater;
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set('page', newPagination.pageIndex.toString());
      currentParams.set('size', newPagination.pageSize.toString());
      navigation({ search: currentParams.toString() });
    },
    sortingFns: {
      status: statusSortingFn
    },
    enableRowSelection: true,
    enableExpanding: true,
    manualSorting: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    // onGlobalFilterChange: setSearchQuery,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: (row) => !!row.original?.subRows?.length,
    getSubRows: (row) => row.subRows,
    //getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // globalFilterFn: fuzzyFilter,
    debugTable: true
    // state: {
    //   sorting
    // }
  });

  const headers: LabelKeyObject[] = table
    .getAllColumns()
    .filter((column) => column.columnDef.meta?.csvLabel && column.columnDef.meta?.csvCanGetValue)
    .map((column) => ({
      label: column.columnDef.meta?.csvLabel && column.columnDef.meta?.csvCanGetValue ? column.columnDef.meta.csvLabel : column.id,
      key: column.id
    }));

  const selectedRows = table.getSelectedRowModel().flatRows.map((row) => row.original);

  const flattenData = selectedRows.flatMap((row) => {
    const baseRow = { ...row };
    delete baseRow.subRows;

    if (row.subRows && row.subRows.length > 0) {
      const subRowData = row.subRows.map((sub) => ({
        ...baseRow,
        ...sub,
        isSubRow: true
      }));
      return [baseRow, ...subRowData];
    }

    return [baseRow];
  });

  // Trong ReactTable component
  const csvData = useMemo(() => {
    const selectedRows = table.getSelectedRowModel().flatRows.map((row) => row.original);

    const formatValue = (value: any, isCurrency = false, isQuantity = false) => {
      if (value === null || value === undefined) return '';
      if (isCurrency) return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
      if (isQuantity) return new Intl.NumberFormat('vi-VN').format(value);
      return String(value);
    };

    const flattenedData = selectedRows.flatMap((row) => {
      // Base properties from the main contract
      const baseContractData = {
        saleContractCode: formatValue(row.saleContractCode),
        saleContractName: formatValue(row.saleContractName || row.goodName),
        contractType: formatValue(row.contractType),
        transactionDate: formatDate(row.ContractDate), // This will be main contract date if no booking date
        customerName: formatValue(row.customer || row.customerName),
        customerCode: formatValue(row.customerCode),
        customerAddress: formatValue(row.customerAddress),
        customerPhone: formatValue(row.customerPhone),
        unitPrice: formatValue(row.unitPrice, false, true), // Assuming unitPrice is a number
        totalWeight: formatValue(row.totalWeight, false, true), // Assuming totalWeight is a number
        lcNumber: formatValue(row.lcNumber),
        lcDate: formatDate(row.lcDate),
        paymentTerm: formatValue(row.paymentTerm),
        deliveryTerm: formatValue(row.deliveryTerm),
        status: formatValue(row.status),
        notes: formatValue(row.notes),
        // Ensure these are explicitly set even if for a parent row
        bookingNumber: '',
        bookingType: '',
        productName: '',
        shipName: '',
        exportPort: '',
        importPort: '',
        containerQuantity: ''
      };

      if (row.subRows && row.subRows.length > 0) {
        return row.subRows.map((booking) => ({
          ...baseContractData, // Inherit contract data
          bookingNumber: formatValue(booking.bookingNumber),
          bookingType: formatValue(booking.bookingType),
          productName: formatValue(booking.productName),
          transactionDate: formatDate(booking.ETADate), // Use ETA date for booking
          totalAmountFormatted: formatValue(booking.totalAmount || 0, true),
          totalQuantityWeight: formatValue(booking.quantity || 0, false, true), // Quantity for booking
          shipName: formatValue(booking.shipName),
          exportPort: formatValue(booking.exportPort),
          importPort: formatValue(booking.importPort),
          containerQuantity: formatValue(booking.containerQuantity, false, true),
          status: formatValue(booking.status) // Use booking's status
        }));
      } else {
        // For parent rows without subRows or if subRows are not expanded/selected
        return [
          {
            ...baseContractData,
            totalAmountFormatted: formatValue(row.TotalAmount || 0, true),
            totalQuantityWeight: formatValue(row.totalWeight || 0, false, true) // totalWeight for parent contract
          }
        ];
      }
    });

    return flattenedData;
  }, [table.getSelectedRowModel()]);

  return (
    <MainCard content={false}>
      <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(e: ChangeEvent<unknown>, value: string) => setActiveTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabConfig.map((tab) => {
            const count = tabCounts ? tabCounts[tab.countKey] || 0 : 0;
            return (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
                icon={<Chip label={count} color={tab.color as any} variant="light" size="small" />}
                iconPosition="end"
              />
            );
          })}
        </Tabs>
      </Box>

      <Stack direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}>
        <DebouncedInput
          value={searchQuery ?? ''}
          onFilterChange={(value) => setSearchQuery(String(value))}
          placeholder={`Tìm kiếm ${meta.total} bản ghi...`}
        />

        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
          {/* <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Trạng thái xuất khẩu</InputLabel>
            <Select value={statusFilter} label="Trạng thái xuất khẩu" onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}>
              <MenuItem value="All">Tất cả</MenuItem>
              {statusOrder.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
          <SelectColumnVisibility
            {...{
              getVisibleLeafColumns: table.getVisibleLeafColumns,
              getIsAllColumnsVisible: table.getIsAllColumnsVisible,
              getToggleAllColumnsVisibilityHandler: table.getToggleAllColumnsVisibilityHandler,
              getAllColumns: table.getAllColumns
            }}
          />
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />

          <CSVExport {...{ data: csvData, headers: csvHeaders, filename: 'contract-list.csv' }} />
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
                        <TableCell
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
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <Fragment key={row.id}>
                      <TableRow
                        sx={{
                          bgcolor: row.depth > 0 ? 'grey.50' : 'inherit',
                          '&:hover': {
                            bgcolor: row.depth > 0 ? 'grey.100' : 'action.hover'
                          }
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            {...cell.column.columnDef.meta}
                            sx={{
                              ...(cell.column.columnDef.meta?.className?.includes('cell-center') && {
                                textAlign: 'center'
                              }),
                              ...(cell.column.columnDef.meta?.className?.includes('cell-center-text-left') && {
                                textAlign: 'left'
                              }),
                              ...(cell.column.columnDef.meta?.className?.includes('cell-right') && {
                                textAlign: 'right'
                              })
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    </Fragment>
                  ))
                ) : loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      align="center"
                      sx={{
                        py: 10,
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: 'text.secondary'
                      }}
                    >
                      <CircularProgress></CircularProgress>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      align="center"
                      sx={{
                        py: 10,
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: 'text.secondary'
                      }}
                    >
                      Dữ liệu không tồn tại
                    </TableCell>
                  </TableRow>
                )}
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
