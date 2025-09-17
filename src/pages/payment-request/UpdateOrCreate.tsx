// material-ui
import {
  PlusOutlined as AddIcon,
  ArrowLeftOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EditOutlined,
  FileTextOutlined,
  HistoryOutlined,
  TeamOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Fade,
  InputAdornment,
  Paper,
  Step,
  StepLabel,
  Stepper,
  useTheme,
  Zoom
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// third-party
import { useFormik } from 'formik';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';

// project imports
import MainCard from 'components/MainCard';
import { currencyToWords } from 'utils/currency';

// ==============================|| PAYMENT REQUEST CREATE PAGE ||============================== //

// Mock approval history data
interface ApprovalHistory {
  id: string;
  action: 'APPROVED' | 'REJECTED';
  date: Date;
  approver: string;
  notes: string;
}

const PaymentRequestUpdateOrCreate = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { category: initialCategory, returnUrl, requestData, requestId } = location.state || {};
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || (location.pathname.includes('/approve') ? 'purchase_contract' : '')
  );
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [isProcessingApproval, setIsProcessingApproval] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Determine mode from URL path
  const getCurrentMode = (): 'create' | 'update' | 'approve' => {
    const path = location.pathname;
    if (path.includes('/create')) return 'create';
    if (path.includes('/update')) return 'update';
    if (path.includes('/approve')) return 'approve';
    return 'create';
  };

  const [currentMode, setCurrentMode] = useState<'create' | 'update' | 'approve'>(getCurrentMode());

  // Mock approval history - in real app would come from API
  const approvalHistory: ApprovalHistory[] = [
    {
      id: '1',
      action: 'REJECTED',
      date: new Date('2024-01-10'),
      approver: 'Nguyễn Văn A',
      notes: 'Cần bổ sung thêm thông tin về hợp đồng'
    },
    {
      id: '2',
      action: 'REJECTED',
      date: new Date('2024-01-15'),
      approver: 'Trần Thị B',
      notes: 'Số tiền không khớp với hợp đồng'
    }
  ];

  const handleBack = () => {
    navigate(returnUrl || '/payment-request');
  };

  const handleEditMode = () => {
    navigate('/payment-request/update', {
      state: {
        category: selectedCategory,
        requestId,
        requestData,
        returnUrl
      }
    });
  };

  const handleApproval = async (action: 'APPROVED' | 'REJECTED') => {
    if (action === 'REJECTED' && !approvalNotes.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setIsProcessingApproval(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const actionText = action === 'APPROVED' ? 'phê duyệt' : 'từ chối';
      alert(`Đã ${actionText} đề nghị thanh toán thành công!`);

      // Navigate back to list
      navigate(returnUrl || '/payment-request');
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Có lỗi xảy ra khi xử lý phê duyệt');
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Category options for dropdown with icons
  const categoryOptions = [
    {
      value: 'purchase_contract',
      label: 'Hợp đồng Mua hàng',
      type: 'contract',
      icon: <FileTextOutlined />,
      description: 'Thanh toán theo hợp đồng mua hàng đã ký kết'
    },
    {
      value: 'sale_contract',
      label: 'Hợp đồng Bán hàng',
      type: 'contract',
      icon: <FileTextOutlined />,
      description: 'Thanh toán theo hợp đồng bán hàng đã ký kết'
    },
    {
      value: 'transportation',
      label: 'Dịch vụ Vận chuyển',
      type: 'service',
      icon: <TeamOutlined />,
      description: 'Thanh toán cho các dịch vụ vận chuyển hàng hóa'
    },
    {
      value: 'warehouse',
      label: 'Dịch vụ Kho bãi',
      type: 'service',
      icon: <BankOutlined />,
      description: 'Thanh toán cho dịch vụ lưu trữ, kho bãi'
    },
    {
      value: 'inspection',
      label: 'Dịch vụ Kiểm định',
      type: 'service',
      icon: <CheckCircleOutlined />,
      description: 'Thanh toán cho các dịch vụ kiểm định chất lượng'
    },
    {
      value: 'insurance',
      label: 'Dịch vụ Bảo hiểm',
      type: 'service',
      icon: <CheckCircleOutlined />,
      description: 'Thanh toán phí bảo hiểm hàng hóa'
    },
    {
      value: 'customs',
      label: 'Dịch vụ Hải quan',
      type: 'service',
      icon: <FileTextOutlined />,
      description: 'Thanh toán cho thủ tục hải quan'
    },
    {
      value: 'logistics',
      label: 'Dịch vụ Logistics',
      type: 'service',
      icon: <TeamOutlined />,
      description: 'Thanh toán cho dịch vụ logistics tổng thể'
    },
    {
      value: 'consulting',
      label: 'Dịch vụ Tư vấn',
      type: 'service',
      icon: <TeamOutlined />,
      description: 'Thanh toán cho các dịch vụ tư vấn chuyên nghiệp'
    },
    {
      value: 'maintenance',
      label: 'Dịch vụ Bảo trì',
      type: 'service',
      icon: <CheckCircleOutlined />,
      description: 'Thanh toán cho dịch vụ bảo trì, sửa chữa'
    },
    {
      value: 'other',
      label: 'Dịch vụ Khác',
      type: 'service',
      icon: <TeamOutlined />,
      description: 'Thanh toán cho các dịch vụ khác'
    }
  ];

  const getCategoryTitle = (category: string) => {
    const option = categoryOptions.find((opt) => opt.value === category);
    return option ? option.label : 'Đề nghị thanh toán';
  };

  const isContractCategory = selectedCategory === 'purchase_contract' || selectedCategory === 'sale_contract';

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentStep(1);
  };

  const getPageTitle = () => {
    switch (currentMode) {
      case 'approve':
        return 'Phê duyệt đề nghị thanh toán';
      case 'update':
        return 'Chỉnh sửa đề nghị thanh toán';
      default:
        return 'Tạo đề nghị thanh toán';
    }
  };

  const getPageIcon = () => {
    switch (currentMode) {
      case 'approve':
        return <CheckCircleOutlined />;
      case 'update':
        return <EditOutlined />;
      default:
        return <AddIcon />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('vi-VN');
  };

  const steps = ['Chọn loại thanh toán', 'Nhập thông tin chi tiết', 'Xác nhận và gửi'];

  return (
    <MainCard content={false}>
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Category Selection - Only show in create mode */}
          {currentMode === 'create' && (
            <Fade in={true} timeout={600}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
                    p: 3,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: theme.palette.primary.main,
                        color: 'white'
                      }}
                    >
                      1
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        Chọn loại đề nghị thanh toán
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lựa chọn loại thanh toán phù hợp với nhu cầu của bạn
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Autocomplete
                    options={categoryOptions}
                    getOptionLabel={(option) => option.label}
                    value={categoryOptions.find((option) => option.value === selectedCategory) || null}
                    onChange={(_, newValue) => {
                      if (newValue) {
                        handleCategorySelect(newValue.value);
                      } else {
                        setSelectedCategory('');
                        setCurrentStep(0);
                      }
                    }}
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        {...props}
                        sx={{
                          p: 2,
                          '&:hover': {
                            bgcolor: theme.palette.action.hover
                          }
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center" width="100%">
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 36,
                              height: 36,
                              borderRadius: '8px',
                              bgcolor: option.type === 'contract' ? theme.palette.primary.lighter : theme.palette.secondary.lighter,
                              color: option.type === 'contract' ? theme.palette.primary.main : theme.palette.secondary.main
                            }}
                          >
                            {option.icon}
                          </Box>
                          <Box flex={1}>
                            <Typography variant="subtitle2" fontWeight="600">
                              {option.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                          </Box>
                          <Chip
                            label={option.type === 'contract' ? 'Hợp đồng' : 'Dịch vụ'}
                            size="small"
                            color={option.type === 'contract' ? 'primary' : 'secondary'}
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Loại đề nghị thanh toán"
                        placeholder="Tìm kiếm và chọn loại thanh toán..."
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <DollarOutlined style={{ color: theme.palette.text.secondary }} />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                  />

                  {selectedCategory && (
                    <Zoom in={true} timeout={400}>
                      <Alert severity="info" sx={{ mt: 2 }} icon={<CheckCircleOutlined />}>
                        Bạn đã chọn: <strong>{getCategoryTitle(selectedCategory)}</strong>. Tiếp tục để nhập thông tin chi tiết.
                      </Alert>
                    </Zoom>
                  )}
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Main Form */}
          {(selectedCategory || currentMode !== 'create') && (
            <Fade in={true} timeout={800}>
              <Stack spacing={3}>
                {/* Approval Section - Only show in approve mode */}
                {currentMode === 'approve' && requestData?.status === 'PENDING' && (
                  <Card elevation={0} sx={{ border: `1px solid ${theme.palette.warning.main}`, borderRadius: 3 }}>
                    <Box
                      sx={{
                        background: `linear-gradient(135deg, ${theme.palette.warning.lighter} 0%, ${theme.palette.warning.light} 100%)`,
                        p: 3,
                        borderBottom: `1px solid ${theme.palette.warning.main}`
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <ClockCircleOutlined style={{ color: theme.palette.warning.main, fontSize: 24 }} />
                        <Box>
                          <Typography variant="h6" fontWeight="600" color="warning.dark">
                            Phê duyệt đề nghị thanh toán
                          </Typography>
                          <Typography variant="body2" color="warning.dark">
                            Xem xét kỹ thông tin và đưa ra quyết định phê duyệt
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                          <Stack spacing={3}>
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              label="Ghi chú phê duyệt"
                              value={approvalNotes}
                              onChange={(e) => setApprovalNotes(e.target.value)}
                              placeholder="Nhập ghi chú phê duyệt hoặc lý do từ chối..."
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <FileTextOutlined style={{ color: theme.palette.text.secondary }} />
                                  </InputAdornment>
                                )
                              }}
                            />

                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                              <Button
                                variant="outlined"
                                color="error"
                                size="large"
                                onClick={() => handleApproval('REJECTED')}
                                disabled={isProcessingApproval}
                                sx={{ minWidth: 120 }}
                              >
                                {isProcessingApproval ? 'Đang xử lý...' : 'Từ chối'}
                              </Button>
                              <Button
                                variant="contained"
                                color="success"
                                size="large"
                                onClick={() => handleApproval('APPROVED')}
                                disabled={isProcessingApproval}
                                sx={{ minWidth: 120 }}
                              >
                                {isProcessingApproval ? 'Đang xử lý...' : 'Phê duyệt'}
                              </Button>
                            </Stack>
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Approval History - Only show in approve mode and if there's history */}
                {currentMode === 'approve' && approvalHistory.length > 0 && (
                  <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
                    <Box
                      sx={{
                        background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
                        p: 3,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <HistoryOutlined style={{ color: theme.palette.text.primary, fontSize: 24 }} />
                        <Typography variant="h6" fontWeight="600">
                          Lịch sử phê duyệt
                        </Typography>
                      </Stack>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        {approvalHistory.map((history) => (
                          <Paper
                            key={history.id}
                            elevation={0}
                            sx={{
                              p: 3,
                              border: '1px solid',
                              borderColor: history.action === 'APPROVED' ? 'success.main' : 'error.main',
                              borderRadius: 2,
                              bgcolor: history.action === 'APPROVED' ? 'success.lighter' : 'error.lighter'
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                              <Chip
                                label={history.action === 'APPROVED' ? 'Đã phê duyệt' : 'Đã từ chối'}
                                color={history.action === 'APPROVED' ? 'success' : 'error'}
                                icon={history.action === 'APPROVED' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(history.date)}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Người phê duyệt:</strong> {history.approver}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Ghi chú:</strong> {history.notes}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Form */}
                {isContractCategory ? (
                  <ContractPaymentForm
                    category={selectedCategory}
                    mode={currentMode}
                    requestData={requestData}
                    initialValues={
                      currentMode === 'approve'
                        ? {
                            contractId: 'HD-2024-001',
                            paymentPurpose: 'Tạm ứng thanh toán theo hợp đồng mua hàng',
                            amount: '100000000',
                            paymentStartDate: new Date(),
                            paymentEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                          }
                        : undefined
                    }
                  />
                ) : (
                  <ServicePaymentForm
                    category={selectedCategory}
                    mode={currentMode}
                    requestData={requestData}
                    initialValues={
                      currentMode === 'approve'
                        ? {
                            serviceType:
                              selectedCategory === 'transportation'
                                ? 'Vận chuyển đường biển'
                                : selectedCategory === 'warehouse'
                                  ? 'Thuê kho'
                                  : selectedCategory === 'inspection'
                                    ? 'Kiểm định chất lượng'
                                    : selectedCategory === 'insurance'
                                      ? 'Bảo hiểm hàng hóa'
                                      : selectedCategory === 'customs'
                                        ? 'Thủ tục hải quan'
                                        : selectedCategory === 'logistics'
                                          ? 'Quản lý chuỗi cung ứng'
                                          : selectedCategory === 'consulting'
                                            ? 'Tư vấn pháp lý'
                                            : selectedCategory === 'maintenance'
                                              ? 'Bảo trì thiết bị'
                                              : 'Dịch vụ khác',
                            providerName:
                              selectedCategory === 'transportation'
                                ? 'Công ty Vận tải Biển Việt Nam'
                                : selectedCategory === 'warehouse'
                                  ? 'Công ty Kho vận Minh Phát'
                                  : selectedCategory === 'inspection'
                                    ? 'Viện Kiểm định Chất lượng Quốc gia'
                                    : selectedCategory === 'insurance'
                                      ? 'Tổng Công ty Bảo hiểm Bảo Việt'
                                      : selectedCategory === 'customs'
                                        ? 'Công ty Dịch vụ Hải quan Thành Đạt'
                                        : selectedCategory === 'logistics'
                                          ? 'Công ty Logistics Sài Gòn'
                                          : selectedCategory === 'consulting'
                                            ? 'Công ty Luật TNHH Minh Khuê'
                                            : selectedCategory === 'maintenance'
                                              ? 'Công ty Bảo trì Kỹ thuật Cao'
                                              : 'Nhà cung cấp dịch vụ ABC',
                            amount: '75000000',
                            paymentReason: 'Thanh toán dịch vụ theo hợp đồng đã ký kết',
                            paymentStartDate: new Date(),
                            paymentEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                          }
                        : undefined
                    }
                  />
                )}
              </Stack>
            </Fade>
          )}
        </Stack>
      </Box>
    </MainCard>
  );
};

// ==============================|| CONTRACT PAYMENT FORM ||============================== //

// Define the form values interface for contracts
interface ContractPaymentFormValues {
  contractId: string;
  paymentPurpose: string;
  amount: string;
  paymentStartDate: Date | null;
  paymentEndDate: Date | null;
}

// Props interface for contract form
interface ContractPaymentFormProps {
  category: string;
  initialValues?: Partial<ContractPaymentFormValues>;
  mode?: 'create' | 'update' | 'approve';
  requestData?: any;
}

// Define types for contract
interface ContractType {
  id: string;
  code: string;
  customerName: string;
  contractDate: Date;
  label: string;
}

const contractValidationSchema = yup.object({
  contractId: yup.string().required('Hợp đồng là bắt buộc'),
  paymentPurpose: yup.string().required('Mục đích thanh toán là bắt buộc'),
  amount: yup.string().required('Số tiền là bắt buộc'),
  paymentStartDate: yup.date().nullable().required('Ngày bắt đầu thanh toán là bắt buộc'),
  paymentEndDate: yup
    .date()
    .nullable()
    .required('Ngày kết thúc thanh toán là bắt buộc')
    .min(yup.ref('paymentStartDate'), 'Ngày kết thúc phải sau ngày bắt đầu')
});

const ContractPaymentForm = ({ category, initialValues, mode = 'create' }: ContractPaymentFormProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const isReadOnly = mode === 'approve';

  const formik = useFormik<ContractPaymentFormValues>({
    initialValues: {
      contractId: initialValues?.contractId || '',
      paymentPurpose: initialValues?.paymentPurpose || '',
      amount: initialValues?.amount || '',
      paymentStartDate: initialValues?.paymentStartDate || null,
      paymentEndDate: initialValues?.paymentEndDate || null
    },
    validationSchema: contractValidationSchema,
    onSubmit: (values) => {
      console.log('Contract payment form submitted:', values);
      alert('Tạo đề nghị thanh toán thành công!');
      navigate('/payment-request/list');
    }
  });

  // Mock data for contracts with new format
  const availableContracts: ContractType[] = [
    {
      id: 'HD-2024-001',
      code: 'HD-2024-001',
      customerName: 'Công ty TNHH ABC',
      contractDate: new Date('2024-01-10'),
      label: 'HD-2024-001 - Công ty TNHH ABC - 10/01/2024'
    },
    {
      id: 'HD-2024-002',
      code: 'HD-2024-002',
      customerName: 'Công ty Cổ phần XYZ',
      contractDate: new Date('2024-01-15'),
      label: 'HD-2024-002 - Công ty Cổ phần XYZ - 15/01/2024'
    },
    {
      id: 'HD-2024-003',
      code: 'HD-2024-003',
      customerName: 'Tập đoàn DEF',
      contractDate: new Date('2024-01-20'),
      label: 'HD-2024-003 - Tập đoàn DEF - 20/01/2024'
    }
  ];

  // Format currency
  const formatCurrency = (value: string) => {
    if (!value) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.lighter} 0%, ${theme.palette.primary.light} 100%)`,
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              color: 'white'
            }}
          >
            <FileTextOutlined />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="600" color="primary.dark">
              Thông tin thanh toán hợp đồng
            </Typography>
            <Typography variant="body2" color="primary.dark" sx={{ opacity: 0.8 }}>
              Nhập thông tin chi tiết cho đề nghị thanh toán theo hợp đồng
            </Typography>
          </Box>
        </Stack>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1.5 }}>
                <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Chọn hợp đồng *</InputLabel>
                <Autocomplete
                  options={availableContracts}
                  getOptionLabel={(option: ContractType) => option.label}
                  value={availableContracts.find((c) => c.id === formik.values.contractId) || null}
                  onChange={(_, newValue) => {
                    if (!isReadOnly) {
                      formik.setFieldValue('contractId', newValue ? newValue.id : '');
                    }
                  }}
                  disabled={isReadOnly}
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        p: 2,
                        '&:hover': {
                          bgcolor: theme.palette.action.hover
                        }
                      }}
                    >
                      <Stack spacing={1} width="100%">
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight="600">
                            {option.code}
                          </Typography>
                          <Chip label={option.contractDate.toLocaleDateString('vi-VN')} size="small" variant="outlined" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {option.customerName}
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Tìm kiếm và chọn hợp đồng..."
                      disabled={isReadOnly}
                      error={formik.touched.contractId && Boolean(formik.errors.contractId)}
                      helperText={formik.touched.contractId && formik.errors.contractId}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <FileTextOutlined style={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1.5 }}>
                <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Số tiền *</InputLabel>
                <TextField
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="Nhập số tiền thanh toán"
                  fullWidth
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isReadOnly}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DollarOutlined style={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">VND</InputAdornment>
                  }}
                />
                {formik.values.amount && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: theme.palette.success.lighter,
                      border: `1px solid ${theme.palette.success.light}`,
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" color="success.dark" fontWeight="600">
                      Số tiền bằng chữ: {currencyToWords(Number(formik.values.amount))}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {/*<Stack sx={{ gap: 1.5 }}>*/}
              {/*  <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Từ ngày *</InputLabel>*/}
              {/*  <DatePicker*/}
              {/*    value={formik.values.paymentStartDate}*/}
              {/*    onChange={(newValue) => {*/}
              {/*      if (!isReadOnly) {*/}
              {/*        formik.setFieldValue('paymentStartDate', newValue);*/}
              {/*      }*/}
              {/*    }}*/}
              {/*    disabled={isReadOnly}*/}
              {/*    enableAccessibleFieldDOMStructure={false}*/}
              {/*    slots={{*/}
              {/*      textField: (params) => (*/}
              {/*        <TextField*/}
              {/*          {...params}*/}
              {/*          fullWidth*/}
              {/*          error={formik.touched.paymentStartDate && Boolean(formik.errors.paymentStartDate)}*/}
              {/*          helperText={formik.touched.paymentStartDate && formik.errors.paymentStartDate}*/}
              {/*          placeholder="Chọn ngày bắt đầu thanh toán"*/}
              {/*        />*/}
              {/*      )*/}
              {/*    }}*/}
              {/*  />*/}
              {/*</Stack>*/}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {/*<Stack sx={{ gap: 1.5 }}>*/}
              {/*  <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Đến ngày *</InputLabel>*/}
              {/*  <DatePicker*/}
              {/*    value={formik.values.paymentEndDate}*/}
              {/*    onChange={(newValue) => {*/}
              {/*      if (!isReadOnly) {*/}
              {/*        formik.setFieldValue('paymentEndDate', newValue);*/}
              {/*      }*/}
              {/*    }}*/}
              {/*    disabled={isReadOnly}*/}
              {/*    minDate={formik.values.paymentStartDate || undefined}*/}
              {/*    enableAccessibleFieldDOMStructure={false}*/}
              {/*    slots={{*/}
              {/*      textField: (params) => (*/}
              {/*        <TextField*/}
              {/*          {...params}*/}
              {/*          fullWidth*/}
              {/*          error={formik.touched.paymentEndDate && Boolean(formik.errors.paymentEndDate)}*/}
              {/*          helperText={formik.touched.paymentEndDate && formik.errors.paymentEndDate}*/}
              {/*          placeholder="Chọn ngày kết thúc thanh toán"*/}
              {/*        />*/}
              {/*      )*/}
              {/*    }}*/}
              {/*  />*/}
              {/*</Stack>*/}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1.5 }}>
                <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Mục đích thanh toán *</InputLabel>
                <TextField
                  id="paymentPurpose"
                  name="paymentPurpose"
                  placeholder="Mô tả chi tiết mục đích thanh toán..."
                  fullWidth
                  multiline
                  rows={4}
                  value={formik.values.paymentPurpose}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isReadOnly}
                  error={formik.touched.paymentPurpose && Boolean(formik.errors.paymentPurpose)}
                  helperText={formik.touched.paymentPurpose && formik.errors.paymentPurpose}
                />
              </Stack>
            </Grid>

            {!isReadOnly && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 2,
                    bgcolor: theme.palette.grey[50],
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="outlined" size="large" onClick={() => navigate('/payment-request/list')} sx={{ minWidth: 120 }}>
                      Hủy bỏ
                    </Button>
                    <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting} sx={{ minWidth: 120 }}>
                      {formik.isSubmitting ? 'Đang xử lý...' : 'Tạo đề nghị'}
                    </Button>
                  </Stack>
                </Box>
              </Grid>
            )}
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

// ==============================|| SERVICE PAYMENT FORM ||============================== //

// Define service payment form values
interface ServicePaymentFormValues {
  serviceType: string;
  providerName: string;
  amount: string;
  paymentReason: string;
  paymentStartDate: Date | null;
  paymentEndDate: Date | null;
}

// Props interface for service form
interface ServicePaymentFormProps {
  category: string;
  initialValues?: Partial<ServicePaymentFormValues>;
  mode?: 'create' | 'update' | 'approve';
  requestData?: any;
}

const serviceValidationSchema = yup.object({
  serviceType: yup.string().required('Loại dịch vụ là bắt buộc'),
  providerName: yup.string().required('Nhà cung cấp là bắt buộc'),
  amount: yup.string().required('Số tiền là bắt buộc'),
  paymentReason: yup.string().required('Lý do thanh toán là bắt buộc'),
  paymentStartDate: yup.date().nullable().required('Ngày bắt đầu thanh toán là bắt buộc'),
  paymentEndDate: yup
    .date()
    .nullable()
    .required('Ngày kết thúc thanh toán là bắt buộc')
    .min(yup.ref('paymentStartDate'), 'Ngày kết thúc phải sau ngày bắt đầu')
});

const ServicePaymentForm = ({ category, initialValues, mode = 'create' }: ServicePaymentFormProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const isReadOnly = mode === 'approve';

  const formik = useFormik<ServicePaymentFormValues>({
    initialValues: {
      serviceType: initialValues?.serviceType || '',
      providerName: initialValues?.providerName || '',
      amount: initialValues?.amount || '',
      paymentReason: initialValues?.paymentReason || '',
      paymentStartDate: initialValues?.paymentStartDate || null,
      paymentEndDate: initialValues?.paymentEndDate || null
    },
    validationSchema: serviceValidationSchema,
    onSubmit: (values) => {
      console.log('Service payment form submitted:', values);
      alert('Tạo đề nghị thanh toán thành công!');
      navigate('/payment-request/list');
    }
  });

  // Service types based on category
  const getServiceTypeOptions = (category: string) => {
    const serviceMap: Record<string, string[]> = {
      transportation: ['Vận chuyển đường bộ', 'Vận chuyển đường biển', 'Vận chuyển đường hàng không', 'Vận chuyển đường sắt'],
      warehouse: ['Thuê kho', 'Bảo quản hàng hóa', 'Đóng gói', 'Phân loại hàng hóa'],
      inspection: ['Kiểm định chất lượng', 'Kiểm định an toàn', 'Kiểm định môi trường', 'Kiểm định khác'],
      insurance: ['Bảo hiểm hàng hóa', 'Bảo hiểm vận chuyển', 'Bảo hiểm trách nhiệm', 'Bảo hiểm khác'],
      customs: ['Thủ tục hải quan', 'Tư vấn hải quan', 'Khai báo hải quan', 'Dịch vụ hải quan khác'],
      logistics: ['Quản lý chuỗi cung ứng', 'Phối hợp logistics', 'Tư vấn logistics', 'Dịch vụ logistics khác'],
      consulting: ['Tư vấn pháp lý', 'Tư vấn kỹ thuật', 'Tư vấn quản lý', 'Tư vấn khác'],
      maintenance: ['Bảo trì thiết bị', 'Sửa chữa', 'Bảo dưỡng', 'Dịch vụ bảo trì khác'],
      other: ['Dịch vụ khác']
    };
    return serviceMap[category] || ['Dịch vụ khác'];
  };

  const serviceTypeOptions = getServiceTypeOptions(category);

  // Service providers based on category
  const getServiceProviders = (category: string) => {
    const providerMap: Record<string, string[]> = {
      transportation: [
        'Công ty Vận tải Biển Việt Nam',
        'Công ty TNHH Vận tải ABC',
        'Tập đoàn Logistics Sài Gòn',
        'Đơn vị vận chuyển Hàng không DEF',
        'Công ty Vận tải Đường sắt GHI'
      ],
      warehouse: [
        'Công ty Kho vận Minh Phát',
        'Tập đoàn Kho bãi Thành Đạt',
        'Công ty TNHH Lưu trữ XYZ',
        'Kho vận Quốc tế ABC',
        'Công ty Kho bãi Logistics DEF'
      ],
      inspection: [
        'Viện Kiểm định Chất lượng Quốc gia',
        'Công ty Kiểm định SGS',
        'Trung tâm Kiểm định Intertek',
        'Công ty TNHH Kiểm định TUV',
        'Viện Kiểm định Tiêu chuẩn Việt Nam'
      ],
      insurance: [
        'Tổng Công ty Bảo hiểm Bảo Việt',
        'Công ty Bảo hiểm Petrolimex',
        'Bảo hiểm Hàng hóa Quốc tế',
        'Công ty TNHH Bảo hiểm AAA',
        'Tập đoàn Bảo hiểm Maritime'
      ],
      customs: [
        'Công ty Dịch vụ Hải quan Thành Đạt',
        'Tập đoàn Hải quan Logistics',
        'Công ty TNHH Thủ tục Hải quan XYZ',
        'Dịch vụ Hải quan Quốc tế ABC',
        'Công ty Hải quan Express DEF'
      ],
      logistics: [
        'Công ty Logistics Sài Gòn',
        'Tập đoàn Chuỗi cung ứng Việt Nam',
        'Công ty TNHH Logistics Toàn Cầu',
        'DHL Supply Chain',
        'Fedex Logistics Services'
      ],
      consulting: [
        'Công ty Luật TNHH Minh Khuê',
        'Tập đoàn Tư vấn Quản lý ABC',
        'Công ty Tư vấn Kỹ thuật DEF',
        'Ernst & Young Việt Nam',
        'PwC Consulting Services'
      ],
      maintenance: [
        'Công ty Bảo trì Kỹ thuật Cao',
        'Tập đoàn Bảo dưỡng Thiết bị ABC',
        'Công ty TNHH Sửa chữa Chuyên nghiệp',
        'Dịch vụ Bảo trì Công nghiệp DEF',
        'Công ty Maintenance Solutions'
      ],
      other: [
        'Nhà cung cấp dịch vụ ABC',
        'Công ty Dịch vụ Tổng hợp XYZ',
        'Tập đoàn Dịch vụ Đa ngành DEF',
        'Công ty TNHH Dịch vụ Chuyên nghiệp',
        'Dịch vụ Hỗ trợ Doanh nghiệp GHI'
      ]
    };
    return providerMap[category] || providerMap['other'];
  };

  const serviceProviders = getServiceProviders(category);

  // Format currency
  const formatCurrency = (value: string) => {
    if (!value) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.secondary.lighter} 0%, ${theme.palette.secondary.light} 100%)`,
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: theme.palette.secondary.main,
              color: 'white'
            }}
          >
            <TeamOutlined />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="600" color="secondary.dark">
              Thông tin thanh toán dịch vụ
            </Typography>
            <Typography variant="body2" color="secondary.dark" sx={{ opacity: 0.8 }}>
              Nhập thông tin chi tiết cho đề nghị thanh toán dịch vụ
            </Typography>
          </Box>
        </Stack>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack sx={{ gap: 1.5 }}>
                <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Loại dịch vụ *</InputLabel>
                <Autocomplete
                  options={serviceTypeOptions}
                  value={formik.values.serviceType || null}
                  onChange={(_, newValue) => {
                    if (!isReadOnly) {
                      formik.setFieldValue('serviceType', newValue || '');
                    }
                  }}
                  disabled={isReadOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn loại dịch vụ..."
                      disabled={isReadOnly}
                      error={formik.touched.serviceType && Boolean(formik.errors.serviceType)}
                      helperText={formik.touched.serviceType && formik.errors.serviceType}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <TeamOutlined style={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Stack sx={{ gap: 1.5 }}>
                <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Nhà cung cấp dịch vụ *</InputLabel>
                <Autocomplete
                  options={serviceProviders}
                  value={formik.values.providerName || null}
                  onChange={(_, newValue) => {
                    if (!isReadOnly) {
                      formik.setFieldValue('providerName', newValue || '');
                    }
                  }}
                  freeSolo={!isReadOnly}
                  disabled={isReadOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn hoặc nhập tên nhà cung cấp dịch vụ..."
                      disabled={isReadOnly}
                      error={formik.touched.providerName && Boolean(formik.errors.providerName)}
                      helperText={formik.touched.providerName && formik.errors.providerName}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <BankOutlined style={{ color: theme.palette.text.secondary }} />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1.5 }}>
                <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Số tiền *</InputLabel>
                <TextField
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="Nhập số tiền thanh toán"
                  fullWidth
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isReadOnly}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DollarOutlined style={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">VND</InputAdornment>
                  }}
                />
                {formik.values.amount && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: theme.palette.success.lighter,
                      border: `1px solid ${theme.palette.success.light}`,
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" color="success.dark" fontWeight="600">
                      Số tiền bằng chữ: {currencyToWords(Number(formik.values.amount))}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {/*<Stack sx={{ gap: 1.5 }}>*/}
              {/*  <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Từ ngày *</InputLabel>*/}
              {/*  <DatePicker*/}
              {/*    value={formik.values.paymentStartDate}*/}
              {/*    onChange={(newValue) => {*/}
              {/*      if (!isReadOnly) {*/}
              {/*        formik.setFieldValue('paymentStartDate', newValue);*/}
              {/*      }*/}
              {/*    }}*/}
              {/*    disabled={isReadOnly}*/}
              {/*    enableAccessibleFieldDOMStructure={false}*/}
              {/*    slots={{*/}
              {/*      textField: (params) => (*/}
              {/*        <TextField*/}
              {/*          {...params}*/}
              {/*          fullWidth*/}
              {/*          error={formik.touched.paymentStartDate && Boolean(formik.errors.paymentStartDate)}*/}
              {/*          helperText={formik.touched.paymentStartDate && formik.errors.paymentStartDate}*/}
              {/*          placeholder="Chọn ngày bắt đầu thanh toán"*/}
              {/*        />*/}
              {/*      )*/}
              {/*    }}*/}
              {/*  />*/}
              {/*</Stack>*/}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {/*<Stack sx={{ gap: 1.5 }}>*/}
              {/*  <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Đến ngày *</InputLabel>*/}
              {/*  <DatePicker*/}
              {/*    value={formik.values.paymentEndDate}*/}
              {/*    onChange={(newValue) => {*/}
              {/*      if (!isReadOnly) {*/}
              {/*        formik.setFieldValue('paymentEndDate', newValue);*/}
              {/*      }*/}
              {/*    }}*/}
              {/*    disabled={isReadOnly}*/}
              {/*    minDate={formik.values.paymentStartDate || undefined}*/}
              {/*    enableAccessibleFieldDOMStructure={false}*/}
              {/*    slots={{*/}
              {/*      textField: (params) => (*/}
              {/*        <TextField*/}
              {/*          {...params}*/}
              {/*          fullWidth*/}
              {/*          error={formik.touched.paymentEndDate && Boolean(formik.errors.paymentEndDate)}*/}
              {/*          helperText={formik.touched.paymentEndDate && formik.errors.paymentEndDate}*/}
              {/*          placeholder="Chọn ngày kết thúc thanh toán"*/}
              {/*        />*/}
              {/*      )*/}
              {/*    }}*/}
              {/*  />*/}
              {/*</Stack>*/}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1.5 }}>
                <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Lý do thanh toán *</InputLabel>
                <TextField
                  id="paymentReason"
                  name="paymentReason"
                  placeholder="Mô tả chi tiết lý do thanh toán..."
                  fullWidth
                  multiline
                  rows={4}
                  value={formik.values.paymentReason}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isReadOnly}
                  error={formik.touched.paymentReason && Boolean(formik.errors.paymentReason)}
                  helperText={formik.touched.paymentReason && formik.errors.paymentReason}
                />
              </Stack>
            </Grid>

            {!isReadOnly && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 2,
                    bgcolor: theme.palette.grey[50],
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="outlined" size="large" onClick={() => navigate('/payment-request')} sx={{ minWidth: 120 }}>
                      Hủy bỏ
                    </Button>
                    <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting} sx={{ minWidth: 120 }}>
                      {formik.isSubmitting ? 'Đang xử lý...' : 'Tạo đề nghị'}
                    </Button>
                  </Stack>
                </Box>
              </Grid>
            )}
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentRequestUpdateOrCreate;
