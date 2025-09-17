import { useState, useEffect, SetStateAction } from 'react';
import axiosServices from 'utils/axios';
import { STOCK_API, STOCK_ADJUST_API, ACCOUNT_API } from 'api/constants';
import { useSnackbar } from 'notistack';

// material-ui
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { CSVExport, DebouncedInput, TablePagination } from 'components/third-party/react-table';
import { useReactTable, ColumnDef, getCoreRowModel, getPaginationRowModel, SortingState } from '@tanstack/react-table';

// assets
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { PAGE_SIZE } from '../../constants';
import { PAGE_LIMIT } from '../../constants';
import AlertColumnDelete from 'components/AlertColumnDelete';
import { useIntl } from 'react-intl';
import HeaderSort from '../inventory/sortHeader';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { routing } from 'routes/routing';
import { CustomIconButton } from 'components/buttons';
// ==============================|| DATA STRUCTURES ||============================== //

interface Stock {
  id: number;
  goodId: number;
  goodName: string;
  userId: number;
  userName: string;
  quantity: number;
  transactionType: string;
  transactionDate: string;
  notes: string | null;
  status: number;
}

interface AggregatedGood {
  goodId: number;
  goodName: string;
  totalQuantity: number;
}

interface FullAdjustmentDetails {
  id: number;
  code: string;
  goodId: number;
  adjustType: 'INCREASE' | 'DECREASE';
  quantityBefore: number;
  adjustedQuantity: number;
  quantityAfter: number;
  goodName: string;
  reason: string;
  createdAt: Date;
  notes: string;
  userId: number;
  operatorName: string;
  status: 2 | 3 | 4;
}

// ==============================|| MOCK DATA & CONSTANTS ||============================== //

const adjustmentReasons = [
  'Kiểm kê phát hiện chênh lệch',
  'Hàng hóa bị hư hỏng',
  'Hàng hóa bị mất',
  'Chỉnh sửa lỗi nhập liệu',
  'Điều chỉnh theo yêu cầu',
  'Lý do khác'
];

export const columns: ColumnDef<FullAdjustmentDetails>[] = [];

// ==============================|| TRUNCATED CELL COMPONENT ||============================== //

interface TruncatedCellProps {
  value: string | number | null | undefined;
  maxLength?: number;
  width?: string | number;
}

function TruncatedCell({ value, maxLength = 30, width }: TruncatedCellProps) {
  const displayValue = value?.toString() || '---';
  const shouldTruncate = displayValue.length > maxLength;
  const truncatedValue = shouldTruncate ? `${displayValue.substring(0, maxLength)}...` : displayValue;

  return (
    <Box sx={{ width, minWidth: width, maxWidth: width }}>
      {shouldTruncate ? (
        <Tooltip title={displayValue} arrow placement="top">
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'block',
              fontSize: '0.875rem'
            }}
          >
            {truncatedValue}
          </span>
        </Tooltip>
      ) : (
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            fontSize: '0.875rem'
          }}
        >
          {displayValue}
        </span>
      )}
    </Box>
  );
}

// ==============================|| INVENTORY ADJUSTMENT PAGE ||============================== //

export default function InventoryAdjustment() {
  const { enqueueSnackbar } = useSnackbar();

  // --- STATE MANAGEMENT ---
  const [adjustments, setAdjustments] = useState<FullAdjustmentDetails[]>([]);
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [aggregatedGoods, setAggregatedGoods] = useState<AggregatedGood[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- STATE FOR APPROVAL & EDITING ---
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [currentApprovalItem, setCurrentApprovalItem] = useState<FullAdjustmentDetails | null>(null);
  const [currentEditItem, setCurrentEditItem] = useState<FullAdjustmentDetails | null>(null);

  const statusGroups = ['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Từ chối'];
  const statusMapping: Record<string, string> = {
    'Tất cả': 'TOTAL',
    'Chờ duyệt': 'PENDING',
    'Đã duyệt': 'APPROVED',
    'Từ chối': 'REJECTED'
  };
  const [activeTab, setActiveTab] = useState(statusGroups[0]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: '', desc: false }]);
  //for delete alert
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState<number | null>(null);
  const [selectedContractNumber, setSelectedContractNumber] = useState<string | null>(null);

  const [role, setRole] = useState<string>('');
  const [selectedGoodId, setSelectedGoodId] = useState<number | ''>('');
  const [adjustedQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [currentGoodInfo, setCurrentGoodInfo] = useState<AggregatedGood | null>(null);
  const [currentUserId, setCurrenUserId] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState(0); // current page
  const [pageSize, setPageSize] = useState(10); // items per page
  const intl = useIntl();
  const [countByType, setCountByType] = useState<{
    TOTAL: number;
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
  }>({
    TOTAL: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0
  });

  // --- DATA FETCHING & PROCESSING ---
  // Fetch stock data once on component mount
  useEffect(() => {
    const getMe = async () => {
      try {
        const me = await axiosServices.get(ACCOUNT_API.GET_ME);
        setRole(me.data?.data?.roles[0].code);
        const currentUserId = Number(me.data?.data?.id);
        if (!currentUserId) {
          throw new Error('Định dạng từ API không hợp lệ.');
        }
        setCurrenUserId(currentUserId);
      } catch (err: any) {
        console.error('Lỗi khi lấy profile:', err);
        const errorMessage = err.message || 'Lỗi khi lấy profile. Vui lòng thử lại.';
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    };
    const fetchStock = async () => {
      try {
        const stockResponse = await axiosServices.get(STOCK_API.COMMON);
        const stockTransactionData = stockResponse.data?.data;

        if (!Array.isArray(stockTransactionData)) {
          throw new Error('Định dạng dữ liệu kho từ API không hợp lệ.');
        }

        setStockData(stockTransactionData);
      } catch (err: any) {
        console.error('Lỗi khi tải dữ liệu kho:', err);
        const errorMessage = err.message || 'Không thể tải dữ liệu kho. Vui lòng thử lại.';
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    };
    getMe();
    fetchStock();
  }, [enqueueSnackbar]);

  const fetchAdjustments = async (
    page: number = PAGE_SIZE,
    size: number = PAGE_LIMIT,
    key_search: string = '',
    key_sort: string = '',
    key_sort_direction: string = '',
    status_filter: string = ''
  ) => {
    try {
      const params = new URLSearchParams();
      const countParams = new URLSearchParams();
      params.append('page', (page + 1).toString());
      params.append('size', size.toString());

      if (key_search) {
        params.append('Code', key_search);
        countParams.append('Code', key_search);
      }
      if (key_sort) params.append('sortBy', key_sort);
      if (key_sort_direction) params.append('SortDirection', key_sort_direction);
      if (status_filter !== 'TOTAL') {
        if (status_filter === 'PENDING') params.append('Status', '2');
        else if (status_filter === 'APPROVED') params.append('Status', '3');
        else if (status_filter === 'REJECTED') params.append('Status', '4');
      }

      const { data, status } = await axiosServices.get(`${STOCK_ADJUST_API.GET_PAGE}?${params.toString()}`);
      const count = await axiosServices.get(STOCK_ADJUST_API.COUNT + `?${countParams.toString()}`);
      if (status === 200 || status === 201) {
        const rawAdjustments = data.data || [];
        if (!Array.isArray(rawAdjustments)) {
          throw new Error('Định dạng dữ liệu điều chỉnh từ API không hợp lệ.');
        }

        const stockDetailsMap = new Map<number, { goodName: string; userName: string; goodId: number }>(
          stockData.map((stock: Stock) => [
            stock.id,
            {
              goodName: stock.goodName,
              userName: stock.userName,
              goodId: stock.goodId
            }
          ])
        );

        const mappedAdjustments: FullAdjustmentDetails[] = rawAdjustments.map((adjust: any) => {
          const stockDetails = stockDetailsMap.get(adjust.stockId) || { goodName: 'Không rõ', userName: 'Không rõ', goodId: 0 };
          return {
            id: adjust.id || 0,
            code: adjust.code || '',
            goodId: stockDetails.goodId,
            goodName: stockDetails.goodName,
            operatorName: stockDetails.userName,
            adjustType: adjust.adjustType || 'INCREASE',
            quantityBefore: adjust.quantityBefore || 0,
            adjustedQuantity: adjust.adjustedQuantity || 0,
            quantityAfter: adjust.quantityAfter || 0,
            reason: adjust.reason || '',
            createdAt: new Date(adjust.createdAt),
            notes: adjust.notes || '',
            userId: adjust.userId || 0,
            status: adjust.status || 2
          };
        });

        setAdjustments(mappedAdjustments);
        setTotalPage(data.meta?.totalPages || 0);
        if (count.data?.data) {
          const statusCount = count.data?.data;
          setCountByType({
            TOTAL: statusCount.totalCount || 0,
            PENDING: statusCount.pendingCount || 0,
            APPROVED: statusCount.approvedCount || 0,
            REJECTED: statusCount.rejectedCount || 0
          });
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu điều chỉnh:', err);
      const errorMessage = err.message || 'Không thể tải dữ liệu điều chỉnh. Vui lòng thử lại.';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { horizontal: 'right', vertical: 'top' }
      });
    } finally {
    }
  };

  useEffect(() => {
    // Update previous values after comparison

    fetchAdjustments(pageIndex, pageSize, globalFilter, sorting[0]?.id || '', sorting[0]?.desc ? 'desc' : 'asc', statusMapping[activeTab]);
  }, [pageIndex, pageSize, globalFilter, activeTab, stockData]);

  useEffect(() => {
    if (stockData.length > 0) {
      const goodMap = new Map<number, AggregatedGood>();
      stockData.forEach((stock) => {
        if (!goodMap.has(stock.goodId)) {
          goodMap.set(stock.goodId, {
            goodId: stock.goodId,
            goodName: stock.goodName,
            totalQuantity: 0
          });
        }
        const agg = goodMap.get(stock.goodId)!;
        if (stock.transactionType === 'IMPORT' || stock.transactionType === 'ADJUST_INCREASE') {
          agg.totalQuantity += stock.quantity;
        } else if (stock.transactionType === 'EXPORT' || stock.transactionType === 'ADJUST_DECREASE') {
          agg.totalQuantity -= stock.quantity;
        }
      });
      setAggregatedGoods(Array.from(goodMap.values()));
    }
  }, [stockData]);

  // --- HANDLER FUNCTIONS ---

  const openModalWithData = (adjustment: FullAdjustmentDetails) => {
    setSelectedGoodId(adjustment.goodId);
    const goodInfo = aggregatedGoods.find((g) => g.goodId === adjustment.goodId);
    setCurrentGoodInfo(goodInfo || null);
    setAdjustmentQuantity(adjustment.adjustedQuantity);
    if (adjustment.reason && !adjustmentReasons.includes(adjustment.reason)) {
      setReason('Lý do khác');
      setNotes(adjustment.reason || ''); // Move the original reason to notes
    } else {
      setReason(adjustment.reason || 'Lý do khác');
      setNotes(adjustment.notes || '');
    }
  };

  const handleOpenEditModal = (adj: FullAdjustmentDetails) => {
    setCurrentEditItem(adj);
    openModalWithData(adj);
    setIsEditModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    setReason('Lý do khác');
  };

  const handleOpenViewModal = (adj: FullAdjustmentDetails) => {
    openModalWithData(adj);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsApprovalModalOpen(false);
    setSelectedGoodId('');
    setAdjustmentQuantity(0);
    setReason('');
    setNotes('');
    setCurrentGoodInfo(null);
    setCurrentApprovalItem(null);
    setCurrentEditItem(null);
  };

  const handleGoodChange = (event: SelectChangeEvent<number>) => {
    const goodId = event.target.value as number;
    setSelectedGoodId(goodId);
    const goodInfo = aggregatedGoods.find((g) => g.goodId === goodId);
    setCurrentGoodInfo(goodInfo || null);
  };

  const handleReasonChange = (event: SelectChangeEvent) => {
    const newReason = event.target.value;
    setReason(newReason);
    if (newReason !== 'Lý do khác') setNotes('');
  };

  const handleCreateOrUpdateAdjustment = async () => {
    if (!selectedGoodId) {
      enqueueSnackbar('Vui lòng chọn hàng hóa', { variant: 'error' });
      return;
    }
    if (!adjustedQuantity) {
      enqueueSnackbar('Vui lòng nhập số lượng điều chỉnh', { variant: 'error' });
      return;
    }
    if (!reason) {
      enqueueSnackbar('Vui lòng chọn lý do', { variant: 'error' });
      return;
    }
    if (reason === 'Lý do khác' && !notes.trim()) {
      enqueueSnackbar('Vui lòng nhập ghi chú chi tiết khi chọn lý do khác.', { variant: 'error' });
      return;
    }

    const stockToAdjust = stockData.find((stock) => stock.goodId === selectedGoodId);

    if (!stockToAdjust) {
      enqueueSnackbar('Không tìm thấy thông tin kho cho hàng hóa đã chọn.', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    const payload = {
      adjustType: adjustedQuantity >= 0 ? 'INCREASE' : 'DECREASE',
      quantityBefore: currentGoodInfo?.totalQuantity || 0,
      adjustedQuantity: adjustedQuantity,
      reason: notes == '' ? reason : notes,
      stockId: stockToAdjust.id,
      userId: currentUserId, // Placeholder
      lastProgramUpdate: new Date().toISOString(),
      status: 2 // Default to "Chờ duyệt"
    };

    try {
      if (isEditModalOpen && currentEditItem) {
        await axiosServices.put(`${STOCK_ADJUST_API.COMMON}/${currentEditItem.id}`, payload);
        enqueueSnackbar('Cập nhật phiếu thành công!', { variant: 'success' });
      } else {
        await axiosServices.post(STOCK_ADJUST_API.COMMON, payload);
        enqueueSnackbar('Tạo phiếu thành công!', { variant: 'success' });
      }
      await fetchAdjustments(pageIndex, pageSize, globalFilter, '', '', statusMapping[activeTab]);
      handleCloseModal();
    } catch (error: any) {
      console.error('Lỗi khi lưu phiếu điều chỉnh:', error);
      enqueueSnackbar(error.response?.data?.message || 'Lưu phiếu thất bại', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdjustment = (adjustmentId: number, contractNumber: string) => {
    setSelectedAdjustmentId(adjustmentId);
    setSelectedContractNumber(contractNumber);
    setAlertOpen(true);
  };
  const handleCloseAlert = () => {
    setAlertOpen(false);
    setSelectedAdjustmentId(null);
    setSelectedContractNumber(null);
  };
  const handleConfirmDelete = async () => {
    if (selectedAdjustmentId === null) return;

    try {
      await axiosServices.delete(`${STOCK_ADJUST_API.COMMON}/${selectedAdjustmentId}`);
      enqueueSnackbar('Xóa phiếu thành công!', { variant: 'success' });
      await fetchAdjustments(pageIndex, pageSize, globalFilter, '', '', statusMapping[activeTab]);
    } catch (error: any) {
      console.error('Lỗi khi xóa phiếu điều chỉnh:', error);
      enqueueSnackbar(error.response?.data?.message || 'Xóa phiếu thất bại', { variant: 'error' });
    } finally {
      handleCloseAlert();
    }
  };
  // --- APPROVAL HANDLERS ---
  const handleOpenApprovalModal = (adj: FullAdjustmentDetails) => {
    setCurrentApprovalItem(adj);
    setIsApprovalModalOpen(true);
  };

  const handleApprove = async () => {
    if (!currentApprovalItem) return;
    setIsSubmitting(true);
    try {
      const adjustmentUpdatePayload = { ...currentApprovalItem, status: 3 };
      await axiosServices.put(`${STOCK_ADJUST_API.COMMON}/${currentApprovalItem.id}`, adjustmentUpdatePayload);
      const stockPayload = {
        contractId: 0,
        goodId: adjustmentUpdatePayload.goodId,
        userId: adjustmentUpdatePayload.userId,
        transactionType: adjustmentUpdatePayload.adjustType === 'INCREASE' ? 'ADJUST_INCREASE' : 'ADJUST_DECREASE',
        quantity: adjustmentUpdatePayload.adjustedQuantity,
        transactionDate: adjustmentUpdatePayload.createdAt,
        notes: adjustmentUpdatePayload.reason,
        status: 1
      };
      await axiosServices.post(STOCK_API.COMMON, stockPayload);
      enqueueSnackbar(`Đã phê duyệt phiếu ${currentApprovalItem.code}`, { variant: 'success' });
      await fetchAdjustments(pageIndex, pageSize, globalFilter, '', '', statusMapping[activeTab]);
      handleCloseModal();
    } catch (error: any) {
      console.error('Error approving adjustment:', error);
      enqueueSnackbar(error.message || 'Phê duyệt thất bại', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!currentApprovalItem) return;
    setIsSubmitting(true);
    try {
      const adjustmentUpdatePayload = { ...currentApprovalItem, status: 4 };
      await axiosServices.put(`${STOCK_ADJUST_API.COMMON}/${currentApprovalItem.id}`, adjustmentUpdatePayload);
      enqueueSnackbar(`Đã từ chối phiếu ${currentApprovalItem.code}`, { variant: 'error' });
      await fetchAdjustments(pageIndex, pageSize, globalFilter, '', '', statusMapping[activeTab]);
      handleCloseModal();
    } catch (error: any) {
      console.error('Error rejecting adjustment:', error);
      enqueueSnackbar(error.message || 'Thao tác từ chối thất bại', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HELPER & FILTERING FUNCTIONS ---

  const counts = adjustments.reduce((acc: Record<number, number>, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const filteredData = adjustments;

  const getTabColor = (status: string) => {
    switch (status) {
      case 'Chờ duyệt':
        return 'warning';
      case 'Đã duyệt':
        return 'success';
      case 'Từ chối':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getStatusChip = (status: number) => {
    switch (status) {
      case 2:
        return <Chip label="Chờ duyệt" color="warning" size="small" sx={{ width: 80 }} />;
      case 3:
        return <Chip label="Đã duyệt" color="success" size="small" sx={{ width: 80 }} />;
      case 4:
        return <Chip label="Từ chối" color="error" size="small" sx={{ width: 80 }} />;
      default:
        return <Chip label="Không xác định" color="default" size="small" sx={{ width: 80 }} />;
    }
  };

  const getAdjustmentTypeText = (type: 'INCREASE' | 'DECREASE') => (type === 'INCREASE' ? 'Tăng' : 'Giảm');

  const getAdjustmentTypeColor = (type: 'INCREASE' | 'DECREASE') => (type === 'INCREASE' ? 'success' : 'error');

  const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

  function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, '0'); // 01-31
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 01-12
    const year = date.getFullYear(); // 4-digit year

    return `${day}-${month}-${year}`;
  }

  const csvData = filteredData.map((adjustmentCsv) => ({
    'Mã phiếu': adjustmentCsv.code,
    'Tên hàng hóa': adjustmentCsv.goodName,
    'Loại điều chỉnh': getAdjustmentTypeText(adjustmentCsv.adjustType),
    'Số lượng trước': adjustmentCsv.quantityBefore,
    'Số lượng điều chỉnh': adjustmentCsv.adjustedQuantity,
    'Số lượng sau': adjustmentCsv.quantityAfter,
    'Người thực hiện': adjustmentCsv.operatorName,
    'Ngày điều chỉnh': formatDate(adjustmentCsv.createdAt),
    'Lý do': adjustmentCsv.reason
  }));

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
      console.log('Pagination change:', next);
      setPageIndex(next.pageIndex ?? 0);
      setPageSize(next.pageSize ?? 5);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

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
            // Bước 1: chưa sort → asc
            newSorting = [{ id, desc: false }];
            sortDirection = 'asc';
          } else if (sorting[0]?.desc === false) {
            // Bước 2: asc → desc
            newSorting = [{ id, desc: true }];
            sortDirection = 'desc';
          } else {
            // Bước 3: desc → reset (không sort)
            newSorting = [];
            sortDirection = undefined;
          }

          setSorting(newSorting);

          fetchAdjustments(
            pageIndex,
            pageSize,
            globalFilter,
            sortDirection ? apiField : undefined,
            sortDirection,
            statusMapping[activeTab]
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
  // --- UI RENDERING ---

  const renderContent = () => {
    return (
      <ScrollX>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {renderSortableHeader('Mã phiếu', 'code', 'Code')}
                {renderSortableHeader('Tên hàng hóa', 'goodName', 'GoodName')}
                {renderSortableHeader('Loại điều chỉnh', 'adjustType', 'AdjustType')}
                {renderSortableHeader('Số lượng trước', 'quantityBefore', 'QuantityBefore')}
                {renderSortableHeader('Số lượng điều chỉnh', 'adjustedQuantity', 'AdjustedQuantity')}
                {renderSortableHeader('Số lượng sau', 'quantityAfter', 'QuantityAfter')}
                {/* {renderSortableHeader('Lý do', 'reason', 'Reason')} */}
                {renderSortableHeader('Người tạo', 'operatorName', 'OperatorName')}
                {renderSortableHeader('Ngày điều chỉnh', 'createdAt', 'CreatedAt')}
                {renderSortableHeader('Trạng thái', 'status', 'Status')}
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((adj) => (
                  <TableRow key={adj.id} hover>
                    <TableCell>{adj.code}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {adj.goodName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={getAdjustmentTypeText(adj.adjustType)} color={getAdjustmentTypeColor(adj.adjustType)} size="small" />
                    </TableCell>
                    <TableCell align="right">{formatNumber(adj.quantityBefore)}</TableCell>
                    <TableCell align="right">
                      <Typography color={getAdjustmentTypeColor(adj.adjustType) + '.main'} fontWeight="bold">
                        {formatNumber(adj.adjustedQuantity)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatNumber(adj.quantityAfter)}</TableCell>
                    {/* <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        <TruncatedCell value={adj.reason} maxLength={20} width="150px" />
                      </Typography>
                    </TableCell> */}
                    <TableCell>{adj.operatorName}</TableCell>
                    <TableCell>{formatDate(adj.createdAt)}</TableCell>
                    <TableCell>{getStatusChip(adj.status)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center" spacing={0}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton color="secondary" onClick={() => handleOpenViewModal(adj)}>
                            <EyeOutlined />
                          </IconButton>
                        </Tooltip>
                        {adj.status === 2 && (role === 'ADMIN' || role === 'MANAGER') && (
                          <Tooltip title="Phê duyệt">
                            <IconButton color="success" onClick={() => handleOpenApprovalModal(adj)}>
                              <AuditOutlined />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(adj.status === 2 || adj.status === 4) && (
                          <>
                            <CustomIconButton
                              tooltip="Sửa"
                              color="primary"
                              onClick={() => handleOpenEditModal(adj)}
                              icon={<EditOutlined />}
                            />

                            <CustomIconButton
                              tooltip="Xóa"
                              color="error"
                              onClick={() => handleDeleteAdjustment(adj.id, adj.code)}
                              icon={<DeleteOutlined />}
                            />
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography>Không có dữ liệu phiếu điều chỉnh.</Typography>
                  </TableCell>
                </TableRow>
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
      </ScrollX>
    );
  };

  const renderApprovalDialog = () => {
    if (!currentApprovalItem) return null;
    const { goodName, quantityBefore, adjustedQuantity, quantityAfter, reason, notes, adjustType } = currentApprovalItem;

    return (
      <Dialog open={isApprovalModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>Xác nhận Phê duyệt Phiếu Điều Chỉnh</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Tên hàng hóa" value={goodName} InputProps={{ readOnly: true }} sx={{ bgcolor: 'grey.100' }} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Số lượng trước điều chỉnh"
                value={formatNumber(quantityBefore)}
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: 'grey.100' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Số lượng điều chỉnh"
                value={formatNumber(adjustedQuantity)}
                InputProps={{ readOnly: true }}
                sx={{
                  bgcolor: 'grey.100',
                  '& .MuiInputBase-input': { color: getAdjustmentTypeColor(adjustType) + '.main', fontWeight: 'bold' }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Số lượng sau điều chỉnh"
                value={formatNumber(quantityAfter)}
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: 'grey.100' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Lý do điều chỉnh" value={reason} InputProps={{ readOnly: true }} sx={{ bgcolor: 'grey.100' }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Ghi chú chi tiết"
                multiline
                rows={3}
                value={notes || 'Không có ghi chú.'}
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: 'grey.100' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseModal} variant="outlined">
            Hủy
          </Button>
          <Button onClick={handleReject} variant="contained" color="error" startIcon={<CloseCircleOutlined />} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Từ chối'}
          </Button>
          <Button onClick={handleApprove} variant="contained" color="success" startIcon={<CheckCircleOutlined />} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Phê duyệt'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const breadcrumbLinks = [
    { title: 'Trang chủ', to: routing.home },
    {
      title: '8. Kho hàng',
      to: '/inventory/adjustment'
    },
    { title: 'Điều chỉnh', to: '/inventory/adjustment' },
    {
      title: 'Danh sách'
    }
  ];
  return (
    <>
      <Breadcrumbs custom heading="Danh sách" links={breadcrumbLinks} />
      <MainCard content={false}>
        <Box sx={{ p: 2.5, pb: 0 }}>
          <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            {statusGroups.map((status: string, index: number) => {
              const count = countByType[statusMapping[status] as keyof typeof countByType] ?? 0;
              return (
                <Tab
                  key={index}
                  label={status}
                  value={status}
                  iconPosition="end"
                  icon={<Chip label={count} variant="light" size="small" color={getTabColor(status)} sx={{ ml: 0.5 }} />}
                />
              );
            })}
          </Tabs>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center">
              <DebouncedInput
                value={globalFilter ?? ''}
                onFilterChange={(value) => setGlobalFilter(String(value))}
                placeholder={`Tìm kiếm theo mã phiếu`}
              />
              <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleOpenCreateModal}>
                  Tạo phiếu
                </Button>
                <CSVExport data={csvData} filename={'dieu-chinh-kho.csv'} />
              </Stack>
            </Stack>
            {renderContent()}
          </Stack>
        </Box>
      </MainCard>

      {/* --- CREATE/EDIT/VIEW DIALOG --- */}
      <Dialog open={isCreateModalOpen || isViewModalOpen || isEditModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
          {isCreateModalOpen ? 'Tạo Phiếu Điều Chỉnh Kho' : isViewModalOpen ? 'Xem Phiếu Điều Chỉnh Kho' : 'Chỉnh Sửa Phiếu Điều Chỉnh Kho'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel style={{ fontSize: '16px' }}>Hàng hóa</InputLabel>
                <Select
                  value={selectedGoodId}
                  label="Hàng hóa"
                  onChange={handleGoodChange}
                  inputProps={{ readOnly: isViewModalOpen || isEditModalOpen }} // thay vì disabled
                  sx={{
                    bgcolor: isViewModalOpen || isEditModalOpen ? 'grey.100' : 'transparent'
                  }}
                >
                  {aggregatedGoods.map((good) => (
                    <MenuItem key={good.goodId} value={good.goodId}>
                      {good.goodName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Số lượng tồn kho"
                InputLabelProps={{
                  style: { fontSize: '16px' }
                }}
                value={currentGoodInfo ? formatNumber(currentGoodInfo.totalQuantity) : '0'}
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: 'grey.100' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Số lượng điều chỉnh"
                InputLabelProps={{
                  style: { fontSize: '16px' }
                }}
                value={adjustedQuantity}
                onChange={(e) => setAdjustmentQuantity(Number(e.target.value))}
                helperText={isViewModalOpen ? '' : 'Số dương để tăng, số âm để giảm'}
                InputProps={{ readOnly: isViewModalOpen }}
                sx={{
                  bgcolor: isViewModalOpen ? 'grey.100' : 'transparent'
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Số lượng sau điều chỉnh"
                InputLabelProps={{
                  style: { fontSize: '16px' }
                }}
                value={formatNumber((currentGoodInfo?.totalQuantity || 0) + adjustedQuantity)}
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: 'grey.100' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel style={{ fontSize: '16px' }}>Lý do điều chỉnh</InputLabel>
                <Select
                  value={reason}
                  label="Lý do điều chỉnh"
                  onChange={handleReasonChange}
                  inputProps={{ readOnly: isViewModalOpen }} // thay vì disabled
                  sx={{
                    bgcolor: isViewModalOpen ? 'grey.100' : 'transparent'
                  }}
                >
                  {adjustmentReasons.map((reasonOption) => (
                    <MenuItem key={reasonOption} value={reasonOption}>
                      {reasonOption}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Ghi chú chi tiết"
                InputLabelProps={{
                  style: { fontSize: '16px' }
                }}
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú thêm..."
                InputProps={{
                  readOnly: isViewModalOpen || (reason !== 'Lý do khác' && !!reason)
                }}
                sx={{
                  bgcolor: isViewModalOpen || (reason !== 'Lý do khác' && !!reason) ? 'grey.100' : 'transparent'
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseModal} variant="outlined">
            Hủy
          </Button>
          {!isViewModalOpen && (
            <Button onClick={handleCreateOrUpdateAdjustment} variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : isEditModalOpen ? 'Lưu thay đổi' : 'Tạo phiếu'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* --- APPROVAL DIALOG --- */}
      {renderApprovalDialog()}

      <AlertColumnDelete
        message={
          <Stack spacing={1}>
            <Typography align="center" variant="h4">
              Bạn có chắc chắn muốn xoá?
            </Typography>
            <Typography align="center" component="span">
              Điều chỉnh số: <strong>#{selectedContractNumber}</strong>
            </Typography>
            <Typography align="center">Sau khi xoá thì điều chỉnh sẽ không thể khôi phục.</Typography>
          </Stack>
        }
        open={alertOpen}
        handleClose={handleCloseAlert}
        handleDelete={handleConfirmDelete}
      />
    </>
  );
}
