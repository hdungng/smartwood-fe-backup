// src/pages/apps/accounting/list.tsx
import { ChangeEvent, MouseEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import AlertColumnDelete from 'components/AlertColumnDelete';
// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// third-party
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import { LabelKeyObject } from 'react-csv/lib/core';

// project imports
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import EmptyReactTable from 'pages/tables/react-table/empty';

import { APP_DEFAULT_PATH } from 'config';
import { openSnackbar } from 'api/snackbar';
import numberHelper from 'utils/numberHelper';

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
import { AccountingTransaction } from 'types/accounting';

// assets
// import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
// import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import FileExcelOutlined from '@ant-design/icons/FileExcelOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';

import { getAccountingTransactions } from 'api/accounting';
import axios from 'axios';

const fuzzyFilter: FilterFn<AccountingTransaction> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

interface Props {
  data: AccountingTransaction[];
  columns: ColumnDef<AccountingTransaction>[];
}

// Utility functions
const formatCurrency = (amount: number, currency?: string) => {
  return numberHelper.formatCurrency(amount, {
    currency: currency || 'VND'
  });
};

const formatDate = (dateString?: string | null): string => {
  if (!dateString || dateString === 'null' || dateString === '1/1/1') return '--';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '--';

  const day = String(date.getDate()).padStart(2, '0');   // thêm số 0
  const month = String(date.getMonth() + 1).padStart(2, '0'); // thêm số 0
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};


const getTransactionTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    sale: 'Bán hàng',
    purchase: 'Mua hàng',
    payment: 'Thanh toán',
    receipt: 'Thu tiền',
    expense: 'Chi phí',
    other: 'Khác'
  };
  return labels[type] || type;
};


const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
    case '5':
      return 'success';
    case 'paid_in':
      return 'info';
    case 'paid_out':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    paid: 'Đã thanh toán',
    '5': 'Đã thanh toán',
    paid_in: 'Thu tiền',
    paid_out: 'Chi tiền'
  };
  return labels[status] || status;
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();

  const groups = [
    { key: 'All', label: 'Tất cả' },
    { key: 'paid', label: 'Đã thanh toán' },
    { key: 'paid_in', label: 'Thu tiền' },
    { key: 'paid_out', label: 'Chi tiền' }
  ];

  const [activeTab, setActiveTab] = useState(groups[0].key);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'transactionDate', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Table CHÍNH: dùng để render (áp dụng cả search + tab filters)
  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter
  });

  // Table PHỤ: chỉ để tính counts theo search (KHÔNG áp dụng columnFilters của tab)
  const countTable = useReactTable({
    data,
    columns,
    state: { globalFilter },            // chỉ có globalFilter
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter
  });

  // Dữ liệu sau search (không dính tab)
  const searchData = countTable.getFilteredRowModel().rows.map(r => r.original);

  // Đếm số lượng theo searchData -> tabs luôn giữ số đúng, không bị về 0 khi đổi tab
  const counts: Record<string, number> = {
    All: searchData.length,
    paid: searchData.filter(item => ['paid', '5', 'draft'].includes(item.accountingStatus ?? '')).length,
    paid_in: searchData.filter(item => String(item.transactionDirection ?? '').toUpperCase() === 'INCOME').length,
    paid_out: searchData.filter(item => String(item.transactionDirection ?? '').toUpperCase() === 'EXPENSE').length
  };

  // Lọc dữ liệu bảng theo tab (chỉ ảnh hưởng table CHÍNH)
  useEffect(() => {
    if (activeTab === 'paid') {
      setColumnFilters([{ id: 'requestPaymentStatus', value: ['paid', '5'] }]); // giữ nguyên id bạn đang dùng
    } else if (activeTab === 'paid_in') {
      setColumnFilters([{ id: 'transactionDirection', value: 'INCOME' }]);
    } else if (activeTab === 'paid_out') {
      setColumnFilters([{ id: 'transactionDirection', value: 'EXPENSE' }]);
    } else {
      setColumnFilters([]); // All
    }
  }, [activeTab]);

  // Headers CSV
  const headers: LabelKeyObject[] = (columns as any[])
    .filter(col => col.accessorKey)
    .map(col => ({
      label: typeof col.header === 'string' ? col.header : '#',
      key: col.accessorKey
    }));

  return (
    <MainCard content={false}>
      <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(e: ChangeEvent<unknown>, value: string) => setActiveTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {groups.map((group) => (
            <Tab
              key={group.key}
              value={group.key}
              label={group.label}
              icon={
                <Chip
                  label={counts[group.key] || 0}
                  color={
                    group.key === 'All' ? 'primary'
                    : group.key === 'paid' ? 'success'
                    : group.key === 'paid_in' ? 'info'
                    : 'warning'
                  }
                  variant="light"
                  size="small"
                />
              }
              iconPosition="end"
              sx={{
                '&.Mui-selected': {
                  color:
                    group.key === 'All' ? theme.palette.primary.main
                    : group.key === 'paid' ? theme.palette.success.main
                    : group.key === 'paid_in' ? theme.palette.info.main
                    : theme.palette.warning.main
                }
              }}
            />
          ))}
        </Tabs>
      </Box>

      <Stack direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}>
        <DebouncedInput
          value={globalFilter}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder="Tìm kiếm theo mã đề nghị, loại đề nghị..."
          startAdornment={<SearchOutlined />}
        />
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <CSVExport
            data={table.getSelectedRowModel().flatRows.map((row) => row.original)}
            headers={headers}
            filename="accounting-transactions.csv"
          />
        </Stack>
      </Stack>

      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer>
            <Table sx={{ fontSize: '0.875rem' }}>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        {...(header.column.columnDef.meta ?? {})}
                        onClick={header.column.getToggleSortingHandler()}
                        className={
                          header.column.getCanSort()
                            ? `${header.column.columnDef.meta?.className || ''} cursor-pointer prevent-select`
                            : header.column.columnDef.meta?.className
                        }
                      >
                        {!header.isPlaceholder && (
                          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                            <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                            {header.column.getCanSort() && <HeaderSort column={header.column} />}
                          </Stack>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>

              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} {...(cell.column.columnDef.meta ?? {})}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider />
          <Box sx={{ p: 2 }}>
            <TablePagination
              {...{
                setPageSize: table.setPageSize,
                setPageIndex: table.setPageIndex,
                getState: table.getState,
                getPageCount: table.getPageCount,
                initialPageSize: 10
              }}
            />
          </Box>
        </Stack>
      </ScrollX>
    </MainCard>
  );
}





// ==============================|| ACCOUNTING LIST ||============================== //

const AccountingList = () => {
  const theme = useTheme();
  const [data, setData] = useState<AccountingTransaction[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const navigate = useNavigate();
  const normalizeCurrency = (cur?: string): string => {
  if (!cur) return "VND";
  const map: Record<string, string> = {
    "₫": "VND",
    "Đ": "VND",
    "VNĐ": "VND",
    "US$": "USD",
    "$": "USD",
    "€": "EUR",
    "¥": "JPY",
    "£": "GBP",
  };
  const up = cur.replace(/\s+/g, "").toUpperCase();
  return map[up] || up;
};

// Map loại đề nghị sang tiếng Việt
const getServiceTypeLabel = (type?: string) => {
  if (!type) return '--';
  const map: Record<string, string> = {
    SALE: 'Hợp đồng bán',
    PURCHASE: 'Hợp đồng mua',
    CUSTOMS: 'Dịch vụ hải quan',
    INSURANCE: 'Dịch vụ bảo hiểm',
    INSPECTION: 'Dịch vụ kiểm định',
    WAREHOUSE: 'Dịch vụ kho bãi',
    TRANSPORTATION: 'Dịch vụ vận chuyển'
  };
  return map[type.toUpperCase()] || type;
};

  // Lấy dữ liệu từ cả hai API và hợp nhất thông tin đề nghị thanh toán
  const [reloadFlag, setReloadFlag] = useState(0);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  useEffect(() => {
  const fetchData = async () => {
    try {
      const accountingList = await getAccountingTransactions(globalFilter); // ✅ truyền search vào
      setData(accountingList);
    } catch (error) {
      console.error('Error fetching accounting:', error);
      openSnackbar({
        open: true,
        message: 'Không thể tải dữ liệu kế toán',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  };
  fetchData();
}, [reloadFlag, globalFilter]);

  // Reload data when page is shown (e.g. after navigate from details)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setReloadFlag((f) => f + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Khai báo columns bằng useMemo (giữ nguyên các trường, ưu tiên hiển thị dữ liệu từ đề nghị thanh toán nếu có)
  const columns: ColumnDef<AccountingTransaction>[] = useMemo(() => [
  { header: 'Mã đề nghị', accessorKey: 'requestPaymentCode', cell: ({ row }) => {
    let val = row.original.requestPaymentCode;
    if (!val || val === 'null') val = '--';
    return <Typography variant="body2">{String(val)}</Typography>;
  } },
  { 
  header: 'Loại đề nghị', 
  accessorKey: 'serviceType', 
  cell: ({ row }) => {
    const val = row.original.category || row.original.serviceType || '--';
    return <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{getServiceTypeLabel(val)}</Typography>;
  } 
},

 {
  header: 'Lý do thanh toán',
  accessorKey: 'reason',
  cell: ({ getValue }) => {
    const val = String(getValue() ?? '--');
    return (
      <Tooltip title={val} placement="top-start">
        <Typography
          variant="body2"
          noWrap
          sx={{
            maxWidth: 200,        // Giới hạn chiều rộng hiển thị
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            fontSize: '0.875rem'
            
          }}
          
        >
          {val}
        </Typography>
      </Tooltip>
    );
  }
},


{
  accessorKey: "amount",
  header: () => <div className="text-right w-full">SỐ TIỀN</div>,
  cell: ({ row }) => {
  const normalizeCurrency = (cur: string | undefined) => {
    if (!cur) return "VND";
    const map: Record<string, string> = {
      "₫": "VND",
      "Đ": "VND",
      "VNĐ": "VND",
      "US$": "USD",
      "$": "USD",
      "€": "EUR",
      "¥": "JPY",
      "£": "GBP",
    };
    const up = cur.replace(/\s+/g, "").toUpperCase();
    return map[up] || up;
  };

  const rawAmount = Number(row.original.amount) || 0;
  const curCode = normalizeCurrency(row.original.currency);

  let formatted = new Intl.NumberFormat(
    curCode === "VND" ? "vi-VN" : "en-US",
    {
      style: "currency",
      currency: curCode,
      currencyDisplay: "symbol",
      minimumFractionDigits: curCode === "VND" ? 0 : 0,
      maximumFractionDigits: curCode === "VND" ? 0 : 2,
    }
  ).format(rawAmount);

  if (curCode === "VND") {
    formatted = formatted.replace("₫", "đ");
  }

  return (
    <div
      className="font-medium w-full"
       style={{ textAlign: "right", fontSize: "0.875rem" }} 
        // ép cứng right
    >
      {formatted}
    </div>
  );
},

  sortingFn: (rowA, rowB) => {
    const exchangeRates: Record<string, number> = {
      VND: 1,
      USD: 25000,
      EUR: 27000,
      JPY: 170,
      GBP: 31000,
    };

    const normalizeCurrency = (cur: string | undefined) => {
      if (!cur) return "VND";
      const map: Record<string, string> = {
        "₫": "VND",
        "Đ": "VND",
        "VNĐ": "VND",
        "US$": "USD",
        "$": "USD",
        "€": "EUR",
        "¥": "JPY",
        "£": "GBP",
      };
      const up = cur.replace(/\s+/g, "").toUpperCase();
      return map[up] || up;
    };

    const parseAmount = (val: any, currency: string) => {
      const num = Number(val) || 0;
      const rate = exchangeRates[normalizeCurrency(currency)] ?? 1;
      return num * rate;
    };

    const a = parseAmount(rowA.original.amount, rowA.original.currency);
    const b = parseAmount(rowB.original.amount, rowB.original.currency);

    return a - b;
  },
},







//   { header: 'Trạng thái', accessorKey: 'accountingStatus', cell: ({ getValue }) => {
//     let val = getValue();
//     // Nếu là draft thì luôn coi là 'paid' để hiển thị 'Đã thanh toán'
//     if (val === 'draft') val = 'paid';
//     let color = getStatusColor(String(val));
//     let label = getStatusLabel(String(val));
//     return <Chip label={label} color={color as any} size="small" />;
//   } },
//   {
//   header: 'Trạng thái dòng tiền',
//   accessorKey: 'transactionDirection',
//   cell: ({ row }) => {
//     const direction = String(row?.original?.transactionDirection || '').toUpperCase();

//     if (direction === 'INCOME') {
//       // màu giống tab Thu tiền
//       return <Chip label="Thu tiền" color="info" size="small" />;
//     }
//     if (direction === 'EXPENSE') {
//       // màu giống tab Chi tiền
//       return <Chip label="Chi tiền" color="warning" size="small" />;
//     }
//     return (
//       <Chip
//         label="Chưa xác định"
//         color="default"
//         size="small"
//         sx={{ backgroundColor: '#f8d7da', color: '#721c24' }}
//       />
//     );
//   },
//   meta: {
//     sx: { textAlign: 'center' }
//   }
// },


  // ...existing code...
{ header: 'Ngày đề nghị', accessorKey: 'transactionDate', cell: ({ getValue }) => {
    const val = getValue();
    // Nếu null, undefined, rỗng hoặc là '1/1/1' thì hiển thị '--'
    if (!val || String(val) === '1/1/1' || String(val) === 'null') return <Typography variant="body2">--</Typography>;
    // Nếu là số hoặc chuỗi số (timestamp), chuyển sang ngày
    if (!isNaN(Number(val))) {
      const date = new Date(Number(val));
      if (!isNaN(date.getTime())) return <Typography variant="body2">{date.toLocaleDateString('vi-VN')}</Typography>;
    }
    // Nếu là chuỗi ngày hợp lệ
    return <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{formatDate(String(val))}</Typography>;
  } },
// ...existing code...
  { 
  header: 'Ghi chú', 
  accessorKey: 'note', 
  cell: ({ getValue }) => {
    const val = String(getValue() ?? '--');
    return (
      <Tooltip title={val} placement="top-start">
        <Typography 
          variant="body2" 
          noWrap 
          sx={{ 
            maxWidth: 200,     // Giới hạn chiều rộng ô
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            fontSize: '0.875rem'
          }}
        >
          {val}
        </Typography>
      </Tooltip>
    );
  } 
},
{ header: 'Trạng thái', accessorKey: 'accountingStatus', cell: ({ getValue }) => {
    let val = getValue();
    // Nếu là draft thì luôn coi là 'paid' để hiển thị 'Đã thanh toán'
    if (val === 'draft') val = 'paid';
    let color = getStatusColor(String(val));
    let label = getStatusLabel(String(val));
    return <Chip label={label} color={color as any} size="small" sx={{ fontSize: '0.875rem' }}/>;
  } },
  {
  header: 'Trạng thái dòng tiền',
  accessorKey: 'transactionDirection',
  cell: ({ row }) => {
    const direction = String(row?.original?.transactionDirection || '').toUpperCase();

    if (direction === 'INCOME') {
      // màu giống tab Thu tiền
      return <Chip label="Thu tiền" color="info" size="small" />;
    }
    if (direction === 'EXPENSE') {
      // màu giống tab Chi tiền
      return <Chip label="Chi tiền" color="warning" size="small" />;
    }
    return (
      <Chip
        label="Chưa xác định"
        color="default"
        size="small"
        sx={{ backgroundColor: '#f8d7da', color: '#721c24', fontSize: '0.875rem' }}
        
      />
    );
  },
  meta: {
    sx: { textAlign: 'center' }
  }
},

  { header: 'Hành động', meta: { className: 'cell-center' }, disableSortBy: true, cell: ({ row }) => {
    return (
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <Tooltip title="Xem chi tiết">
          <IconButton
            color="secondary"
            onClick={() => navigate(`/accounting/details/${row.original.id}`)}
          >
            <EyeOutlined />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  } }
  ], [theme, navigate]);


  const handleClose = (status: boolean) => {
    if (status) {
      setData((prev) => prev.filter((item) => item.id !== deleteModal.id));
      openSnackbar({
        open: true,
        message: 'Giao dịch đã được xóa thành công',
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    }
    setDeleteModal({ open: false });
  };

  let breadcrumbLinks = [
    { title: 'Trang chủ', to: APP_DEFAULT_PATH },
    { title: 'Kế toán', to: '/accounting' }
  ];

  // ...existing code...
  // Render the ReactTable and other UI as before
  // ...existing code...
  return (
    
    // ...existing code...
    <ReactTable data={data} columns={columns} />
    // ...existing code...
  );
};

export default AccountingList;



