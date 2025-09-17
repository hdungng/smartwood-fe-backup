import { ChangeEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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

import { CircularProgress } from '@mui/material';
import {
  ColumnDef,
  HeaderGroup,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
// project imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { DebouncedInput, HeaderSort, TablePagination } from 'components/third-party/react-table';

// assets
import { AuditOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import { BUSINESS_PLAN_API } from 'api/constants';
import { Status } from 'constants/status';
import { useConfiguration, useRouter } from 'hooks';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { routing } from 'routes/routing';
import { BusinessPlan } from 'types/business-plan';

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
              display: 'block'
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
            display: 'block'
          }}
        >
          {displayValue}
        </span>
      )}
    </Box>
  );
}
import { CommonStatus, dateHelper, getStatusColor, getTabColor, numberHelper } from 'utils';
import { copyToClipboard } from 'utils/clipboard';
import axiosServices from 'utils/axios';
import { LIST_STATUS_BUSINESS_PLAN, PAGE_LIMIT, PAGE_SIZE, TYPE_ASC_DESC } from '../../../constants';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import {
  CODE_COUNTRY_IMPORT,
  CODE_DELIVERY_METHOD,
  CODE_DESTINATION,
  CODE_EXPORT_PORT,
  CODE_PACKING_METHOD,
  CODE_PAYMENT_METHOD,
  CODE_QUALITY_TYPE,
  CODE_REGION,
  CODE_UNIT_OF_MEASURE
} from 'constants/code';
import Alert from '@mui/material/Alert';
import { useGlobal } from '../../../contexts';
import { PermissionGuard } from 'components/guards';
import { CustomIconButton } from 'components/buttons';

export default function BusinessPlanApproval() {
  const router = useRouter();
  const intl = useIntl();

  const [activeTab, setActiveTab] = useState<number>(Status.REQUEST_APPROVAL);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [listBusinessPlan, setListBusinessPlan] = useState<BusinessPlan[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: '',
      desc: false
    }
  ]);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: PAGE_SIZE,
    pageSize: PAGE_LIMIT
  });

  // Dialog state for approval
  const [approvalDialogOpen, setApprovalDialogOpen] = useState<boolean>(false);
  const [selectedBusinessPlan, setSelectedBusinessPlan] = useState<BusinessPlan | null>(null);
  const { goods } = useGlobal();
  const commentsRef = useRef<string>('');

  /* ==== LIST WITHOUT PAGING */
  const [countListPO, setCountListPO] = useState({
    ALL: 0,
    APPROVED: 0,
    REJECTED: 0,
    REQUEST_APPROVAL: 0
  });

  useEffect(() => {
    getListBusinessPlan(
      pagination.pageIndex,
      pagination.pageSize,
      globalFilter,
      sorting[0]?.id,
      sorting[0]?.id === '' ? '' : sorting[0]?.desc ? TYPE_ASC_DESC.DESC : TYPE_ASC_DESC.ASC,
      activeTab === 100 ? '' : activeTab
    );

    // Uncomment the line below to use test data from JSON file during development
    // useTestDataIfAvailable();
  }, [activeTab, globalFilter, sorting[0]?.id, sorting[0]?.desc, pagination.pageIndex, pagination.pageSize]);

  const getListBusinessPlan = async (
    page: number = PAGE_SIZE,
    size: number = PAGE_LIMIT,
    key_search: string = '',
    key_sort: string = '',
    key_sort_direction: string = '',
    key_status: number | ''
  ) => {
    try {
      setLoading(true);
      const { data, status } = await axiosServices.get(
        BUSINESS_PLAN_API.BUSINESS_PLAN +
          '/page' +
          `?page=${page + 1}&size=${size}&Status=${key_status}&ContractCode=${key_search}&sortBy=${key_sort}&SortDirection=${key_sort_direction}&IsApproval=true`
      );
      const counts = {
        APPROVED: data?.meta?.count?.approvedCount || 0,
        REJECTED: data?.meta?.count?.rejectedCount || 0,
        REQUEST_APPROVAL: data?.meta?.count?.requestApproveCount || 0
      };
      setCountListPO({
        ...counts,
        ALL: counts.APPROVED + counts.REJECTED + counts.REQUEST_APPROVAL
      });
      if (status === 200 || status === 201) {
        const formatData: BusinessPlan[] = await Promise.all(
          data.data.map(async (item: any) => {
            return {
              id: item.id,
              draftPoId: item.draftPoId,
              code: item?.code,
              actualBusinessProfit: item?.actualBusinessProfit || 0,
              breakEvenPrice: item?.breakEvenPrice || 0,
              createdAt: item.createdAt,
              currency: item.currency,
              expectedPrice: item?.draftPo?.unitPrice || item?.expectedPrice || 0,
              profitMarginPercentage: item?.profitMarginPercentage || 0,
              totalQuantity: item?.draftPo?.quantity || item?.totalQuantity || 0,
              totalRevenueExcludingVat: item?.totalRevenueExcludingVat || 0,
              status: item.status,
              customerName: item?.draftPo?.customerName || item?.customerName || '',
              goodName: item?.draftPo?.goodName || item?.goodName || '',
              isApprove: item?.isApprove,
              // Thêm các field mới từ data structure
              draftPo: item?.draftPo || null,
              businessPlanCostItem: item?.businessPlanCostItem || null,
              businessPlanSupplierItems: item?.businessPlanSupplierItems || [],
              businessPlanTransactionInfoItem: item?.businessPlanTransactionInfoItem || null,
              contractId: item?.contractId,
              contractCode: item?.contractCode || '',
              lastUpdatedAt: item?.lastUpdatedAt,
              createdBy: item?.createdBy,
              lastUpdatedBy: item?.lastUpdatedBy
            };
          })
        );
        setListBusinessPlan(formatData);
        setTotalPage(data.meta.totalPages || 0);
        // console.log("getListBusinessPlan___data", { formatData, test: data.data })
      }
    } catch (error) {
      console.log('FETCH FAIL!', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = useCallback(
    (status: any) => {
      switch (status) {
        case 0:
          return intl.formatMessage({ id: 'inactive_label' });
        case 1:
          return intl.formatMessage({ id: 'active_label' });
        case 3:
          return intl.formatMessage({ id: 'approval_label' });
        case 4:
          return intl.formatMessage({ id: 'rejected_label' });
        case 5:
          return intl.formatMessage({ id: 'request_approval_label' });
        default:
          return '---';
      }
    },
    [intl]
  );

  const handleApproveBusinessPlan = useCallback(
    async (payload: BusinessPlan, note: string = '') => {
      if (!payload.id) return;

      // Đóng modal ngay lập tức
      setApprovalDialogOpen(false);
      setSelectedBusinessPlan(null);
      commentsRef.current = '';

      // Bắt đầu loading
      setLoading(true);

      try {
        const { status } = await axiosServices.put(BUSINESS_PLAN_API.BUSINESS_PLAN + `/${payload?.id}`, {
          status: Status.APPROVED,
          note: note
        });
        if (status === 200 || status === 201) {
          enqueueSnackbar(intl.formatMessage({ id: 'common_update_success_text' }), {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
          // Cập nhật lại danh sách và số lượng ở các tab
          await Promise.all([
            getListBusinessPlan(
              pagination.pageIndex,
              pagination.pageSize,
              globalFilter,
              sorting[0]?.id,
              sorting[0]?.id === '' ? '' : sorting[0]?.desc ? TYPE_ASC_DESC.DESC : TYPE_ASC_DESC.ASC,
              activeTab === 100 ? '' : activeTab
            )
          ]);
        }
      } catch (err) {
        console.log('FETCH FAIL!', err);
        enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
          autoHideDuration: 2500,
          variant: 'error',
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
      } finally {
        // Loading sẽ được tắt trong getListBusinessPlan
      }
    },
    [activeTab, globalFilter, sorting[0]?.id, sorting[0]?.desc, pagination.pageIndex, pagination.pageSize]
  );

  const handleRejectBusinessPlan = useCallback(
    async (payload: BusinessPlan, note: string = '') => {
      if (!payload.id) return;

      // Đóng modal ngay lập tức
      setApprovalDialogOpen(false);
      setSelectedBusinessPlan(null);
      commentsRef.current = '';

      // Bắt đầu loading
      setLoading(true);

      try {
        const { status } = await axiosServices.put(BUSINESS_PLAN_API.BUSINESS_PLAN + `/${payload?.id}`, {
          status: Status.REJECTED,
          note: note
        });
        if (status === 200 || status === 201) {
          enqueueSnackbar(intl.formatMessage({ id: 'common_update_success_text' }), {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { horizontal: 'right', vertical: 'top' }
          });
          // Cập nhật lại danh sách và số lượng ở các tab
          await Promise.all([
            getListBusinessPlan(
              pagination.pageIndex,
              pagination.pageSize,
              globalFilter,
              sorting[0]?.id,
              sorting[0]?.id === '' ? '' : sorting[0]?.desc ? TYPE_ASC_DESC.DESC : TYPE_ASC_DESC.ASC,
              activeTab === 100 ? '' : activeTab
            )
          ]);
        }
      } catch (err) {
        console.log('FETCH FAIL!', err);
        enqueueSnackbar(intl.formatMessage({ id: 'common_error_text' }), {
          autoHideDuration: 2500,
          variant: 'error',
          anchorOrigin: { horizontal: 'right', vertical: 'top' }
        });
      } finally {
        // Loading sẽ được tắt trong getListBusinessPlan
      }
    },
    [activeTab, globalFilter, sorting[0]?.id, sorting[0]?.desc, pagination.pageIndex, pagination.pageSize]
  );

  const handleOpenApprovalDialog = useCallback((businessPlan: BusinessPlan) => {
    setSelectedBusinessPlan(businessPlan);
    setApprovalDialogOpen(true);
  }, []);

  const handleCloseApprovalDialog = useCallback(() => {
    setApprovalDialogOpen(false);
    setSelectedBusinessPlan(null);
  }, []);

  // Approval Dialog Component - Tách riêng để tối ưu performance
  interface ApprovalDialogProps {
    open: boolean;
    selectedBusinessPlan: BusinessPlan | null;
    onClose: () => void;
    onApprove: (businessPlan: BusinessPlan, note: string) => void;
    onReject: (businessPlan: BusinessPlan, note: string) => void;
    getStatusText: (status: any) => string;
  }

  const ApprovalDialog = memo<ApprovalDialogProps>(
    ({ open, selectedBusinessPlan, onClose, onApprove, onReject, getStatusText }: ApprovalDialogProps) => {
      const localCommentsRef = useRef<HTMLTextAreaElement>(null);
      const { mapConfigObject } = useConfiguration();

      // Clear comments khi dialog đóng
      const handleClose = () => {
        if (localCommentsRef.current) {
          localCommentsRef.current.value = '';
        }
        onClose();
      };

      if (!selectedBusinessPlan) return null;

      // Dynamic color for profit/loss tiles
      const isProfit = (selectedBusinessPlan.actualBusinessProfit || 0) > 0;
      const profitCardSx = {
        backgroundColor: isProfit ? 'success.lighter' : 'error.lighter',
        border: '1px solid',
        borderColor: isProfit ? 'success.main' : 'error.main'
      } as const;
      const profitTextColor = isProfit ? 'success.main' : 'error.main';

      return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ pb: 2 }}>
            <Typography variant="h4" component="div">
              Chi tiết phương án kinh doanh - {selectedBusinessPlan.code}
            </Typography>
          </DialogTitle>

          <DialogContent>
            <Stack spacing={3}>
              {/* Product Information */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Thông tin cơ bản
                  </Typography>
                  <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Mã PAKD
                      </Typography>
                      <Typography variant="h6">{selectedBusinessPlan.code}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Mã Booking
                      </Typography>
                      <Typography variant="h6">{selectedBusinessPlan.draftPo?.code || selectedBusinessPlan.draftPoId}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Khách hàng
                      </Typography>
                      <Typography variant="h6">{selectedBusinessPlan.customerName}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Sản phẩm
                      </Typography>
                      <Typography variant="h6">{goods.find((x) => x.id === selectedBusinessPlan?.draftPo?.goodId)?.name || ''}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Tổng số lượng
                      </Typography>
                      <Typography variant="h6">
                        {numberHelper.formatNumber(selectedBusinessPlan.totalQuantity, {
                          currency: selectedBusinessPlan.draftPo?.paymentCurrency
                        })}{' '}
                        {mapConfigObject(CODE_UNIT_OF_MEASURE, selectedBusinessPlan.draftPo!.unitOfMeasure)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Giá dự kiến
                      </Typography>
                      <Typography variant="h6">
                        {numberHelper.formatCurrency(selectedBusinessPlan.expectedPrice, {
                          currency: selectedBusinessPlan.draftPo?.paymentCurrency
                        })}{' '}
                        / {mapConfigObject(CODE_UNIT_OF_MEASURE, selectedBusinessPlan.draftPo!.unitOfMeasure)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Draft PO Information */}
              {selectedBusinessPlan.draftPo && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      📋 Thông tin đơn hàng dự thảo
                    </Typography>
                    <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Địa điểm giao hàng
                        </Typography>
                        <Typography variant="body1">
                          {mapConfigObject(CODE_DESTINATION, selectedBusinessPlan.draftPo.deliveryLocation)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Quốc gia nhập khẩu
                        </Typography>
                        <Typography variant="body1">
                          {mapConfigObject(CODE_COUNTRY_IMPORT, selectedBusinessPlan.draftPo.importCountry)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Phương thức vận chuyển
                        </Typography>
                        <Typography variant="body1">
                          {mapConfigObject(CODE_DELIVERY_METHOD, selectedBusinessPlan.draftPo.deliveryMethod)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Phương thức thanh toán
                        </Typography>
                        <Typography variant="body1">
                          {mapConfigObject(CODE_PAYMENT_METHOD, selectedBusinessPlan.draftPo.paymentMethod)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Loại hàng
                        </Typography>
                        <Typography variant="body1">{mapConfigObject(CODE_QUALITY_TYPE, selectedBusinessPlan.draftPo.goodType)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Ngày giao dự kiến
                        </Typography>
                        <Typography variant="body1">{dateHelper.formatDate(selectedBusinessPlan.draftPo.expectedDelivery)}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Financial Analysis */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    📊 Phân tích tài chính
                  </Typography>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} sx={{ mb: 2 }}>
                    <Card sx={{ backgroundColor: 'success.lighter', border: '1px solid', borderColor: 'success.main' }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Tổng doanh thu (chưa VAT)
                        </Typography>
                        <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                          {numberHelper.formatCurrency(
                            selectedBusinessPlan.totalRevenueExcludingVat /
                              (selectedBusinessPlan.businessPlanTransactionInfoItem?.exchangeRateBuy || 1),
                            {
                              currency: selectedBusinessPlan.currency
                            }
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={profitCardSx}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Điểm hòa vốn
                        </Typography>
                        <Typography variant="h4" color={profitTextColor} sx={{ fontWeight: 'bold' }}>
                          {numberHelper.formatCurrency(
                            selectedBusinessPlan.breakEvenPrice /
                              (selectedBusinessPlan.businessPlanTransactionInfoItem?.exchangeRateBuy || 1),
                            {
                              currency: selectedBusinessPlan.currency
                            }
                          )}{' '}
                          / {mapConfigObject(CODE_UNIT_OF_MEASURE, selectedBusinessPlan.draftPo!.unitOfMeasure)}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={profitCardSx}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Lợi nhuận KD thực
                        </Typography>
                        <Typography variant="h4" color={profitTextColor} sx={{ fontWeight: 'bold' }}>
                          {numberHelper.formatCurrency(
                            selectedBusinessPlan.actualBusinessProfit /
                              (selectedBusinessPlan.businessPlanTransactionInfoItem?.exchangeRateBuy || 1),
                            {
                              currency: selectedBusinessPlan.currency
                            }
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={profitCardSx}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {intl.formatMessage({ id: 'profit_rate' })}
                        </Typography>
                        <Typography variant="h4" color={profitTextColor} sx={{ fontWeight: 'bold' }}>
                          {numberHelper.formatPercent(selectedBusinessPlan.profitMarginPercentage)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </CardContent>
              </Card>

              {/* Transaction Information */}
              {selectedBusinessPlan.businessPlanTransactionInfoItem && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      💱 Thông tin giao dịch
                    </Typography>
                    <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Tỷ giá mua
                        </Typography>
                        <Typography variant="body1">
                          {numberHelper.formatNumber(selectedBusinessPlan.businessPlanTransactionInfoItem.exchangeRateBuy)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Tỷ giá bán
                        </Typography>
                        <Typography variant="body1">
                          {numberHelper.formatNumber(selectedBusinessPlan.businessPlanTransactionInfoItem.exchangeRateSell)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Phương thức vận chuyển
                        </Typography>
                        <Typography variant="body1">
                          {mapConfigObject(CODE_DELIVERY_METHOD, selectedBusinessPlan.businessPlanTransactionInfoItem.shippingMethod)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Phương thức đóng gói
                        </Typography>
                        <Typography variant="body1">
                          {mapConfigObject(CODE_PACKING_METHOD, selectedBusinessPlan.businessPlanTransactionInfoItem.packingMethod)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Trọng lượng/Container
                        </Typography>
                        <Typography variant="body1">
                          {numberHelper.formatNumber(selectedBusinessPlan.businessPlanTransactionInfoItem.weightPerContainer)}{' '}
                          {mapConfigObject(CODE_UNIT_OF_MEASURE, selectedBusinessPlan.draftPo!.unitOfMeasure)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Tổng số container dự kiến
                        </Typography>
                        <Typography variant="body1">
                          {numberHelper.formatNumber(
                            Math.ceil(selectedBusinessPlan.businessPlanTransactionInfoItem.estimatedTotalContainers)
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Supplier Information */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    🏭 Thông tin nhà cung cấp
                  </Typography>

                  {(selectedBusinessPlan?.businessPlanSupplierItems || []).length > 0 ? (
                    <>
                      {(selectedBusinessPlan?.businessPlanSupplierItems || []).map((supplier, index) => (
                        <Card key={supplier.id} sx={{ mb: 2, backgroundColor: 'grey.50' }}>
                          <CardContent>
                            <Typography variant="subtitle1" color="primary" gutterBottom>
                              Nhà cung cấp #{index + 1}
                            </Typography>
                            <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Tên sản phẩm
                                </Typography>
                                <Typography variant="body1">{supplier.goodName}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Khu vực
                                </Typography>
                                <Typography variant="body1">{mapConfigObject(CODE_REGION, supplier.region)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Cảng xuất khẩu
                                </Typography>
                                <Typography variant="body1">{mapConfigObject(CODE_EXPORT_PORT, supplier.exportPort)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Số lượng
                                </Typography>
                                <Typography variant="body1">
                                  {numberHelper.formatNumber(supplier.quantity)}{' '}
                                  {mapConfigObject(CODE_UNIT_OF_MEASURE, selectedBusinessPlan!.draftPo!.unitOfMeasure)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Giá mua
                                </Typography>
                                <Typography variant="body1">
                                  {numberHelper.formatCurrency(supplier.purchasePrice, {
                                    currency: 'VND'
                                  })}{' '}
                                  / {mapConfigObject(CODE_UNIT_OF_MEASURE, selectedBusinessPlan!.draftPo!.unitOfMeasure)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Tổng tiền
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                  {numberHelper.formatCurrency(supplier.totalAmount, {
                                    currency: 'VND'
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <Alert severity="error" color="error" sx={{ height: 60, display: 'flex', alignItems: 'center' }}>
                      Không có thông tin nhà cung cấp cho phương án kinh doanh này.
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Approval Comments */}
              <Card sx={{ backgroundColor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Ghi chú phê duyệt
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    inputRef={localCommentsRef}
                    placeholder="Nhập ghi chú của bạn về yêu cầu phê duyệt này..."
                    variant="outlined"
                    sx={{ backgroundColor: 'white' }}
                  />
                </CardContent>
              </Card>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button onClick={handleClose} variant="outlined" color="inherit" startIcon={<CloseCircleOutlined />}>
              Đóng
            </Button>
            {selectedBusinessPlan.status !== 3 && (
              <>
                <Button
                  onClick={() => onReject(selectedBusinessPlan, localCommentsRef.current?.value || '')}
                  variant="outlined"
                  color="error"
                  startIcon={<CloseCircleOutlined />}
                  sx={{ minWidth: 120 }}
                >
                  {selectedBusinessPlan.status === 4 ? 'Từ Chối Lại' : 'Từ Chối'}
                </Button>
                <Button
                  onClick={() => onApprove(selectedBusinessPlan, localCommentsRef.current?.value || '')}
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlined />}
                  sx={{ minWidth: 120 }}
                  disabled={(selectedBusinessPlan?.businessPlanSupplierItems || []).length === 0}
                >
                  {selectedBusinessPlan.status === 4 ? 'Phê Duyệt Lại' : 'Phê Duyệt'}
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      );
    }
  );

  const columns = useMemo<ColumnDef<BusinessPlan>[]>(
    () => [
      {
        id: 'contractCode',
        header: intl.formatMessage({ id: 'business_plan_contract_code' }),
        accessorKey: 'contractCode',
        meta: {
          width: 200
        },
        cell: ({ row }) => {
          const contractCode = row?.original?.contractCode;
          return (
            <Box sx={{ width: 180, minWidth: 180, maxWidth: 180 }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <TruncatedCell value={contractCode} maxLength={20} width={140} />
                {contractCode && (
                  <Tooltip title={intl.formatMessage({ id: 'copy_to_clipboard' })} arrow placement="top">
                    <IconButton
                      size="small"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const success = await copyToClipboard(contractCode);
                        if (success) {
                          enqueueSnackbar(intl.formatMessage({ id: 'copied_to_clipboard' }), {
                            variant: 'success',
                            autoHideDuration: 2000,
                            anchorOrigin: { horizontal: 'right', vertical: 'top' }
                          });
                        } else {
                          enqueueSnackbar(intl.formatMessage({ id: 'copy_failed' }), {
                            variant: 'error',
                            autoHideDuration: 2000,
                            anchorOrigin: { horizontal: 'right', vertical: 'top' }
                          });
                        }
                      }}
                      sx={{ width: 24, height: 24, color: 'primary.main' }}
                    >
                      <CopyOutlined style={{ fontSize: '12px' }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          );
        }
      },
      {
        id: 'customerName',
        header: intl.formatMessage({ id: 'business_plan_customer_name' }),
        accessorKey: 'customerName',
        meta: {
          width: 250
        }
      },
      {
        id: 'goodId',
        header: intl.formatMessage({ id: 'business_plan_good_name' }),
        accessorKey: 'draftPo.goodId',
        cell: ({ row }) => {
          const goodId = row.original.draftPo?.goodId;
          const goodName = goods.find((g) => g.id === goodId)?.name || '';
          return (
            <Box sx={{ width: 180, minWidth: 180, maxWidth: 180 }}>
              <TruncatedCell value={goodName} maxLength={20} width={140} />
            </Box>
          );
        }
      },
      {
        id: 'totalRevenueExcludingVat',
        header: intl.formatMessage({ id: 'business_plan_totalRevenueExcludingVAT' }),
        accessorKey: 'totalRevenueExcludingVat',
        meta: {
          width: 250
        },
        cell: (cell) => numberHelper.formatCurrency(cell.getValue() as number, { currency: 'VND' })
      },
      {
        id: 'breakEvenPrice',
        header: intl.formatMessage({ id: 'business_plan_breakEvenPrice' }),
        accessorKey: 'breakEvenPrice',
        meta: {
          width: 220
        },
        cell: (cell) => numberHelper.formatCurrency(cell.getValue() as number, { currency: 'VND' })
      },
      {
        id: 'actualBusinessProfit',
        header: intl.formatMessage({ id: 'business_plan_actualBusinessProfit' }),
        accessorKey: 'actualBusinessProfit',
        meta: {
          width: 220
        },
        cell: (cell) => numberHelper.formatCurrency(cell.getValue() as number, { currency: 'VND' })
      },
      {
        id: 'profitMarginPercentage',
        header: intl.formatMessage({ id: 'business_plan_profitMarginPercentage' }),
        accessorKey: 'profitMarginPercentage',
        meta: {
          width: 250
        },
        cell: (cell) => `${numberHelper.formatPercent(cell.getValue() as number)}`
      },
      {
        id: 'status',
        header: intl.formatMessage({ id: 'business_plan_status' }),
        accessorKey: 'status',
        meta: {
          width: 150
        },
        cell: (cell) => {
          const value = cell.getValue() as CommonStatus;
          return <Chip label={getStatusText(value)} color={getStatusColor(value)} size="small" />;
        }
      },
      {
        id: 'actions',
        header: intl.formatMessage({ id: 'action_label' }),
        meta: {
          width: 150,
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          const isApproved = row.original.status === CommonStatus.Approved;
          const isRejected = row.original.status === CommonStatus.Rejected;
          const isProcessed = isApproved; // Chỉ disable khi đã được phê duyệt

          const getTooltipText = () => {
            if (isApproved) return intl.formatMessage({ id: 'already_approved' });
            if (isRejected) return 'Xem lại và phê duyệt';
            return intl.formatMessage({ id: 'approve' });
          };

          return (
            <Box display="flex" gap={1}>
              <PermissionGuard permission="BUSINESS_PLAN_APPROVE">
                <CustomIconButton
                  onClick={() => handleOpenApprovalDialog(row.original)}
                  icon={<AuditOutlined />}
                  color="primary"
                  disabled={isProcessed}
                  tooltip={getTooltipText()}
                />
              </PermissionGuard>
              <PermissionGuard permission="BUSINESS_PLAN_VIEW">
                <CustomIconButton
                  tooltip="Xem trước"
                  color="info"
                  onClick={() => {
                    router.push(routing.businessPlan.detail(row.original.id), {
                      fromUrl: routing.businessPlan.approval
                    });
                  }}
                  icon={<EyeOutlined />}
                />
              </PermissionGuard>
            </Box>
          );
        }
      }
    ],
    [router, intl, getStatusText, handleOpenApprovalDialog]
  );

  const table = useReactTable({
    data: listBusinessPlan,
    columns,
    state: {
      sorting,
      pagination
    },
    manualPagination: true,
    pageCount: totalPage,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination
  });

  const breadcrumbLinks = [
    { title: 'Trang chủ', to: routing.home },
    {
      title: '1. Draft PO',
      to: routing.po.list
    },
    { title: 'Phê duyệt' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="Phê duyệt" links={breadcrumbLinks} />

      <MainCard content={false}>
        <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
          {/* <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">{intl.formatMessage({ id: 'approve_business_plan' })}</Typography>
          </Stack> */}
          <Tabs
            value={activeTab}
            // onChange={(_e: ChangeEvent<unknown>, value: string) => setActiveTab(Number(value))}
            onChange={(e: ChangeEvent<unknown>, value: string) => {
              setPagination({
                pageIndex: PAGE_SIZE,
                pageSize: PAGE_LIMIT
              });
              // Cập nhật cả danh sách và số lượng các tab
              Promise.all([
                getListBusinessPlan(
                  PAGE_SIZE,
                  PAGE_LIMIT,
                  globalFilter,
                  sorting[0]?.id,
                  sorting[0]?.id === '' ? '' : sorting[0]?.desc ? TYPE_ASC_DESC.DESC : TYPE_ASC_DESC.ASC,
                  Number(value) === 100 ? '' : Number(value)
                )
              ]);
              setActiveTab(Number(value));
            }}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {LIST_STATUS_BUSINESS_PLAN.map(
              (
                status: {
                  id: number | null;
                  code: string;
                  label: string;
                  color: number;
                },
                index: number
              ) => (
                <Tab
                  key={index}
                  label={intl.formatMessage({ id: status.label })}
                  value={status.id}
                  iconPosition="end"
                  icon={
                    <Chip
                      label={(countListPO as any)[status.code] || 0}
                      variant="light"
                      size="small"
                      color={getTabColor(status.color)}
                      sx={{ ml: 0.5 }}
                    />
                  }
                />
              )
            )}
          </Tabs>
        </Box>

        <Box sx={{ p: 2.5 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
              <DebouncedInput
                value={globalFilter ?? ''}
                onFilterChange={(value) => setGlobalFilter(String(value))}
                placeholder={intl.formatMessage({ id: 'search_by_contract_code' })}
              />
              <Stack direction="row" spacing={2} alignItems="center">
                {/* CSV Export removed for HEAD version */}
              </Stack>
            </Stack>

            <ScrollX>
              {listBusinessPlan.length > 0 ? (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              const meta = header.column.columnDef.meta as Dynamic;

                              if (meta !== undefined && header.column.getCanSort()) {
                                Object.assign(meta, {
                                  className: meta.className + ' cursor-pointer prevent-select'
                                });
                              }

                              return (
                                <TableCell
                                  key={header.id}
                                  {...meta}
                                  onClick={header.column.getToggleSortingHandler()}
                                  {...(header.column.getCanSort() &&
                                    meta === undefined && {
                                      className: 'cursor-pointer prevent-select'
                                    })}
                                >
                                  {header.isPlaceholder ? null : (
                                    <Stack
                                      width={meta?.width || 'auto'}
                                      direction="row"
                                      sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}
                                    >
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
                      {!loading && (
                        <TableBody>
                          {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      )}
                    </Table>
                  </TableContainer>
                  {listBusinessPlan.length > 0 && (
                    <TablePagination
                      {...{
                        setPageSize: table.setPageSize,
                        setPageIndex: table.setPageIndex,
                        getState: table.getState,
                        getPageCount: table.getPageCount
                      }}
                    />
                  )}
                </>
              ) : (
                !loading && (
                  <Box py={4} textAlign="center">
                    <Typography variant="body1" color="text.secondary">
                      {intl.formatMessage({ id: 'no_approval_required' })}
                    </Typography>
                  </Box>
                )
              )}
              {loading && (
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={504}>
                  <CircularProgress />
                </Box>
              )}
            </ScrollX>
          </Stack>
        </Box>
        <ApprovalDialog
          open={approvalDialogOpen}
          selectedBusinessPlan={selectedBusinessPlan}
          onClose={handleCloseApprovalDialog}
          onApprove={handleApproveBusinessPlan}
          onReject={handleRejectBusinessPlan}
          getStatusText={getStatusText}
        />
      </MainCard>
    </>
  );
}
