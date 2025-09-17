import { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { CSVExport, DebouncedInput } from 'components/third-party/react-table';

// assets
import { PlusOutlined as AddIcon, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';

// types
interface PaymentRequest {
  id: string;
  code: string;
  serviceProviderName: string;
  serviceType: string;
  serviceUnitPrice: number;
  totalAmount: number;
  paymentReason: string;
  category: 'CONTRACT' | 'OTHER';
  contractType?: 'PURCHASE' | 'SALE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  requestDate: Date;
  approvalDate: Date | null;
  paymentDate: Date | null;
  notes: string;
  createdBy: string;
  requesterName: string;
}

// Mock data
const paymentRequests: PaymentRequest[] = [
  {
    id: '1',
    code: 'PR001',
    serviceProviderName: 'Công ty Vận tải Biển Đông',
    serviceType: 'Hợp đồng mua hàng',
    serviceUnitPrice: 50000,
    totalAmount: 250000000,
    paymentReason: 'Thanh toán theo hợp đồng mua hàng HĐ-2024-001',
    category: 'CONTRACT',
    contractType: 'PURCHASE',
    status: 'PENDING',
    requestDate: new Date('2024-01-15'),
    approvalDate: null,
    paymentDate: null,
    notes: 'Thanh toán đợt 1 theo hợp đồng mua hàng',
    createdBy: '1',
    requesterName: 'Nguyễn Văn A'
  },
  {
    id: '2',
    code: 'PR002',
    serviceProviderName: 'Công ty Logistics Miền Nam',
    serviceType: 'Dịch vụ kho bãi',
    serviceUnitPrice: 30000,
    totalAmount: 90000000,
    paymentReason: 'Chi phí thuê kho bãi quý 1/2024',
    category: 'OTHER',
    status: 'APPROVED',
    requestDate: new Date('2024-01-20'),
    approvalDate: new Date('2024-01-22'),
    paymentDate: null,
    notes: 'Chi phí thuê kho bãi 3 tháng',
    createdBy: '2',
    requesterName: 'Trần Thị B'
  },
  {
    id: '3',
    code: 'PR003',
    serviceProviderName: 'Công ty Kiểm định Chất lượng',
    serviceType: 'Dịch vụ kiểm định',
    serviceUnitPrice: 500000,
    totalAmount: 15000000,
    paymentReason: 'Phí kiểm định chất lượng sản phẩm',
    category: 'OTHER',
    status: 'PAID',
    requestDate: new Date('2024-01-10'),
    approvalDate: new Date('2024-01-12'),
    paymentDate: new Date('2024-01-15'),
    notes: 'Kiểm định chất lượng hàng hóa',
    createdBy: '1',
    requesterName: 'Nguyễn Văn A'
  },
  {
    id: '4',
    code: 'PR004',
    serviceProviderName: 'Công ty Bảo hiểm Bảo Việt',
    serviceType: 'Dịch vụ bảo hiểm',
    serviceUnitPrice: 1000000,
    totalAmount: 45000000,
    paymentReason: 'Phí bảo hiểm hàng hóa trong vận chuyển',
    category: 'OTHER',
    status: 'APPROVED',
    requestDate: new Date('2024-01-25'),
    approvalDate: new Date('2024-01-26'),
    paymentDate: null,
    notes: 'Bảo hiểm toàn rủi ro cho lô hàng xuất khẩu',
    createdBy: '3',
    requesterName: 'Lê Văn C'
  },
  {
    id: '5',
    code: 'PR005',
    serviceProviderName: 'Công ty ABC',
    serviceType: 'Hợp đồng bán hàng',
    serviceUnitPrice: 200000,
    totalAmount: 180000000,
    paymentReason: 'Thanh toán theo hợp đồng bán hàng HĐ-2024-005',
    category: 'CONTRACT',
    contractType: 'SALE',
    status: 'PENDING',
    requestDate: new Date('2024-01-28'),
    approvalDate: null,
    paymentDate: null,
    notes: 'Thanh toán đợt 2 theo hợp đồng bán hàng',
    createdBy: '2',
    requesterName: 'Trần Thị B'
  },
  {
    id: '6',
    code: 'PR006',
    serviceProviderName: 'Công ty XYZ',
    serviceType: 'Hợp đồng mua hàng',
    serviceUnitPrice: 300000,
    totalAmount: 120000000,
    paymentReason: 'Thanh toán theo hợp đồng mua nguyên liệu HĐ-2024-010',
    category: 'CONTRACT',
    contractType: 'PURCHASE',
    status: 'APPROVED',
    requestDate: new Date('2024-02-01'),
    approvalDate: new Date('2024-02-02'),
    paymentDate: null,
    notes: 'Thanh toán đợt 1 mua nguyên liệu',
    createdBy: '1',
    requesterName: 'Nguyễn Văn A'
  }
];

// ==============================|| PAYMENT REQUEST LIST PAGE ||============================== //

export default function PaymentRequestList() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PaymentRequest[]>(paymentRequests);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Approval modal states
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [selectedRequestForApproval, setSelectedRequestForApproval] = useState<PaymentRequest | null>(null);
  const [approvalAction, setApprovalAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [isProcessingApproval, setIsProcessingApproval] = useState<boolean>(false);

  // Tab state - Removed DRAFT status
  const statusGroups = ['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã thanh toán'];
  const statusMapping: Record<string, string> = {
    'Tất cả': 'ALL',
    'Chờ duyệt': 'PENDING',
    'Đã duyệt': 'APPROVED',
    'Từ chối': 'REJECTED',
    'Đã thanh toán': 'PAID'
  };

  const [activeTab, setActiveTab] = useState(statusGroups[0]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Form states for creating new payment request
  const [serviceProviderName, setServiceProviderName] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [serviceUnitPrice, setServiceUnitPrice] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentReason, setPaymentReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Count items by status
  const countGroup = requests.map((item: PaymentRequest) => item.status);
  const counts = countGroup.reduce(
    (acc: any, value: any) => ({
      ...acc,
      [value]: (acc[value] || 0) + 1
    }),
    {}
  );

  // Filter data based on active tab
  const filteredData = requests.filter((item) => {
    const statusFilter = activeTab === 'Tất cả' ? true : item.status === statusMapping[activeTab];
    const searchFilter = globalFilter
      ? item.code.toLowerCase().includes(globalFilter.toLowerCase()) ||
        item.serviceType.toLowerCase().includes(globalFilter.toLowerCase()) ||
        item.paymentReason.toLowerCase().includes(globalFilter.toLowerCase())
      : true;

    return statusFilter && searchFilter;
  });

  const handleNavigateToCreate = () => {
    // Navigate to create page
    navigate('/payment-request/create', {
      state: {
        returnUrl: '/payment-request'
      }
    });
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    // Reset form
    setServiceProviderName('');
    setServiceType('');
    setServiceUnitPrice(0);
    setTotalAmount(0);
    setPaymentReason('');
    setNotes('');
  };

  const handleServiceTypeChange = (event: SelectChangeEvent) => {
    setServiceType(event.target.value);
  };

  const handleCreatePaymentRequest = async () => {
    if (!serviceProviderName || !serviceType || !paymentReason || totalAmount <= 0) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      const newRequest: PaymentRequest = {
        id: (requests.length + 1).toString(),
        code: `PR${String(requests.length + 1).padStart(3, '0')}`,
        serviceProviderName,
        serviceType,
        serviceUnitPrice,
        totalAmount,
        paymentReason,
        category: serviceType === 'Hợp đồng' ? 'CONTRACT' : 'OTHER',
        status: 'PENDING',
        requestDate: new Date(),
        approvalDate: null,
        paymentDate: null,
        notes,
        createdBy: '1',
        requesterName: 'Current User'
      };

      setRequests([newRequest, ...requests]);
      alert('Tạo đề nghị thanh toán thành công!');
      handleCloseCreateModal();
    } catch (error) {
      console.error('Error creating payment request:', error);
      alert('Có lỗi xảy ra khi tạo đề nghị thanh toán');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'info';
      case 'REJECTED':
        return 'error';
      case 'PAID':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTabColor = (status: string) => {
    switch (status) {
      case 'Chờ duyệt':
        return 'warning';
      case 'Đã duyệt':
        return 'info';
      case 'Từ chối':
        return 'error';
      case 'Đã thanh toán':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Đã từ chối';
      case 'PAID':
        return 'Đã thanh toán';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('vi-VN');
  };

  const serviceTypes = [
    'Hợp đồng',
    'Dịch vụ vận chuyển',
    'Dịch vụ kho bãi',
    'Dịch vụ kiểm định',
    'Dịch vụ bảo hiểm',
    'Dịch vụ hải quan',
    'Dịch vụ logistics',
    'Dịch vụ tư vấn',
    'Dịch vụ bảo trì',
    'Dịch vụ khác'
  ];

  const handleOpenApprovalModal = (request: PaymentRequest, action: 'APPROVED' | 'REJECTED') => {
    setSelectedRequestForApproval(request);
    setApprovalAction(action);
    setApprovalNotes('');
    setIsApprovalModalOpen(true);
  };

  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setSelectedRequestForApproval(null);
    setApprovalAction('APPROVED');
    setApprovalNotes('');
  };

  const handleApprovalSubmit = async () => {
    if (!selectedRequestForApproval) return;

    setIsProcessingApproval(true);
    try {
      const updatedRequests = requests.map((request) => {
        if (request.id === selectedRequestForApproval.id) {
          return {
            ...request,
            status: approvalAction,
            approvalDate: new Date(),
            notes: approvalNotes || request.notes
          };
        }
        return request;
      });

      setRequests(updatedRequests);

      const actionText = approvalAction === 'APPROVED' ? 'phê duyệt' : 'từ chối';
      alert(`Đã ${actionText} đề nghị thanh toán thành công!`);
      handleCloseApprovalModal();
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Có lỗi xảy ra khi xử lý phê duyệt');
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handlePayment = (request: PaymentRequest) => {
    const updatedRequests = requests.map((req) => {
      if (req.id === request.id) {
        return {
          ...req,
          status: 'PAID' as const,
          paymentDate: new Date()
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    alert('Đã cập nhật trạng thái thành công!');
  };

  const handleViewRequest = (request: PaymentRequest) => {
    const category =
      request.category === 'CONTRACT' ? (request.contractType === 'PURCHASE' ? 'purchase_contract' : 'sale_contract') : 'other'; // Default for service requests

    navigate('/payment-request/view', {
      state: {
        category: category,
        requestId: request.id,
        requestData: request,
        returnUrl: '/payment-request'
      }
    });
  };

  const handleApproveRequest = (request: PaymentRequest) => {
    navigate(`/payment-request/approve/${request.id}`);
  };

  const handleEditRequest = (request: PaymentRequest) => {
    const category =
      request.category === 'CONTRACT' ? (request.contractType === 'PURCHASE' ? 'purchase_contract' : 'sale_contract') : 'other'; // Default for service requests

    navigate('/payment-request/update', {
      state: {
        category: category,
        requestId: request.id,
        requestData: request,
        returnUrl: '/payment-request'
      }
    });
  };

  const getContractTypeText = (contractType?: string) => {
    switch (contractType) {
      case 'PURCHASE':
        return 'Mua hàng';
      case 'SALE':
        return 'Bán hàng';
      default:
        return '';
    }
  };

  const getContractTypeColor = (contractType?: string) => {
    switch (contractType) {
      case 'PURCHASE':
        return 'success';
      case 'SALE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getServiceTypeColor = (serviceType: string) => {
    if (serviceType.includes('Hợp đồng mua hàng')) return 'success';
    if (serviceType.includes('Hợp đồng bán hàng')) return 'warning';
    if (serviceType.includes('Hợp đồng')) return 'primary';
    return 'default';
  };

  return (
    <>
      <MainCard content={false}>
        <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">Danh sách đề nghị thanh toán</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleNavigateToCreate}>
              Tạo đề nghị
            </Button>
          </Stack>

          <Tabs
            value={activeTab}
            onChange={(e: ChangeEvent<unknown>, value: string) => setActiveTab(value)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {statusGroups.map((status: string, index: number) => (
              <Tab
                key={index}
                label={status}
                value={status}
                iconPosition="end"
                icon={
                  <Chip
                    label={status === 'Tất cả' ? requests.length : counts[statusMapping[status]] || 0}
                    variant="light"
                    size="small"
                    color={getTabColor(status)}
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
                placeholder={`Tìm kiếm ${filteredData.length} đề nghị...`}
              />
              <Stack direction="row" spacing={2} alignItems="center">
                <CSVExport data={filteredData} filename={'payment-requests.csv'} />
              </Stack>
            </Stack>

            <ScrollX>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã đề nghị</TableCell>
                      <TableCell>Loại dịch vụ</TableCell>
                      <TableCell>Lý do thanh toán</TableCell>
                      <TableCell>Số tiền</TableCell>
                      <TableCell>Người yêu cầu</TableCell>
                      <TableCell>Ngày yêu cầu</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.code}</TableCell>
                        <TableCell>
                          {/* <Chip 
                            label={request.serviceType}
                            color={getServiceTypeColor(request.serviceType)}
                            size="small"
                          /> */}
                          <Typography variant="body2" noWrap>
                            {request.serviceType}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 250 }}>
                          <Tooltip title={request.paymentReason}>
                            <Typography variant="body2" noWrap>
                              {request.paymentReason}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{formatCurrency(request.totalAmount)}</TableCell>
                        <TableCell>{request.requesterName}</TableCell>
                        <TableCell>{formatDate(request.requestDate)}</TableCell>
                        <TableCell>
                          <Chip label={getStatusText(request.status)} color={getStatusColor(request.status)} size="small" />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {request.status === 'PENDING' && (
                              <Tooltip title="Phê duyệt">
                                <IconButton
                                  color="success"
                                  size="small"
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleApproveRequest(request);
                                  }}
                                >
                                  <CheckCircleOutlined />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(request.status === 'PENDING' || request.status === 'REJECTED') && (
                              <Tooltip title="Chỉnh sửa">
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleEditRequest(request);
                                  }}
                                >
                                  <EditOutlined />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ScrollX>

            {filteredData.length === 0 && (
              <Box py={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                  Không có đề nghị thanh toán nào
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </MainCard>

      {/* Create Payment Request Modal - This is now unused but kept for reference */}
      <Dialog
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
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
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>Tạo Đề Nghị Thanh Toán</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Service Provider */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="Nhà cung cấp dịch vụ"
                value={serviceProviderName}
                onChange={(e) => setServiceProviderName(e.target.value)}
                placeholder="Nhập tên nhà cung cấp dịch vụ"
              />
            </Grid>

            {/* Service Type */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Loại dịch vụ</InputLabel>
                <Select value={serviceType} label="Loại dịch vụ" onChange={handleServiceTypeChange}>
                  {serviceTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Payment Reason */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Lý do thanh toán"
                value={paymentReason}
                onChange={(e) => setPaymentReason(e.target.value)}
                placeholder="Nhập lý do thanh toán"
              />
            </Grid>

            {/* Unit Price */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Đơn giá dịch vụ"
                value={serviceUnitPrice}
                onChange={(e) => setServiceUnitPrice(parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0 }}
                InputProps={{
                  endAdornment: (
                    <Typography variant="body2" color="text.secondary">
                      VND
                    </Typography>
                  )
                }}
              />
            </Grid>

            {/* Total Amount */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Tổng số tiền"
                value={totalAmount}
                onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0 }}
                InputProps={{
                  endAdornment: (
                    <Typography variant="body2" color="text.secondary">
                      VND
                    </Typography>
                  )
                }}
              />
            </Grid>

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Ghi chú"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú cho đề nghị thanh toán..."
              />
            </Grid>

            {/* Summary */}
            {serviceProviderName && serviceType && totalAmount > 0 && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Tóm tắt đề nghị:</strong>
                    <br />
                    Nhà cung cấp: {serviceProviderName}
                    <br />
                    Loại dịch vụ: {serviceType}
                    <br />
                    Lý do: {paymentReason}
                    <br />
                    Tổng tiền: {formatCurrency(totalAmount)}
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateModal}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleCreatePaymentRequest}
            disabled={isSubmitting || !serviceProviderName || !serviceType || !paymentReason || totalAmount <= 0}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo đề nghị'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Modal */}
      <Dialog open={isApprovalModalOpen} onClose={handleCloseApprovalModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
          {approvalAction === 'APPROVED' ? 'Phê duyệt đề nghị thanh toán' : 'Từ chối đề nghị thanh toán'}
        </DialogTitle>
        <DialogContent>
          {selectedRequestForApproval && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              {/* Request Information */}
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Thông tin đề nghị:</strong>
                  <br />
                  Mã đề nghị: {selectedRequestForApproval.code}
                  <br />
                  Nhà cung cấp: {selectedRequestForApproval.serviceProviderName}
                  <br />
                  Loại dịch vụ: {selectedRequestForApproval.serviceType}
                  <br />
                  Lý do: {selectedRequestForApproval.paymentReason}
                  <br />
                  Số tiền: {formatCurrency(selectedRequestForApproval.totalAmount)}
                  <br />
                  Người yêu cầu: {selectedRequestForApproval.requesterName}
                </Typography>
              </Alert>

              {/* Action Confirmation */}
              <Alert severity={approvalAction === 'APPROVED' ? 'success' : 'warning'}>
                <Typography variant="body2">
                  {approvalAction === 'APPROVED'
                    ? 'Bạn có chắc chắn muốn phê duyệt đề nghị thanh toán này?'
                    : 'Bạn có chắc chắn muốn từ chối đề nghị thanh toán này?'}
                </Typography>
              </Alert>

              {/* Notes */}
              <TextField
                fullWidth
                multiline
                rows={4}
                label={approvalAction === 'APPROVED' ? 'Ghi chú phê duyệt' : 'Lý do từ chối'}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder={approvalAction === 'APPROVED' ? 'Nhập ghi chú phê duyệt (tùy chọn)...' : 'Nhập lý do từ chối (khuyến nghị)...'}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApprovalModal}>Hủy</Button>
          <Button
            variant="contained"
            color={approvalAction === 'APPROVED' ? 'success' : 'error'}
            onClick={handleApprovalSubmit}
            disabled={isProcessingApproval}
          >
            {isProcessingApproval ? 'Đang xử lý...' : approvalAction === 'APPROVED' ? 'Phê duyệt' : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
