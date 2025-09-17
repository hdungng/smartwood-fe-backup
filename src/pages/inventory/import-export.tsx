import { useState, useEffect, ChangeEvent, SetStateAction } from 'react';

// material-ui
import {
  Box,
  Button,
  Card,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { CSVExport, DebouncedInput, TablePagination } from 'components/third-party/react-table';

// assets
import { PlusOutlined as AddIcon, EyeOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axiosServices from 'utils/axios';
import {
  ACCOUNT_API,
  GOOD_API,
  PURCHASE_CONTRACT_API,
  PURCHASE_CONTRACT_WEIGHT_TICKET_DETAIL_API,
  SALE_CONTRACT_API,
  SALE_CONTRACT_WEIGHT_TICKET_EXPORT_API,
  STOCK_API,
  USER_API
} from 'api/constants';
import { PAGE_SIZE, PAGE_LIMIT } from '../../constants';
import {} from 'constants';

//utils
import { Stock } from 'types/stock';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { useReactTable, ColumnDef, getCoreRowModel, getPaginationRowModel, SortingState } from '@tanstack/react-table';
import { DatePicker } from '@mui/x-date-pickers';
import HeaderSort from '../inventory/sortHeader';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { routing } from 'routes/routing';
import dayjs, { Dayjs } from 'dayjs';
// types
interface StockTransaction {
  id: number;
  contractId: string;
  contractType: 'PURCHASE_CONTRACT' | 'SALE_CONTRACT' | 'DIFFERRENT';
  quantity: number;
  transactionType: 'IMPORT' | 'EXPORT' | 'ADJUST_INCREASE' | 'ADJUST_DECREASE';
  goodName: string;
  transactionDate: Date;
  notes: string;
  userName: string;
}
interface DataRow {
  id: number;
  contractId: string;
  contractType: string;
  quantity: number;
  transactionType: string;
  goodName: string;
  transactionDate: Date;
  notes: string;
  userName: string;
}

export const columns: ColumnDef<DataRow>[] = [
  {
    accessorKey: 'id',
    header: 'Mã giao dịch'
  },
  {
    accessorKey: 'contractId',
    header: 'Hợp đồng'
  },
  {
    accessorKey: 'contractType',
    header: 'Loại hợp đồng'
  },
  {
    accessorKey: 'goodName',
    header: 'Tên hàng hóa'
  },
  {
    accessorKey: 'transactionType',
    header: 'Loại giao dịch'
  },
  {
    accessorKey: 'quantity',
    header: 'Số lượng'
  },
  {
    accessorKey: 'userName',
    header: 'Người thực hiện'
  },

  {
    accessorKey: 'transactionDate',
    header: 'Ngày giao dịch'
  },
  {
    accessorKey: 'notes',
    header: 'Ghi chú'
  }
];
// ==============================|| INVENTORY IMPORT EXPORT PAGE ||============================== //

export default function InventoryImportExport() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<StockTransaction[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [sorting, setSorting] = useState<SortingState>([{ id: '', desc: false }]);
  const [fromDate, setFromDate] = useState<Date | Dayjs | null>(null);
  const [toDate, setToDate] = useState<Date | Dayjs | null>(null);
  const intl = useIntl();
  const [totalPage, setTotalPage] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState(0); // current page
  const [pageSize, setPageSize] = useState(10); // items per page

  //Mapping data setGoodNameToIdMap
  const [goodsMap, setGoodsMap] = useState<Record<number, string>>({});
  const [goodNameToIdMap, setGoodNameToIdMap] = useState<Record<string, number>>({});
  const [purchaseContractMap, setPurchaseContractMap] = useState<Record<number, string>>({});
  const [saleContractMap, setSaleContractMap] = useState<Record<number, string>>({});
  const [contractCodeToIdMap, setContractCodeToIdMap] = useState<Record<string, number>>({});

  const [initDataLoaded, setInitDataLoaded] = useState(false);
  // Tab state
  // Update the typeGroups and typeMapping
  const typeGroups = ['Tất cả', 'Nhập kho', 'Xuất kho', 'Điều chỉnh tăng', 'Điều chỉnh giảm'];
  const typeMapping: Record<string, string> = {
    'Tất cả': 'ALL',
    'Nhập kho': 'IMPORT',
    'Xuất kho': 'EXPORT',
    'Điều chỉnh tăng': 'ADJUST_INCREASE',
    'Điều chỉnh giảm': 'ADJUST_DECREASE'
  };
  // Update countByType state
  const [countByType, setCountByType] = useState<{
    ALL: number;
    IMPORT: number;
    EXPORT: number;
    ADJUST_INCREASE: number;
    ADJUST_DECREASE: number;
  }>({
    ALL: 0,
    IMPORT: 0,
    EXPORT: 0,
    ADJUST_INCREASE: 0,
    ADJUST_DECREASE: 0
  });
  const contractTypes = ['PURCHASE_CONTRACT', 'SALE_CONTRACT' /*, 'DIFFERRENT'*/];
  const [woodProducts, setWoodProducts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(typeGroups[0]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Form states for creating new transaction
  const [selectedId, setSelectedId] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<'IMPORT' | 'EXPORT' | 'ADJUST_INCREASE' | 'ADJUST_DECREASE'>('IMPORT');
  const [contractId, setContractId] = useState<string>('');
  const [contractType, setContractType] = useState<string>('PURCHASE_CONTRACT');
  const [quantity, setQuantity] = useState<number>(0);
  const [goodName, setGoodName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [saleContracts, setSaleContracts] = useState<number[]>([]);
  const [purchaseContracts, setPurchaseContracts] = useState<number[]>([]);
  const contractMap = contractType === 'PURCHASE_CONTRACT' ? purchaseContractMap : saleContractMap;
  const contractIds = contractType === 'PURCHASE_CONTRACT' ? purchaseContracts : saleContracts;

  const contractOptions = contractIds.map((id) => ({
    id,
    name: contractMap[id]
  }));
  const filteredData = transactions;

  const getContractCode = (id: number | string, type: string): string => {
    return type === 'PURCHASE_CONTRACT' ? purchaseContractMap[id as number] || 'Không rõ' : saleContractMap[id as number] || 'Không rõ';
  };

  const getTabColor = (type: string) => {
    switch (type) {
      case 'Nhập kho':
        return 'success';
      case 'Xuất kho':
        return 'warning';
      case 'Điều chỉnh tăng':
        return 'info';
      case 'Điều chỉnh giảm':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'IMPORT':
        return 'success';
      case 'EXPORT':
        return 'warning';
      case 'ADJUST_INCREASE':
        return 'info';
      case 'ADJUST_DECREASE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'IMPORT':
        return 'Nhập kho';
      case 'EXPORT':
        return 'Xuất kho';
      case 'ADJUST_INCREASE':
        return 'Điều chỉnh tăng';
      case 'ADJUST_DECREASE':
        return 'Điều chỉnh giảm';
      default:
        return type;
    }
  };

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case 'Mua':
        return 'primary';
      case 'Bán':
        return 'success';
      case 'Khác':
        return 'info';
      default:
        return 'default';
    }
  };

  const mapContractType = (type: string): string => {
    switch (type) {
      case 'SALE_CONTRACT':
        return 'Bán';
      case 'PURCHASE_CONTRACT':
        return 'Mua';
      default:
        return 'Khác';
    }
  };

  const fetchPurchaseContracts = async () => {
    try {
      // lấy data từ PURCHASE_CONTRACT_EXPORT_TICKET_DETAIL
      const res = await axiosServices.get(PURCHASE_CONTRACT_WEIGHT_TICKET_DETAIL_API.GET_LIST); // Cần đúng endpoint

      // const res = await axiosServices.get(SALE_CONTRACT_API.GET_LIST); // Cần đúng endpoint
      const contractsArray = res.data?.data || [];
      const contractCodes: number[] = [];

      const map: Record<number, string> = {};
      const reverseMap: Record<string, number> = {};

      contractsArray.forEach((item: { id: number; code: string }) => {
        map[item.id] = item.code;
        contractCodes.push(item.id);
        reverseMap[item.code] = item.id;
      });

      setPurchaseContractMap(map);
      setPurchaseContracts(contractCodes);
      setContractCodeToIdMap((prev) => ({ ...prev, ...reverseMap }));
    } catch (err: any) {
      enqueueSnackbar('Không thể lấy hợp đồng mua', { variant: 'error' });
      console.error('Lỗi fetchPurchaseContracts:', err);
    }
  };

  const fetchSaleContracts = async () => {
    try {
      // lấy data từ SALE_CONTRACT_EXPORT_TICKET
      const res = await axiosServices.get(SALE_CONTRACT_WEIGHT_TICKET_EXPORT_API.GET_LIST); // Cần đúng endpoint
      // const res = await axiosServices.get(SALE_CONTRACT_API.GET_LIST); // Cần đúng endpoint
      const contractsArray = res.data?.data || [];
      const contractCodes: number[] = [];

      const map: Record<number, string> = {};
      const reverseMap: Record<string, number> = {};

      contractsArray.forEach((item: { id: number; code: string }) => {
        map[item.id] = item.code;
        contractCodes.push(item.id);
        reverseMap[item.code] = item.id;
      });

      setSaleContractMap(map);
      setSaleContracts(contractCodes);
    } catch (err: any) {
      enqueueSnackbar('Không thể lấy hợp đồng bán', { variant: 'error' });
      console.error('Lỗi fetchSaleContracts:', err);
    }
  };

  const fetchGoods = async () => {
    try {
      const res = await axiosServices.get(GOOD_API.COMMON);
      const goodsArray = res.data?.data || [];
      const productNames: string[] = [];

      const map: Record<number, string> = {};
      const reverseMap: Record<string, number> = {};

      goodsArray.forEach((item: { id: number; name: string }) => {
        map[item.id] = item.name;
        reverseMap[item.name] = item.id;
        productNames.push(item.name);
      });

      setGoodsMap(map); // State để map goodId → name
      setGoodNameToIdMap(reverseMap);
      setWoodProducts(productNames);
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Không thể lấy danh sách hàng hóa', { variant: 'error' });
      console.error('Lỗi fetchGoods:', err);
    }
  };

  const fetchCurrentUserId = async (): Promise<number> => {
    try {
      const res = await axiosServices.get(ACCOUNT_API.GET_ME);
      const id = res.data?.data?.id;
      if (!id) throw new Error('No userID found');
      return id;
    } catch (error) {
      console.error('Không thể lấy thông tin người dùng:', error);
      throw error;
    }
  };
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, '0'); // 01-31
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 01-12
    const year = date.getFullYear(); // 4-digit year

    return `${day}-${month}-${year}`;
  }
  const fetchAllStock = async (): Promise<StockTransaction[]> => {
    try {
      const { data, status } = await axiosServices.get(STOCK_API.COMMON); // API này là lấy toàn bộ

      if ((status === 200 || status === 201) && data?.data) {
        const mapped: StockTransaction[] = data.data.map((item: Stock) => {
          return {
            id: item.id || '',
            contractId: item.contractId || '',
            contractType: item.contractType || 'DIFFERENT',
            quantity: item.quantity || 0,
            transactionType: item.transactionType as 'IMPORT' | 'EXPORT' | 'ADJUST_INCREASE' | 'ADJUST_DECREASE',
            goodId: item.goodId || '',
            goodName: item.goodName || '',
            transactionDate: new Date(item.transactionDate),
            notes: item.note || '',
            userName: item.userName || ''
          };
        });

        setAllTransactions(mapped);
        return mapped;
      }
    } catch (err) {
      console.error('Lỗi khi lấy toàn bộ dữ liệu phiếu kho:', err);
    }

    return [];
  };

  const getListStock = async (
    page: number = PAGE_SIZE,
    size: number = PAGE_LIMIT,
    key_search: string = '',
    key_sort: string = '',
    key_sort_direction: string = '',
    key_active: string | number = 1,
    transaction_Type: string,
    fromDate?: Date | Dayjs | null,
    toDate?: Date | Dayjs | null
  ) => {
    try {
      const params = new URLSearchParams();
      const praramsCount = new URLSearchParams();
      params.append('page', (page + 1).toString());
      params.append('size', size.toString());
      params.append('Status', '1');
      praramsCount.append('Status', '1');
      if (key_search) {
        params.append('GoodName', key_search);
        praramsCount.append('GoodName', key_search);
      }

      if (key_sort) params.append('sortBy', key_sort);
      if (key_sort_direction) params.append('SortDirection', key_sort_direction);
      if (transaction_Type != 'ALL') params.append('TransactionType', transaction_Type);
      if (fromDate) params.append('FromDate', dayjs(fromDate).format('YYYY-MM-DD'));
      if (toDate) params.append('ToDate', dayjs(toDate).format('YYYY-MM-DD'));

      const { data, status } = await axiosServices.get(STOCK_API.GET_PAGE + `?${params.toString()}`);
      const count = await axiosServices.get(STOCK_API.COUNT + `?${praramsCount.toString()}`);

      if (status === 200 || status === 201) {
        const mapped: StockTransaction[] = data.data?.map((item: Stock) => {
          return {
            id: item.id || '',
            contractId: item.contractId || '',
            contractType: item.contractType || 'DIFFERENT',
            quantity: item.quantity || 0,
            transactionType: item.transactionType as 'IMPORT' | 'EXPORT' | 'ADJUST_INCREASE' | 'ADJUST_DECREASE',
            goodId: item.goodId || '',
            goodName: item.goodName || '',
            transactionDate: new Date(item.transactionDate),
            notes: item.note || '',
            userName: item.userName || ''
          };
        });

        setTransactions(mapped);
        setTotalPage(data.meta?.totalPages || 0);
        if (count.data?.data) {
          const stockCount = count.data?.data;
          setCountByType({
            ALL: stockCount.totalStock || 0,
            IMPORT: stockCount.importStock || 0,
            EXPORT: stockCount.exportStock || 0,
            ADJUST_INCREASE: stockCount.adjustIncrease || 0,
            ADJUST_DECREASE: stockCount.adjustDecrease || 0
          });
        }
      }
    } catch (err) {
      console.error('FETCH FAIL!', err);
      enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    }
  };
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };
  const handleOpenViewModal = (transaction: StockTransaction) => {
    setTransactionType(transaction.transactionType);
    setContractId(transaction.contractId);
    setContractType(transaction.contractType);
    setQuantity(transaction.quantity);
    setGoodName(transaction.goodName);
    setNotes(transaction.notes);
    setIsViewModalOpen(true);
  };
  const handleOpenEditModal = (transaction: StockTransaction) => {
    setSelectedId(transaction.id);
    setTransactionType(transaction.transactionType);
    setContractId(transaction.contractId);
    setContractType(transaction.contractType);
    setQuantity(transaction.quantity);
    setGoodName(transaction.goodName);
    setNotes(transaction.notes);
    setIsEditModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    // Reset form
    setTransactionType('IMPORT');
    setContractId('');
    setContractType('PURCHASE_CONTRACT');
    setQuantity(0);
    setGoodName('');
    setNotes('');
    getListStock(pageIndex, pageSize, globalFilter, '', '', '', typeMapping[activeTab], fromDate, toDate);
  };

  const handleTransactionTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTransactionType(event.target.value as 'IMPORT' | 'EXPORT' | 'ADJUST_INCREASE' | 'ADJUST_DECREASE');
  };

  const handleContractTypeChange = (event: SelectChangeEvent) => {
    const newContractType = event.target.value;
    setContractType(newContractType);

    // Gán transactionType theo contractType
    if (newContractType === 'PURCHASE_CONTRACT') {
      setTransactionType('IMPORT');
    } else if (newContractType === 'SALE_CONTRACT') {
      setTransactionType('EXPORT');
    }
  };

  const handleCreateTransaction = async () => {
    if (!contractId || !contractType || !goodName || quantity <= 0) {
      enqueueSnackbar('Vui lòng điền đầy đủ thông tin bắt buộc', { variant: 'info' });
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = await fetchCurrentUserId();
      if (!userId) {
        enqueueSnackbar('Không thể xác định người dùng.', { variant: 'error' });
        setIsSubmitting(false);
        return;
      }
      const goodId = goodNameToIdMap[goodName];
      if (!goodId) {
        enqueueSnackbar('Không tìm thấy mã hàng hóa cho tên đã chọn', { variant: 'error' });
        return;
      }

      const payload = {
        contractId: contractId,
        goodId: Number(goodId),
        userId,
        contractType: contractType,
        transactionType: transactionType === 'IMPORT' ? 'IMPORT' : 'EXPORT',
        quantity: Number(quantity),
        transactionDate: new Date().toISOString(),
        note: notes,
        lastProgramUpdate: 'string',
        status: 1
      };

      const response = await axiosServices.post(STOCK_API.COMMON, payload);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar(`${transactionType === 'IMPORT' ? 'Nhập' : 'Xuất'} kho thành công!`, { variant: 'success' });
        handleCloseModal();
        getListStock(pageIndex, pageSize, globalFilter, '', '', '', typeMapping[activeTab], fromDate, toDate);
      } else {
        enqueueSnackbar('Tạo giao dịch thất bại.', { variant: 'error' });
      }
    } catch (error: any) {
      console.error('Lỗi khi tạo giao dịch kho:', error);
      enqueueSnackbar('Có lỗi xảy ra khi tạo giao dịch kho', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEditTransaction = async () => {
    if (!selectedId || !contractId || !contractType || !goodName || quantity <= 0) {
      enqueueSnackbar('Vui lòng điền đầy đủ thông tin bắt buộc', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Truy ngược goodId từ goodName
      const goodId = Object.entries(goodsMap).find(([, name]) => name === goodName)?.[0];

      if (!goodId) {
        enqueueSnackbar('Không tìm thấy sản phẩm tương ứng', { variant: 'error' });
        return;
      }

      const payload = {
        contractId,
        goodId: Number(goodId),
        contractType,
        transactionType,
        quantity: Number(quantity),
        note: notes,
        lastProgramUpdate: 'string',
        status: 1
      };

      // Gọi API cập nhật (giả định có STOCK_API.UPDATE)
      await axiosServices.put(`${STOCK_API.COMMON}/${selectedId}`, payload);

      getListStock(pageIndex, pageSize, globalFilter, '', '', '', typeMapping[activeTab], fromDate, toDate);
      enqueueSnackbar('Cập nhật giao dịch thành công!', { variant: 'success' });
      handleCloseModal();
    } catch (error) {
      console.error('Lỗi khi sửa giao dịch:', error);
      enqueueSnackbar('Có lỗi xảy ra khi cập nhật giao dịch kho');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteTransaction = async (stockId: number) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn ?');
    if (!confirmed) return;

    try {
      await axiosServices.delete(`${STOCK_API.COMMON}/${stockId}`);

      enqueueSnackbar('Xoá thành công', { variant: 'success' });
      getListStock(pageIndex, pageSize, globalFilter, '', '', '', typeMapping[activeTab], fromDate, toDate);
    } catch (err) {
      console.error('Lỗi xoá:', err);
      enqueueSnackbar('Không thể xoá giao dịch', { variant: 'error' });
    }
  };
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchGoods(),
          //  fetchUsers(),
          fetchPurchaseContracts(),
          fetchSaleContracts(),
          fetchAllStock()
        ]);
        setInitDataLoaded(true); // Đánh dấu là đã xong
      } catch (err) {
        console.error('Lỗi khởi tạo dữ liệu:', err);
      }
    };

    fetchInitialData();
  }, []); // ← chỉ chạy 1 lần duy nhất

  useEffect(() => {
    if (!initDataLoaded) return;

    getListStock(pageIndex, pageSize, globalFilter, '', '', '', typeMapping[activeTab], fromDate, toDate);
  }, [initDataLoaded, pageIndex, pageSize, globalFilter, activeTab, fromDate, toDate, goodName]);

  // Calculate stock by product
  const stockByProduct = allTransactions.reduce(
    (acc, transaction) => {
      const product = transaction.goodName;
      if (!acc[product]) {
        acc[product] = { in: 0, out: 0, current: 0 };
      }

      if (transaction.quantity > 0) {
        acc[product].in += transaction.quantity;
      } else if (transaction.quantity < 0) {
        acc[product].out += Math.abs(transaction.quantity); // Lấy giá trị tuyệt đối cho out
      }

      acc[product].current += transaction.quantity; // Cộng trực tiếp quantity vào current
      return acc;
    },
    {} as Record<string, { in: number; out: number; current: number }>
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination: {
        pageIndex,
        pageSize
      }
    },
    manualPagination: true,
    pageCount: totalPage,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(next.pageIndex ?? 0);
      setPageSize(next.pageSize ?? 5);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });
  // Transform data for CSV export to match table fields
  const csvData = allTransactions.map((transaction) => ({
    'Mã giao dịch': transaction.id,
    'Hợp đồng': getContractCode(transaction.contractId, transaction.contractType),
    'Tên hàng hóa': transaction.goodName,
    'Loại giao dịch': getTransactionTypeText(transaction.transactionType),
    'Số lượng': transaction.quantity,
    'Người thực hiện': transaction.userName,
    'Ngày giao dịch': formatDate(transaction.transactionDate)
  }));

  const renderSortableHeader = (
    label: string,
    id: string, // id trong sorting state
    apiField: string, // tên field gửi cho API sortBy
    sx?: React.CSSProperties // Thêm sx để tùy chỉnh style
  ) => {
    return (
      <TableCell
        className="cursor-pointer prevent-select"
        sx={sx}
        onClick={() => {
          let newSorting: SetStateAction<SortingState>;
          let sortDirection: 'asc' | 'desc' | undefined;

          if (sorting[0]?.id !== id) {
            // Chưa sort → ASC
            newSorting = [{ id, desc: false }];
            sortDirection = 'asc';
          } else if (sorting[0]?.desc === false) {
            // ASC → DESC
            newSorting = [{ id, desc: true }];
            sortDirection = 'desc';
          } else {
            // DESC → reset
            newSorting = [];
            sortDirection = undefined;
          }

          setSorting(newSorting);

          getListStock(
            pageIndex,
            pageSize,
            globalFilter,
            sortDirection ? apiField : undefined,
            sortDirection,
            '',
            typeMapping[activeTab],
            fromDate,
            toDate
          );
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {label}
          <HeaderSort sorted={sorting[0]?.id === id ? (sorting[0]?.desc ? 'desc' : 'asc') : false} />
        </Stack>
      </TableCell>
    );
  };
  const breadcrumbLinks = [
    { title: 'Trang chủ', to: routing.home },
    {
      title: '8. Kho hàng',
      to: '/inventory/import-export'
    },
    { title: 'Nhập/Xuất', to: '/inventory/import-export' },
    {
      title: 'Danh sách'
    }
  ];

  return (
    <>
      <Breadcrumbs custom heading="Danh sách" links={breadcrumbLinks} />
      <MainCard content={false}>
        <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            {/* <Typography variant="h5">Nhập xuất kho</Typography> */}
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              {Object.entries(stockByProduct).map(([product, stock]) => (
                <Card key={product} sx={{ p: 1, backgroundColor: stock.current >= 0 ? 'success.lighter' : 'error.lighter' }}>
                  <Typography variant="body2" color={stock.current >= 0 ? 'success.dark' : 'error.dark'}>
                    <strong>
                      {product}: {formatNumber(stock.current)}
                    </strong>
                  </Typography>
                </Card>
              ))}
            </Stack>
          </Stack>

          <Tabs
            value={activeTab}
            onChange={(e: ChangeEvent<unknown>, value: string) => setActiveTab(value)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {typeGroups.map((type: string, index: number) => (
              <Tab
                key={index}
                label={type}
                value={type}
                iconPosition="end"
                icon={
                  <Chip
                    label={countByType[typeMapping[type] as keyof typeof countByType] ?? 0}
                    variant="light"
                    size="small"
                    color={getTabColor(type)}
                    sx={{ ml: 0.5 }}
                  />
                }
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 2.5 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
              <DebouncedInput
                value={globalFilter ?? ''}
                onFilterChange={(value) => setGlobalFilter(String(value))}
                placeholder={`Tìm kiếm theo tên hàng`}
                sx={{ width: 230 }}
              />

              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ height: 37 }} // Đồng bộ chiều cao
                  onClick={() => {
                    setFromDate(null);
                    setToDate(null);
                    getListStock(pageIndex, pageSize, globalFilter, '', '', '', typeMapping[activeTab], null, null);
                  }}
                >
                  Đặt lại
                </Button>

                <DatePicker
                  label="Ngày bắt đầu"
                  value={fromDate}
                  onChange={(newValue) => {
                    const date = newValue;

                    if (!date) {
                      setFromDate(null);
                      return;
                    }
                    setFromDate(date);
                  }}
                  maxDate={toDate as Date}
                  slotProps={{
                    textField: {
                      size: 'small',
                      variant: 'outlined',
                      sx: {
                        // Label lúc chưa shrink
                        '& .MuiInputLabel-root': {
                          top: '2.5px' // dịch label lên
                        }
                      }
                    }
                  }}
                />

                <DatePicker
                  label="Ngày kết thúc"
                  value={toDate}
                  onChange={(newValue) => {
                    const date = newValue;
                    if (!date) {
                      setToDate(null);
                      return;
                    }
                    setToDate(date);
                  }}
                  minDate={fromDate as Date}
                  slotProps={{
                    textField: {
                      size: 'small',
                      variant: 'outlined',
                      sx: {
                        // Label lúc chưa shrink
                        '& .MuiInputLabel-root': {
                          top: '2.5px' // dịch label lên
                        }
                      }
                    }
                  }}
                />
                {/* <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateModal}>
                  Tạo nhập xuất kho
                </Button> */}
                <CSVExport data={csvData} filename={'stock-transactions.csv'} />
              </Stack>
            </Stack>

            <ScrollX>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {renderSortableHeader('Mã giao dịch', 'id', 'Id', { width: '10%' })}
                      {renderSortableHeader('Hợp đồng', 'contractId', 'ContractId')}
                      {/* <TableCell>Loại hợp đồng</TableCell> */}
                      {renderSortableHeader('Tên hàng hóa', 'name', 'Name')}
                      {renderSortableHeader('Loại giao dịch', 'transactionType', 'TransactionType')}
                      {renderSortableHeader('Số lượng', 'quantity', 'Quantity')}
                      {renderSortableHeader('Người thực hiện', 'userId', 'UserId')}
                      {renderSortableHeader('Ngày giao dịch', 'transactionDate', 'TransactionDate')}
                      {/* <TableCell>Ghi chú</TableCell> */}
                      <TableCell>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.id}</TableCell>
                        <TableCell>{getContractCode(transaction.contractId, transaction.contractType)}</TableCell>
                        {/* <TableCell>
                          <Chip
                            label={mapContractType(transaction.contractType)}
                            color={getContractTypeColor(mapContractType(transaction.contractType))}
                            size="small"
                          />
                        </TableCell> */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {transaction.goodName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getTransactionTypeText(transaction.transactionType)}
                            color={getTransactionTypeColor(transaction.transactionType)}
                            size="small"
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            color={
                              transaction.transactionType === 'IMPORT' || transaction.transactionType === 'ADJUST_INCREASE'
                                ? 'success.main'
                                : 'error.main'
                            }
                            fontWeight="bold"
                          >
                            {formatNumber(transaction.quantity)}
                          </Typography>
                        </TableCell>
                        <TableCell>{transaction.userName}</TableCell>
                        <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                        {/* <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {transaction.notes || '-'}
                          </Typography>
                        </TableCell> */}
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                color="secondary"
                                // onClick={(e: any) => {
                                //   e.stopPropagation();
                                // }}
                                onClick={() => handleOpenViewModal(transaction)}
                              >
                                <EyeOutlined />
                              </IconButton>
                            </Tooltip>
                            {/* <Tooltip title="Chỉnh sửa">
                              <IconButton color="primary" onClick={() => handleOpenEditModal(transaction)}>
                                <EditOutlined />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton color="error" onClick={() => handleDeleteTransaction(transaction.id)}>
                                <DeleteOutlined />
                              </IconButton>
                            </Tooltip>*/}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <TablePagination
                    setPageSize={table.setPageSize}
                    setPageIndex={table.setPageIndex}
                    getState={table.getState}
                    getPageCount={table.getPageCount}
                  />
                </Box>
              </>
            </ScrollX>

            {filteredData.length === 0 && (
              <Box py={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                  Không có giao dịch kho nào
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </MainCard>

      {/* Create Transaction Modal */}
      <Dialog
        open={isCreateModalOpen || isViewModalOpen || isEditModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: '80vw',
            maxWidth: '800px',
            m: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>Xem chi tiết</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Transaction Type */}
            <Grid size={{ xs: 12 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 600 }}>
                  Loại giao dịch
                </FormLabel>
                <RadioGroup row value={transactionType} onChange={handleTransactionTypeChange}>
                  <FormControlLabel value="IMPORT" control={<Radio color="success" disabled={true} />} label="Nhập kho" />
                  <FormControlLabel value="EXPORT" control={<Radio color="warning" disabled={true} />} label="Xuất kho" />
                  <FormControlLabel
                    value="ADJUST_INCREASE"
                    control={<Radio color="primary" disabled={isViewModalOpen} />}
                    label="Điều chỉnh tăng"
                  />
                  <FormControlLabel
                    value="ADJUST_DECREASE"
                    control={<Radio color="secondary" disabled={isViewModalOpen} />}
                    label="Điều chỉnh giảm"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Conditionally render Contract ID and Contract Type */}
            {['IMPORT', 'EXPORT'].includes(transactionType) && (
              <>
                {/* Contract ID */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel style={{ fontSize: '16px' }}>Mã hợp đồng</InputLabel>
                    <Select
                      value={contractId}
                      label="Mã hợp đồng"
                      onChange={(e) => setContractId(e.target.value)}
                      inputProps={{ readOnly: isViewModalOpen }}
                    >
                      {contractOptions.map((contract) => (
                        <MenuItem key={contract.id} value={contract.id}>
                          {contract.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Contract Type */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel style={{ fontSize: '16px' }}>Loại hợp đồng</InputLabel>
                    <Select
                      value={contractType}
                      label="Loại hợp đồng"
                      onChange={handleContractTypeChange}
                      inputProps={{ readOnly: isViewModalOpen }}
                    >
                      {contractTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {mapContractType(type)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Good Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel style={{ fontSize: '16px' }}>Tên hàng hóa</InputLabel>
                <Select
                  value={goodName}
                  label="Tên hàng hóa"
                  onChange={(e) => setGoodName(e.target.value)}
                  inputProps={{ readOnly: isViewModalOpen }}
                >
                  {woodProducts.map((product) => (
                    <MenuItem key={product} value={product}>
                      {product}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Quantity */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Số lượng"
                InputLabelProps={{
                  style: { fontSize: '16px' }
                }}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                inputProps={{ min: 0, step: 0.01, readOnly: isViewModalOpen }}
              />
            </Grid>

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Ghi chú"
                InputLabelProps={{
                  style: { fontSize: '16px' }
                }}
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú cho giao dịch..."
                inputProps={{ readOnly: isViewModalOpen }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} variant="outlined">
            Hủy
          </Button>
          {!isViewModalOpen && (
            <Button onClick={isEditModalOpen ? handleEditTransaction : handleCreateTransaction} variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : isEditModalOpen ? 'Sửa giao dịch' : 'Tạo giao dịch'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
