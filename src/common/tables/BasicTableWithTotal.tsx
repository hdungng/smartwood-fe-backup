// material-ui
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third-party
import { ColumnDef, HeaderGroup, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

// project imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { CSVExport } from 'components/third-party/react-table';

// types
import { LabelKeyObject } from 'react-csv/lib/core';
import { formatCurrencyVND } from 'utils/currency';

interface ReactTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  total: number;
  striped?: boolean;
  title?: string;
  colSpan?: number;
}

// ==============================|| REACT TABLE WITH TOTAL ||============================== //

export default function ReactTableWithTotal<T>({ columns, data, striped, title, colSpan = 1, total }: ReactTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const headers: LabelKeyObject[] = [];
  table.getAllColumns().map((columns) =>
    headers.push({
      label: typeof columns.columnDef.header === 'string' ? columns.columnDef.header : '#',
      // @ts-expect-error Type 'string | undefined' is not assignable to type 'string'.
      key: columns.columnDef.accessorKey
    })
  );

  return (
    <MainCard
      content={false}
      title={title}
      secondary={<CSVExport {...{ data, headers, filename: striped ? 'striped.csv' : 'basic.csv' }} />}
    >
      <ScrollX>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id} {...header.column.columnDef.meta}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody {...(striped && { className: 'striped' })}>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={colSpan} align="right">
                  <strong>Tổng cộng:</strong>
                </TableCell>
                <TableCell>{formatCurrencyVND(total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </ScrollX>
    </MainCard>
  );
}
