import { memo, useCallback, useEffect, useMemo, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third-party
import {
  ColumnDef,
  ColumnFiltersState,
  HeaderGroup,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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

// assets
import { PlusOutlined } from '@ant-design/icons';

// types
import { useNavigate } from 'react-router';
import { SnackbarProps } from 'types/snackbar';
import { User } from 'types/user.type';
import Filter from '../../../common/Filter';
import { buildCsvHeaders, filterFields, fuzzyFilter, responsiveStyles } from './MetaData';
import { useRole } from '../../../contexts';

// ==============================|| INTERFACES ||============================== //
interface Props {
  data: User[];
  columns: ColumnDef<User>[];
  loading?: boolean;
  filters?: {
    search: string;
    onSearchChange: (value: string) => void;
    onSortChange?: (field: string, order: 'asc' | 'desc') => void;
    onFilterChange: (filters: Record<string, any>) => void;
  };
  onRefresh?: () => void;
}

// ==============================|| USER TABLE COMPONENT ||============================== //
function UserTable({ data, columns, filters }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasPermission } = useRole()
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, any>>(() => ({
    name: '',
    email: '',
    username: '',
    role: '',
    status: '',
    language: ''
  }));
  // ==============================|| EFFECTS ||============================== //
  useEffect(() => {
    if (filters?.search !== undefined) {
      setGlobalFilter(filters.search);
    }
  }, [filters?.search]);

  // ==============================|| FILTER HANDLERS ||============================== //
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilterValues({
      name: '',
      email: '',
      username: '',
      role: '',
      status: '',
      language: ''
    });
    // Apply empty filters immediately after reset
    filters?.onFilterChange({});
  }, [filters]);

  const handleFilterApply = useCallback(() => {
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

  // ==============================|| TABLE HANDLERS ||============================== //
  const handleSortingChange = useCallback(
    (updater: any) => {
      setSorting(updater);

      // If parent component wants to handle sorting, call it
      if (filters?.onSortChange && typeof updater === 'function') {
        const newSorting = updater(sorting);
        if (newSorting.length > 0) {
          const { id, desc } = newSorting[0];
          filters.onSortChange(id, desc ? 'desc' : 'asc');
        }
      }
    },
    [filters, sorting]
  );

  const handleGlobalFilterChange = useCallback(
    (value: any) => {
      setGlobalFilter(value);
      filters?.onSearchChange?.(value);
    },
    [filters]
  );

  // ==============================|| PERMISSION HANDLERS ||============================== //
  const handleRowDoubleClick = useCallback(
    (user: User) => {
      // Check permissions for user management
      const hasEditAccess = hasPermission(['M_USER_UPDATE']);
      const hasViewAccess = hasPermission(['M_USER_VIEW']);

      if (!hasEditAccess && !hasViewAccess) {
        // No permission - show error message
        openSnackbar({
          open: true,
          message: 'Bạn không có quyền xem thông tin người dùng này',
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
        navigate(`/master/user/edit/${user.id}`);
      } else if (hasViewAccess) {
        // View-only access
        navigate(`/master/user/view/${user.id}`);
      }
    },
    [navigate]
  );

  // ==============================|| TABLE SETUP ||============================== //
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      globalFilter
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: handleGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
  });

  // ==============================|| MEMOIZED VALUES ||============================== //
  const csvHeaders = useMemo(() => buildCsvHeaders(columns), [columns]);

  const selectedData = useMemo(
    () => table.getSelectedRowModel().flatRows.map((row) => row.original),
    [table.getSelectedRowModel().flatRows]
  );

  const exportData = useMemo(() => (selectedData.length === 0 ? data : selectedData), [selectedData, data]);

  const searchPlaceholder = useMemo(() => `Search ${data.length} records...`, [data.length]);

  // ==============================|| RENDER ||============================== //
  return (
    <MainCard content={false}>
      {/* Header Section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={responsiveStyles.container}>
        <DebouncedInput
          value={globalFilter ?? ''}
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
            startIcon={<PlusOutlined />}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              whiteSpace: 'nowrap'
            }}
            onClick={() => navigate('/master/user/create')}
          >
            Add User
          </Button>
          <CSVExport data={exportData} headers={csvHeaders} filename="user-list.csv" />
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
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<User>) => (
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
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length}>
                      <EmptyTable msg="No Data" />
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

export default memo(UserTable);
