import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useIntl } from 'react-intl';

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
import { useRole } from 'contexts/RoleContext';

// assets
import { PlusOutlined } from '@ant-design/icons';

// types
import { SnackbarProps } from 'types/snackbar';
import { TSupplier } from 'types/supplier';
import Filter from '../../../common/Filter';
import { buildCsvHeaders, getFilterFields, responsiveStyles, INITIAL_FILTER_VALUES } from './MetaData';
import { groupLabel } from 'constants/group';
import { LIST_STATUS } from '../../../constants';
import { SUPPLIER_TYPE_MAP } from '../../../constants/supplier';

// ==============================|| INTERFACES ||============================== //
interface Props {
  data: TSupplier[];
  columns: ColumnDef<TSupplier>[];
  loading?: boolean;
  filters?: {
    search: string;
    onSearchChange: (value: string) => void;
    onSortChange?: (field: string, order: 'asc' | 'desc') => void;
    onFilterChange: (filters: Record<string, any>) => void;
  };
  onRefresh?: () => void;
}

// ==============================|| SUPPLIER TABLE COMPONENT ||============================== //
function SupplierTable({ data, columns, filters }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasPermission } = useRole();
  const intl = useIntl();

  // ==============================|| TABS STATE ||============================== //
  const groups = [groupLabel.ALL, groupLabel.ACTIVE, groupLabel.INACTIVE];
  const [activeTab, setActiveTab] = useState(groups[0]);

  // Calculate counts for each tab
  const counts = useMemo(() => {
    return data.reduce(
      (acc, supplier) => {
        if (supplier.status === 1) {
          acc.Active += 1;
        } else if (supplier.status === 0) {
          acc.Inactive += 1;
        }
        return acc;
      },
      { Active: 0, Inactive: 0 }
    );
  }, [data]);

  // ==============================|| STATE ||============================== //
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // const [c, setGlobalFilter] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, any>>(() => INITIAL_FILTER_VALUES);

  // ==============================|| EFFECTS ||============================== //
  useEffect(() => {
    if (filters?.search !== undefined) {
      // setGlobalFilter(filters.search);
    }
  }, [filters?.search]);

  // Filter data based on active tab
  const filteredData = useMemo(() => {
    if (activeTab === groupLabel.ALL) {
      return data;
    } else if (activeTab === groupLabel.ACTIVE) {
      return data.filter((supplier) => supplier.status === 1);
    } else {
      return data.filter((supplier) => supplier.status === 0);
    }
  }, [data, activeTab]);

  // ==============================|| FILTER HANDLERS ||============================== //
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilterValues(INITIAL_FILTER_VALUES);
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
    [filters]
  );

  const handleGlobalFilterChange = useCallback(
    (value: any) => {
      // setGlobalFilter(value);
      filters?.onSearchChange?.(value);
    },
    [filters]
  );

  // ==============================|| PERMISSION HANDLERS ||============================== //
  const handleRowDoubleClick = useCallback(
    (supplier: TSupplier) => {
      // Check permissions for supplier management
      const hasEditAccess = hasPermission(['M_SUPPLIER_UPDATE']);
      const hasViewAccess = hasPermission(['M_SUPPLIER_VIEW']);

      if (!hasEditAccess && !hasViewAccess) {
        // No permission - show error message
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'supplier_no_permission_message' }),
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
        navigate(`/master/supplier/edit/${supplier.id}`);
      } else if (hasViewAccess) {
        // View-only access
        navigate(`/master/supplier/view/${supplier.id}`);
      }
    },
    [navigate]
  );

  // ==============================|| TABLE SETUP ||============================== //
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
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    // onGlobalFilterChange: handleGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    // getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // globalFilterFn: fuzzyFilter,
  });

  // ==============================|| MEMOIZED VALUES ||============================== //
  const csvHeaders = useMemo(() => buildCsvHeaders(columns), [columns]);

  const selectedData = useMemo(
    () => table.getSelectedRowModel().flatRows.map((row) => row.original),
    [table.getSelectedRowModel().flatRows]
  );

  const exportData = useMemo(() => (selectedData.length === 0 ? filteredData : selectedData), [selectedData, filteredData]);

  const searchPlaceholder = useMemo(
    () => intl.formatMessage({ id: 'supplier_search_placeholder' }, { count: filteredData.length }),
    [filteredData.length, intl]
  );

  const translationLabelStatus = (type: string = '') => {
    switch (type) {
      case 'Đang hoạt động':
        return intl.formatMessage({ id: 'active_label' });
      case 'Đã ngừng hoạt động':
        return intl.formatMessage({ id: 'inactive_label' });
      default:
        return intl.formatMessage({ id: 'all_label' });
    }
  };

  // ==============================|| RENDER ||============================== //
  return (
    <MainCard content={false}>
      {/* Tabs Section */}
      <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(e: ChangeEvent<unknown>, value: string) => setActiveTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {groups.map((status: string, index: number) => (
            <Tab
              key={index}
              label={translationLabelStatus(status)}
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
            fields={getFilterFields()}
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
            onClick={() => navigate('/master/supplier/create')}
            style={{
              padding: '9px 12px'
            }}
          >
            {intl.formatMessage({ id: 'supplier_add_button' })}
          </Button>
          <CSVExport
            data={exportData.map((data) => {
              return {
                ...data,
                rating: data.rating ? `'${data.rating}/5` : '',
                supplierType: SUPPLIER_TYPE_MAP[data.supplierType] || data.supplierType,
                status: LIST_STATUS.find((item) => item.id === Number(data.status))?.label
              };
            })}
            headers={csvHeaders} 
            filename={intl.formatMessage({ id: 'supplier_csv_filename' })} />
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
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<TSupplier>) => (
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
                      <EmptyTable msg={intl.formatMessage({ id: 'supplier_no_data_message' })} />
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

export default memo(SupplierTable);
