// material-ui
import {
  PlusOutlined as AddIcon,
  ArrowLeftOutlined,
  BankOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  PictureOutlined,
  NumberOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Fade,
  FormHelperText,
  InputAdornment,
  Paper,
  useTheme,
  Zoom,
  Divider
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
import UploadMultiFile from 'components/third-party/dropzone/MultiFile';
import { currencyToWords } from 'utils/currency';

// types
import { CustomFile } from 'types/dropzone';

// ==============================|| ACCOUNTING CREATE PAGE ||============================== //

const AccountingCreate = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { returnUrl } = location.state || {};
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDirection, setSelectedDirection] = useState<'income' | 'expense'>('income');
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleBack = () => {
    navigate(returnUrl || '/accounting');
  };

  // Direction options with icons
  const directionOptions = [
    {
      value: 'income',
      label: 'Thu tiền',
      icon: <ArrowUpOutlined />,
      description: 'Ghi nhận các khoản thu tiền vào công ty',
      color: 'success'
    },
    {
      value: 'expense',
      label: 'Chi tiền',
      icon: <ArrowDownOutlined />,
      description: 'Ghi nhận các khoản chi tiền của công ty',
      color: 'error'
    }
  ];

  // Category options for dropdown with icons
  const categoryOptions = [
    {
      value: 'purchase_contract',
      label: 'Hợp đồng Mua hàng',
      type: 'contract',
      icon: <FileTextOutlined />,
      description: 'Giao dịch theo hợp đồng mua hàng đã ký kết'
    },
    {
      value: 'sale_contract',
      label: 'Hợp đồng Bán hàng',
      type: 'contract',
      icon: <FileTextOutlined />,
      description: 'Giao dịch theo hợp đồng bán hàng đã ký kết'
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
    return option ? option.label : 'Giao dịch kế toán';
  };

  const getDirectionTitle = (direction: 'income' | 'expense') => {
    const option = directionOptions.find((opt) => opt.value === direction);
    return option ? option.label : 'Giao dịch';
  };

  const isContractCategory = selectedCategory === 'purchase_contract' || selectedCategory === 'sale_contract';

  const handleDirectionSelect = (direction: 'income' | 'expense') => {
    setSelectedDirection(direction);
    if (direction && selectedCategory) {
      setCurrentStep(2);
    } else if (direction) {
      setCurrentStep(1);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (selectedDirection && category) {
      setCurrentStep(2);
    } else if (category) {
      setCurrentStep(1);
    }
  };

  const handleContractSelect = (contractId: string) => {
    setSelectedContract(contractId);
  };

  return (
    <MainCard content={false}>
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="outlined" startIcon={<ArrowLeftOutlined />} onClick={handleBack}>
                Quay lại
              </Button>
              <Typography variant="h4" fontWeight="600">
                Tạo giao dịch kế toán
              </Typography>
            </Stack>
          </Box>

          {/* Direction Selection */}
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
                      Chọn loại giao dịch
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lựa chọn giao dịch thu tiền hay chi tiền
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {directionOptions.map((option) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={option.value}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: '1px solid',
                          borderColor: selectedDirection === option.value ? `${option.color}.main` : 'divider',
                          bgcolor: selectedDirection === option.value ? `${option.color}.lighter` : 'background.paper',
                          '&:hover': {
                            borderColor: `${option.color}.main`,
                            bgcolor: `${option.color}.lighter`,
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4]
                          }
                        }}
                        onClick={() => handleDirectionSelect(option.value as 'income' | 'expense')}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 48,
                              height: 48,
                              borderRadius: '12px',
                              bgcolor: `${option.color}.main`,
                              color: 'white'
                            }}
                          >
                            {option.icon}
                          </Box>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="600">
                              {option.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.description}
                            </Typography>
                          </Box>
                          {selectedDirection === option.value && (
                            <CheckCircleOutlined
                              style={{ color: option.color === 'success' ? theme.palette.success.main : theme.palette.error.main }}
                            />
                          )}
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {selectedDirection && (
                  <Zoom in={true} timeout={400}>
                    <Alert severity="info" sx={{ mt: 2 }} icon={<CheckCircleOutlined />}>
                      Bạn đã chọn: <strong>{getDirectionTitle(selectedDirection)}</strong>.
                    </Alert>
                  </Zoom>
                )}
              </CardContent>
            </Card>
          </Fade>

          {/* Category Selection */}
          {selectedDirection && (
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
                      2
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        Chọn loại hình giao dịch
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lựa chọn loại hình giao dịch phù hợp
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
                        setCurrentStep(1);
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
                        label="Loại hình giao dịch"
                        placeholder="Tìm kiếm và chọn loại hình giao dịch..."
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
          {selectedCategory && selectedDirection && (
            <Fade in={true} timeout={800}>
              <Stack spacing={3}>
                {/* Transaction Form */}
                {isContractCategory ? (
                  <ContractTransactionForm
                    category={selectedCategory}
                    direction={selectedDirection}
                    onContractSelect={handleContractSelect}
                  />
                ) : (
                  <ServiceTransactionForm category={selectedCategory} direction={selectedDirection} />
                )}
              </Stack>
            </Fade>
          )}
        </Stack>
      </Box>
    </MainCard>
  );
};

// ==============================|| CONTRACT TRANSACTION FORM ||============================== //

interface ContractTransactionFormValues {
  contractId: string;
  referenceNumber: string;
  amount: string;
  description: string;
  paymentStartDate: Date | null;
  paymentEndDate: Date | null;
  transactionCode: string;
  evidenceFiles: CustomFile[] | null;
}

interface ContractTransactionFormProps {
  category: string;
  direction: 'income' | 'expense';
  onContractSelect: (contractId: string) => void;
}

interface ContractType {
  id: string;
  code: string;
  customerName: string;
  contractDate: Date;
  totalValue: number;
  label: string;
}

// Mock contract history data
interface ContractHistory {
  id: string;
  transactionDate: Date;
  type: 'payment' | 'receipt';
  amount: number;
  description: string;
  status: 'completed' | 'pending';
  createdBy: string;
}

const contractValidationSchema = yup.object({
  contractId: yup.string().required('Hợp đồng là bắt buộc'),
  referenceNumber: yup.string().required('Số tham chiếu là bắt buộc'),
  amount: yup.string().required('Số tiền là bắt buộc'),
  description: yup.string().required('Mục đích thanh toán là bắt buộc'),
  paymentStartDate: yup.date().nullable().required('Ngày bắt đầu thanh toán là bắt buộc'),
  paymentEndDate: yup
    .date()
    .nullable()
    .required('Ngày kết thúc thanh toán là bắt buộc')
    .min(yup.ref('paymentStartDate'), 'Ngày kết thúc phải sau ngày bắt đầu'),
  transactionCode: yup.string().required('Mã giao dịch là bắt buộc'),
  evidenceFiles: yup.mixed().required('Vui lòng tải lên minh chứng (hình ảnh chuyển khoản/hóa đơn)')
});

const ContractTransactionForm = ({ category, direction, onContractSelect }: ContractTransactionFormProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const formik = useFormik<ContractTransactionFormValues>({
    initialValues: {
      contractId: '',
      referenceNumber: '',
      amount: '',
      description: '',
      paymentStartDate: new Date(),
      paymentEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      transactionCode: '',
      evidenceFiles: null
    },
    validationSchema: contractValidationSchema,
    onSubmit: (values) => {
      alert('Tạo giao dịch kế toán thành công!');
      navigate('/accounting');
    }
  });

  // Mock data for contracts
  const availableContracts: ContractType[] = [
    {
      id: 'HD-2024-001',
      code: 'HD-2024-001',
      customerName: 'Công ty TNHH ABC',
      contractDate: new Date('2024-01-10'),
      totalValue: 500000000,
      label: 'HD-2024-001 - Công ty TNHH ABC - 10/01/2024'
    },
    {
      id: 'HD-2024-002',
      code: 'HD-2024-002',
      customerName: 'Công ty Cổ phần XYZ',
      contractDate: new Date('2024-01-15'),
      totalValue: 750000000,
      label: 'HD-2024-002 - Công ty Cổ phần XYZ - 15/01/2024'
    },
    {
      id: 'HD-2024-003',
      code: 'HD-2024-003',
      customerName: 'Tập đoàn DEF',
      contractDate: new Date('2024-01-20'),
      totalValue: 1200000000,
      label: 'HD-2024-003 - Tập đoàn DEF - 20/01/2024'
    }
  ];

  // Mock contract history
  const getContractHistory = (contractId: string): ContractHistory[] => {
    if (!contractId) return [];

    return [
      {
        id: '1',
        transactionDate: new Date('2024-01-25'),
        type: 'payment',
        amount: 250000000,
        description: 'Thanh toán tạm ứng 50%',
        status: 'completed',
        createdBy: 'Nguyễn Văn A'
      },
      {
        id: '2',
        transactionDate: new Date('2024-02-15'),
        type: 'payment',
        amount: 125000000,
        description: 'Thanh toán đợt 2 - 25%',
        status: 'pending',
        createdBy: 'Trần Thị B'
      }
    ];
  };

  const contractHistory = getContractHistory(formik.values.contractId);
  const selectedContract = availableContracts.find((c) => c.id === formik.values.contractId);

  // Calculate total paid amount
  const totalPaid = contractHistory.filter((h) => h.status === 'completed').reduce((sum, h) => sum + h.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <Grid container spacing={3}>
      {/* Left Column - Form */}
      <Grid size={{ xs: 12, lg: formik.values.contractId ? 8 : 12 }}>
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
                  Thông tin giao dịch hợp đồng - {direction === 'income' ? 'Thu tiền' : 'Chi tiền'}
                </Typography>
                <Typography variant="body2" color="primary.dark" sx={{ opacity: 0.8 }}>
                  Nhập thông tin chi tiết cho giao dịch theo hợp đồng (đã được duyệt)
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
                        formik.setFieldValue('contractId', newValue ? newValue.id : '');
                        if (newValue) {
                          onContractSelect(newValue.id);
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
                          <Stack spacing={1} width="100%">
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" fontWeight="600">
                                {option.code}
                              </Typography>
                              <Chip label={formatDate(option.contractDate)} size="small" variant="outlined" />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {option.customerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Giá trị hợp đồng: {formatCurrency(option.totalValue)}
                            </Typography>
                          </Stack>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Tìm kiếm và chọn hợp đồng..."
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
                    <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Số tham chiếu *</InputLabel>
                    <TextField
                      id="referenceNumber"
                      name="referenceNumber"
                      placeholder="Nhập số tham chiếu"
                      fullWidth
                      value={formik.values.referenceNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.referenceNumber && Boolean(formik.errors.referenceNumber)}
                      helperText={formik.touched.referenceNumber && formik.errors.referenceNumber}
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
                      placeholder="Nhập số tiền"
                      fullWidth
                      value={formik.values.amount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
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

                {/*<Grid size={{ xs: 12, md: 6 }}>*/}
                {/*  <Stack sx={{ gap: 1.5 }}>*/}
                {/*    <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Từ ngày *</InputLabel>*/}
                {/*    <DatePicker*/}
                {/*      value={formik.values.paymentStartDate}*/}
                {/*      onChange={(newValue) => {*/}
                {/*        formik.setFieldValue('paymentStartDate', newValue);*/}
                {/*      }}*/}
                {/*      enableAccessibleFieldDOMStructure={false}*/}
                {/*      slots={{*/}
                {/*        textField: (params) => (*/}
                {/*          <TextField*/}
                {/*            {...params}*/}
                {/*            fullWidth*/}
                {/*            error={formik.touched.paymentStartDate && Boolean(formik.errors.paymentStartDate)}*/}
                {/*            helperText={formik.touched.paymentStartDate && formik.errors.paymentStartDate}*/}
                {/*          />*/}
                {/*        )*/}
                {/*      }}*/}
                {/*    />*/}
                {/*  </Stack>*/}
                {/*</Grid>*/}

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack sx={{ gap: 1.5 }}>
                    <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Đến ngày *</InputLabel>
                    {/*<DatePicker*/}
                    {/*  value={formik.values.paymentEndDate}*/}
                    {/*  onChange={(newValue) => {*/}
                    {/*    formik.setFieldValue('paymentEndDate', newValue);*/}
                    {/*  }}*/}
                    {/*  minDate={formik.values.paymentStartDate || undefined}*/}
                    {/*  enableAccessibleFieldDOMStructure={false}*/}
                    {/*  slots={{*/}
                    {/*    textField: (params) => (*/}
                    {/*      <TextField*/}
                    {/*        {...params}*/}
                    {/*        fullWidth*/}
                    {/*        error={formik.touched.paymentEndDate && Boolean(formik.errors.paymentEndDate)}*/}
                    {/*        helperText={formik.touched.paymentEndDate && formik.errors.paymentEndDate}*/}
                    {/*      />*/}
                    {/*    )*/}
                    {/*  }}*/}
                    {/*/>*/}
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Stack sx={{ gap: 1.5 }}>
                    <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Mục đích thanh toán *</InputLabel>
                    <TextField
                      id="description"
                      name="description"
                      placeholder="Mô tả chi tiết mục đích thanh toán..."
                      fullWidth
                      multiline
                      rows={3}
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                    />
                  </Stack>
                </Grid>

                {/* Transaction Code Field */}
                <Grid size={{ xs: 12 }}>
                  <Stack sx={{ gap: 1.5 }}>
                    <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Mã giao dịch *</InputLabel>
                    <TextField
                      id="transactionCode"
                      name="transactionCode"
                      placeholder="Nhập mã giao dịch chuyển khoản..."
                      fullWidth
                      value={formik.values.transactionCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.transactionCode && Boolean(formik.errors.transactionCode)}
                      helperText={formik.touched.transactionCode && formik.errors.transactionCode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NumberOutlined style={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Stack>
                </Grid>

                {/* Evidence Upload Field */}
                <Grid size={{ xs: 12 }}>
                  <Stack sx={{ gap: 1.5 }}>
                    <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Minh chứng thanh toán *</InputLabel>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        bgcolor: theme.palette.grey[50]
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <PictureOutlined style={{ color: theme.palette.primary.main }} />
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            Tải lên hình ảnh minh chứng
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Hình ảnh chuyển khoản/hóa đơn (JPG, PNG, PDF)
                          </Typography>
                        </Box>
                      </Stack>
                      <UploadMultiFile
                        setFieldValue={(field, value) => formik.setFieldValue('evidenceFiles', value)}
                        files={formik.values.evidenceFiles}
                        error={formik.touched.evidenceFiles && Boolean(formik.errors.evidenceFiles)}
                        accept={{ 'image/*': [], 'application/pdf': [] }}
                        sx={{ minHeight: 120 }}
                      />
                      {formik.touched.evidenceFiles && formik.errors.evidenceFiles && (
                        <FormHelperText error sx={{ mt: 1 }}>
                          {formik.errors.evidenceFiles as string}
                        </FormHelperText>
                      )}
                    </Paper>
                  </Stack>
                </Grid>

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
                      <Button variant="outlined" size="large" onClick={() => navigate('/accounting')} sx={{ minWidth: 120 }}>
                        Hủy bỏ
                      </Button>
                      <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting} sx={{ minWidth: 120 }}>
                        {formik.isSubmitting ? 'Đang xử lý...' : 'Tạo giao dịch'}
                      </Button>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* Right Column - Contract History */}
      {formik.values.contractId && (
        <Grid size={{ xs: 12, lg: 4 }}>
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
                  background: `linear-gradient(135deg, ${theme.palette.info.lighter} 0%, ${theme.palette.info.light} 100%)`,
                  p: 3,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <HistoryOutlined style={{ color: theme.palette.info.main, fontSize: 24 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="600" color="info.dark">
                      Lịch sử hợp đồng
                    </Typography>
                    <Typography variant="body2" color="info.dark" sx={{ opacity: 0.8 }}>
                      {selectedContract?.code}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 3 }}>
                {/* Contract Summary */}
                {selectedContract && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
                      Thông tin hợp đồng
                    </Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Tổng giá trị:
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {formatCurrency(selectedContract.totalValue)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Đã thanh toán:
                        </Typography>
                        <Typography variant="body2" fontWeight="600" color="success.main">
                          {formatCurrency(totalPaid)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Còn lại:
                        </Typography>
                        <Typography variant="body2" fontWeight="600" color="warning.main">
                          {formatCurrency(selectedContract.totalValue - totalPaid)}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                  </Box>
                )}

                {/* Transaction History */}
                <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
                  Lịch sử giao dịch
                </Typography>

                {contractHistory.length > 0 ? (
                  <Stack spacing={2}>
                    {contractHistory.map((history) => (
                      <Paper
                        key={history.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          borderRadius: 2,
                          bgcolor: history.status === 'completed' ? 'success.lighter' : 'warning.lighter'
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Chip
                              size="small"
                              label={history.status === 'completed' ? 'Hoàn thành' : 'Chờ xử lý'}
                              color={history.status === 'completed' ? 'success' : 'warning'}
                              icon={history.status === 'completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(history.transactionDate)}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" fontWeight="600">
                            {formatCurrency(history.amount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {history.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Tạo bởi: {history.createdBy}
                          </Typography>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">Chưa có giao dịch nào cho hợp đồng này</Alert>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      )}
    </Grid>
  );
};

// ==============================|| SERVICE TRANSACTION FORM ||============================== //

interface ServiceTransactionFormValues {
  serviceType: string;
  providerName: string;
  referenceNumber: string;
  amount: string;
  description: string;
  paymentStartDate: Date | null;
  paymentEndDate: Date | null;
  transactionCode: string;
  evidenceFiles: CustomFile[] | null;
}

interface ServiceTransactionFormProps {
  category: string;
  direction: 'income' | 'expense';
}

const serviceValidationSchema = yup.object({
  serviceType: yup.string().required('Loại dịch vụ là bắt buộc'),
  providerName: yup.string().required('Nhà cung cấp là bắt buộc'),
  referenceNumber: yup.string().required('Số tham chiếu là bắt buộc'),
  amount: yup.string().required('Số tiền là bắt buộc'),
  description: yup.string().required('Lý do thanh toán là bắt buộc'),
  paymentStartDate: yup.date().nullable().required('Ngày bắt đầu thanh toán là bắt buộc'),
  paymentEndDate: yup
    .date()
    .nullable()
    .required('Ngày kết thúc thanh toán là bắt buộc')
    .min(yup.ref('paymentStartDate'), 'Ngày kết thúc phải sau ngày bắt đầu'),
  transactionCode: yup.string().required('Mã giao dịch là bắt buộc'),
  evidenceFiles: yup.mixed().required('Vui lòng tải lên minh chứng (hình ảnh chuyển khoản/hóa đơn)')
});

const ServiceTransactionForm = ({ category, direction }: ServiceTransactionFormProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const formik = useFormik<ServiceTransactionFormValues>({
    initialValues: {
      serviceType: '',
      providerName: '',
      referenceNumber: '',
      amount: '',
      description: '',
      paymentStartDate: new Date(),
      paymentEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      transactionCode: '',
      evidenceFiles: null
    },
    validationSchema: serviceValidationSchema,
    onSubmit: (values) => {
      alert('Tạo giao dịch kế toán thành công!');
      navigate('/accounting');
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
              Thông tin giao dịch dịch vụ - {direction === 'income' ? 'Thu tiền' : 'Chi tiền'}
            </Typography>
            <Typography variant="body2" color="secondary.dark" sx={{ opacity: 0.8 }}>
              Nhập thông tin chi tiết cho giao dịch dịch vụ (đã được duyệt)
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
                    formik.setFieldValue('serviceType', newValue || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn loại dịch vụ..."
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
                    formik.setFieldValue('providerName', newValue || '');
                  }}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn hoặc nhập tên nhà cung cấp dịch vụ..."
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
                <InputLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Số tham chiếu *</InputLabel>
                <TextField
                  id="referenceNumber"
                  name="referenceNumber"
                  placeholder="Nhập số tham chiếu"
                  fullWidth
                  value={formik.values.referenceNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.referenceNumber && Boolean(formik.errors.referenceNumber)}
                  helperText={formik.touched.referenceNumber && formik.errors.referenceNumber}
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
                  placeholder="Nhập số tiền"
                  fullWidth
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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
              {/*      formik.setFieldValue('paymentStartDate', newValue);*/}
              {/*    }}*/}
              {/*    enableAccessibleFieldDOMStructure={false}*/}
              {/*    slots={{*/}
              {/*      textField: (params) => (*/}
              {/*        <TextField*/}
              {/*          {...params}*/}
              {/*          fullWidth*/}
              {/*          error={formik.touched.paymentStartDate && Boolean(formik.errors.paymentStartDate)}*/}
              {/*          helperText={formik.touched.paymentStartDate && formik.errors.paymentStartDate}*/}
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
              {/*      formik.setFieldValue('paymentEndDate', newValue);*/}
              {/*    }}*/}
              {/*    minDate={formik.values.paymentStartDate || undefined}*/}
              {/*    enableAccessibleFieldDOMStructure={false}*/}
              {/*    slots={{*/}
              {/*      textField: (params) => (*/}
              {/*        <TextField*/}
              {/*          {...params}*/}
              {/*          fullWidth*/}
              {/*          error={formik.touched.paymentEndDate && Boolean(formik.errors.paymentEndDate)}*/}
              {/*          helperText={formik.touched.paymentEndDate && formik.errors.paymentEndDate}*/}
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
                  id="description"
                  name="description"
                  placeholder="Mô tả chi tiết lý do thanh toán..."
                  fullWidth
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Stack>
            </Grid>

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
                  <Button variant="outlined" size="large" onClick={() => navigate('/accounting')} sx={{ minWidth: 120 }}>
                    Hủy bỏ
                  </Button>
                  <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting} sx={{ minWidth: 120 }}>
                    {formik.isSubmitting ? 'Đang xử lý...' : 'Tạo giao dịch'}
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountingCreate;
