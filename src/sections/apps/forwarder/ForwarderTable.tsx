import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import { ChangeEvent } from 'react';

// third-party
import {
  ColumnDef,
  ColumnFiltersState,
  HeaderGroup,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';

// project imports
import { openSnackbar } from 'api/snackbar';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import {
  CSVExport,
  DebouncedInput,
  EmptyTable,
  HeaderSort,
  RowSelection,
  SelectColumnVisibility,
  TablePagination
} from 'components/third-party/react-table';

// types
import { TForwarder } from 'types/forwarder.types';
import { SnackbarProps } from 'types/snackbar';

// assets
import { PlusOutlined } from '@ant-design/icons';

// common
import Filter from '../../../common/Filter';
import { buildCsvHeaders, filterFields, responsiveStyles, INITIAL_FILTER_VALUES } from './MetaData';
import { groupLabel } from 'constants/group';
import { useIntl } from 'react-intl';
import { LIST_STATUS } from '../../../constants';
import { useRole } from '../../../contexts';

interface Props {
  data: TForwarder[];
  columns: ColumnDef<TForwarder>[];
  loading?: boolean;
  filters?: {
    search: string;
    onSearchChange: (value: string) => void;
    onSortChange?: (field: string, order: 'asc' | 'desc') => void;
    onFilterChange: (filters: Record<string, any>) => void;
  };
  onRefresh?: () => void;
  onBeforeModalOpen?: (saveFn: () => void) => void;
  onAfterModalClose?: () => void;
}

// ==============================|| FORWARDER TABLE ||============================== //
// NOTE: Tab switching (ALL/ACTIVE/INACTIVE) is handled locally without API calls
// Data is filtered client-side to preserve original order and avoid unnecessary requests

function ForwarderTable({ data, columns, filters, loading, onRefresh, onBeforeModalOpen, onAfterModalClose }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasPermission } = useRole();
  const [savedPaginationState, setSavedPaginationState] = useState<{
    pageIndex: number;
    pageSize: number;
    activeTab: string;
  } | null>(null);

  // ==============================|| TABS STATE ||============================== //
  const groups = [groupLabel.ALL, groupLabel.ACTIVE, groupLabel.INACTIVE];
  const [activeTab, setActiveTab] = useState(groups[0]);

  // Calculate counts for each tab
  const counts = useMemo(() => {
    return data.reduce(
      (acc, forwarder) => {
        if (forwarder.status === 1) {
          acc.Active += 1;
        } else if (forwarder.status === 0) {
          acc.Inactive += 1;
        }
        return acc;
      },
      { Active: 0, Inactive: 0 }
    );
  }, [data]);

  // Handle tab change - LOCAL ONLY, no API call
  const handleTabChange = useCallback(
    (event: ChangeEvent<unknown>, newValue: string) => {
      console.log('Tab changed to:', newValue, '- This is LOCAL filtering only, no API call');
      setActiveTab(newValue);
      // Reset search and filters when changing tabs to avoid confusion
      // setGlobalFilter(''); // Bỏ vì không dùng globalFilter nữa
      setRowSelection({});
      setColumnFilters([]);

      if (filters?.onSearchChange) {
        filters.onSearchChange('');
      }
    },
    [filters]
  );

  // ==============================|| STATE ||============================== //
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // const [globalFilter, setGlobalFilter] = useState(''); // Bỏ vì không dùng globalFilter nữa
  const [filterValues, setFilterValues] = useState<Record<string, any>>(() => INITIAL_FILTER_VALUES);
  const intl = useIntl();

  // ==============================|| EFFECTS ||============================== //
  useEffect(() => {
    if (filters?.search !== undefined) {
      // setGlobalFilter(filters.search);
    }
  }, [filters?.search]);

  // Filter data based on active tab - LOCAL ONLY, preserves original order
  const filteredData = useMemo(() => {
    if (activeTab === groupLabel.ALL) {
      return data; // Return all data without any filtering
    } else if (activeTab === groupLabel.ACTIVE) {
      return data.filter((forwarder) => forwarder.status === 1); // Only active forwarders
    } else {
      return data.filter((forwarder) => forwarder.status === 0); // Only inactive forwarders
    }
  }, [data, activeTab]);

  // ==============================|| REACT TABLE ||============================== //
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      // globalFilter
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    // onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    // getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // globalFilterFn: fuzzyFilter,
    debugTable: true
  });

  // ==============================|| FILTER HANDLERS ||============================== //
  const handleGlobalFilterChange = useCallback(
    (value: string | number) => {
      const stringValue = String(value);
      // setGlobalFilter(stringValue);
      filters?.onSearchChange(stringValue);
    },
    [filters]
  );

  // Save current pagination state before modal opens
  const savePaginationState = useCallback(() => {
    const currentState = {
      pageIndex: table.getState().pagination.pageIndex,
      pageSize: table.getState().pagination.pageSize,
      activeTab: activeTab
    };
    console.log('Saving pagination state:', currentState);
    setSavedPaginationState(currentState);
  }, [table, activeTab]);

  // Register save function with parent component
  useEffect(() => {
    if (onBeforeModalOpen) {
      onBeforeModalOpen(savePaginationState);
    }
  }, [onBeforeModalOpen, savePaginationState]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilterValues(INITIAL_FILTER_VALUES);
    setRowSelection({});
    filters?.onFilterChange({});
  }, [filters]);

  const handleFilterApply = useCallback(() => {
    setRowSelection({});
    // Filter out empty values, but handle status field specially
    const filteredValues = Object.entries(filterValues)
      .filter(([key, value]) => {
        // For status field, allow '0' (inactive) as valid value
        if (key === 'status') {
          return value !== '' && value !== null && value !== undefined;
        }
        // For other fields, check if value is not empty
        return value && String(value).trim() !== '';
      })
      .reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, any>
      );

    filters?.onFilterChange(filteredValues);
  }, [filterValues, filters]);

  // ==============================|| PAGINATION RESTORE ||============================== //
  // Restore pagination state after data refresh (modal close)
  useEffect(() => {
    if (savedPaginationState && data.length > 0) {
      console.log('Restoring pagination state:', savedPaginationState);
      setActiveTab(savedPaginationState.activeTab);
      // Restore will be handled by the table after it's rendered
      setTimeout(() => {
        table.setPageIndex(savedPaginationState.pageIndex);
        table.setPageSize(savedPaginationState.pageSize);
        setSavedPaginationState(null); // Clear saved state
        onAfterModalClose?.();
      }, 100);
    }
  }, [data, savedPaginationState, table, onAfterModalClose]);

  // ==============================|| ACTIONS ||============================== //
  const handleCreateForwarder = useCallback(() => {
    if (!hasPermission(['M_FORWARDER_CREATE'])) {
      openSnackbar({
        open: true,
        message: 'Bạn không có quyền tạo forwarder mới',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      return;
    }
    navigate('/master/forwarder/create');
  }, [navigate]);

  const handleRowDoubleClick = useCallback(
    (forwarder: TForwarder) => {
      // Check permissions for forwarder management
      const hasEditAccess = !hasPermission(['M_FORWARDER_UPDATE'])
      const hasViewAccess = !hasPermission(['M_FORWARDER_VIEW'])

      if (!hasEditAccess && !hasViewAccess) {
        // No permission - show error message
        openSnackbar({
          open: true,
          message: 'Bạn không có quyền xem thông tin forwarder này',
          variant: 'alert',
          alert: {
            color: 'error',
            variant: 'filled'
          },
          close: true,
          actionButton: false
        } as SnackbarProps);
        return;
      }

      // Navigate based on permission level
      if (hasEditAccess) {
        // Full edit access
        navigate(`/master/forwarder/edit/${forwarder.id}`);
      } else if (hasViewAccess) {
        // View-only access
        navigate(`/master/forwarder/view/${forwarder.id}`);
      }
    },
    [navigate]
  );

  // ==============================|| MEMOIZED VALUES ||============================== //
  const csvHeaders = useMemo(() => buildCsvHeaders(), []);

  const selectedData = useMemo(
    () => table.getSelectedRowModel().flatRows.map((row) => row.original),
    [table.getSelectedRowModel().flatRows]
  );

  const exportData = useMemo(() => (selectedData.length === 0 ? filteredData : selectedData), [selectedData, filteredData]);

  const searchPlaceholder = useMemo(() => `Tìm kiếm ${filteredData.length} forwarder...`, [filteredData.length]);

  // ==============================|| RENDER ||============================== //
  return (
    <MainCard content={false}>
      {/* Tabs Section */}
      <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          {groups.map((status: string, index: number) => (
            <Tab
              key={index}
              label={status}
              value={status}
              icon={
                <Chip
                  label={status === groupLabel.ALL ? data.length : status === groupLabel.ACTIVE ? counts.Active : counts.Inactive}
                  color={status === groupLabel.ALL ? 'primary' : status === groupLabel.ACTIVE ? 'success' : 'error'}
                  variant="light"
                  size="small"
                />
              }
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Box>

      {/* Header Section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={responsiveStyles.container}>
        <DebouncedInput
          value={filters?.search ?? ''}
          onFilterChange={handleGlobalFilterChange}
          placeholder={searchPlaceholder}          
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} sx={responsiveStyles.actionStack}>
          <Filter
            fields={filterFields}
            values={filterValues}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
            onApply={handleFilterApply}
          />
          <SelectColumnVisibility
            getVisibleLeafColumns={table.getVisibleLeafColumns}
            getIsAllColumnsVisible={table.getIsAllColumnsVisible}
            getToggleAllColumnsVisibilityHandler={table.getToggleAllColumnsVisibilityHandler}
            getAllColumns={table.getAllColumns}
          />
          <Button
            variant="contained"
            size="medium"
            startIcon={<PlusOutlined />}
            onClick={handleCreateForwarder}
            style={{
              padding: '9px 12px'
            }}
          >
            Tạo forwarder mới
          </Button>
          <CSVExport 
          data={exportData.map((data) => {
                        return {
                          ...data,
                          status: intl.formatMessage({ id: LIST_STATUS.find((item) => item.id === Number(data.status))?.label })
                        };
                      })} 
          headers={csvHeaders} filename="danh-sach-forwarder.csv" />
        </Stack>
      </Stack>

      {/* Table Section */}
      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer
            sx={{
              '& .MuiTableCell-root': responsiveStyles.tableCell
            }}
          >
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<TForwarder>) => (
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
                          sx={responsiveStyles.tableCell}
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
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length}>
                      <EmptyTable msg="Không có dữ liệu" />
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      onDoubleClick={() => handleRowDoubleClick(row.original)}
                      sx={{
                        '&:hover': { bgcolor: alpha(theme.palette.primary.lighter, 0.1) },
                        cursor: 'pointer',
                        '& .MuiTableCell-root': responsiveStyles.tableCell
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} {...cell.column.columnDef.meta} sx={responsiveStyles.tableCell}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <Box sx={{ p: 2 }}>
            <TablePagination
              setPageSize={table.setPageSize}
              setPageIndex={table.setPageIndex}
              getState={table.getState}
              getPageCount={table.getPageCount}
            />
          </Box>
        </Stack>
      </ScrollX>
    </MainCard>
  );
}

export default memo(ForwarderTable);
