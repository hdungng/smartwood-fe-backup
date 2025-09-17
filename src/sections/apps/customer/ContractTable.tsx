import { Fragment, useMemo, useState } from 'react';

// material-ui
import { alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';

// third-party
import {
  ColumnDef,
  HeaderGroup,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  FilterFn
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

// project imports
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

// types
import { LabelKeyObject } from 'react-csv/lib/core';

// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// Contract data type
interface ContractData {
  id: string;
  contractNumber: string;
  companyName: string;
  companyCode: string;
  termMonths: number;
  termLabel: string;
  fileName: string;
  fileSize: number;
  createdDate: string;
  status: 'active' | 'expired' | 'pending';
  totalValue?: number;
  notes?: string;
}

const fuzzyFilter: FilterFn<ContractData> = (row, columnId, value, addMeta) => {
  // rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // store the ranking info
  addMeta(itemRank);

  // return if the item should be filtered in/out
  return itemRank.passed;
};

interface Props {
  data: ContractData[];
  columns: ColumnDef<ContractData>[];
  modalToggler: () => void;
  onSearch?: (value: string) => void;
  onStatusChange?: (value: string) => void;
}

// ==============================|| CONTRACT TABLE ||============================== //

export default function ContractTable({ data, columns, modalToggler, onSearch, onStatusChange }: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'contractNumber',
      desc: true
    }
  ]);
  const [rowSelection, setRowSelection] = useState({});
  // const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!statusFilter || statusFilter === 'all') return data;
    return data.filter((contract) => contract.status === statusFilter);
  }, [statusFilter, data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      rowSelection,
      // globalFilter
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    // onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    // getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // globalFilterFn: fuzzyFilter,
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

  return (
    <MainCard content={false}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={(theme) => ({
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          [theme.breakpoints.down('sm')]: { '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: '100%' } }
        })}
      >
        <DebouncedInput
          value={search ?? ''}
          onFilterChange={(value) => setSearch(String(value))}
          placeholder={`Tìm kiếm trong ${data.length} hợp đồng...`}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
          <Select
            value={statusFilter || 'all'}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              onStatusChange?.(event.target.value);
            }}
            displayEmpty
            slotProps={{ input: { 'aria-label': 'Status Filter' } }}
          >
            <MenuItem value="all">Tất cả trạng thái</MenuItem>
            <MenuItem value="active">Đang hiệu lực</MenuItem>
            <MenuItem value="pending">Chờ phê duyệt</MenuItem>
            <MenuItem value="expired">Hết hạn</MenuItem>
          </Select>
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={modalToggler}>
              Thêm Hợp Đồng
            </Button>
            <CSVExport
              {...{
                data:
                  table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                    ? data
                    : table.getSelectedRowModel().flatRows.map((row) => row.original),
                headers,
                filename: 'contract-list.csv'
              }}
            />
          </Stack>
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
                {table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
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
