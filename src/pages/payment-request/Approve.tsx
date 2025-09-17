import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// material-ui
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormHelperText,
  Grid,
  InputLabel,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  BankOutlined,
  PictureOutlined,
  NumberOutlined
} from '@ant-design/icons';

// third-party
import { useFormik } from 'formik';
import * as yup from 'yup';

// project imports
import MainCard from 'components/MainCard';
import UploadMultiFile from 'components/third-party/dropzone/MultiFile';
import { currencyToWords } from 'utils/currency';

// types
import { CustomFile } from 'types/dropzone';

// ==============================|| TYPES ||============================== //

interface PaymentRequestDetails {
  id: string;
  code: string;
  requestDate: Date;
  requesterName: string;
  requesterDepartment: string;
  category: string;
  serviceProviderName: string;
  serviceType: string;
  contractId?: string;
  paymentPurpose: string;
  amount: number;
  description: string;
  bankAccount: {
    accountNumber: string;
    accountName: string;
    bankName: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface ApprovalHistory {
  id: string;
  action: 'APPROVED' | 'REJECTED' | 'REQUESTED';
  date: Date;
  approver: string;
  approverTitle: string;
  notes: string;
  avatar?: string;
}

interface ApprovalFormValues {
  notes: string;
  transactionCode: string;
  evidenceFiles: CustomFile[] | null;
}

// Validation schema for approval form
const approvalValidationSchema = yup.object({
  notes: yup.string(),
  transactionCode: yup.string(),
  evidenceFiles: yup.mixed(),
  action: yup.string().optional()
});

// ==============================|| PAYMENT REQUEST APPROVE ||============================== //

const PaymentRequestApprove = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  const [isProcessingApproval, setIsProcessingApproval] = useState<boolean>(false);
  const [approvalAction, setApprovalAction] = useState<'APPROVED' | 'REJECTED' | null>(null);

  // Formik form for approval
  const formik = useFormik<ApprovalFormValues & { action?: string }>({
    initialValues: {
      notes: '',
      transactionCode: '',
      evidenceFiles: null,
      action: undefined
    },
    validationSchema: approvalValidationSchema,
    onSubmit: async (values) => {
      if (!approvalAction) return;

      setIsProcessingApproval(true);
      try {
        // Mock API call
        console.log('Approval submitted:', {
          action: approvalAction,
          ...values
        });

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const actionText = approvalAction === 'APPROVED' ? 'phê duyệt' : 'từ chối';
        alert(`Đã ${actionText} đề nghị thanh toán thành công!`);

        // Navigate back to list
        navigate('/payment-request');
      } catch (error) {
        console.error('Error processing approval:', error);
        alert('Có lỗi xảy ra khi xử lý phê duyệt');
      } finally {
        setIsProcessingApproval(false);
        setApprovalAction(null);
      }
    }
  });

  // Mock data - in real app would come from API
  const paymentRequest: PaymentRequestDetails = {
    id: id || '1',
    code: 'PR-2024-001',
    requestDate: new Date('2024-01-15'),
    requesterName: 'Nguyễn Văn A',
    requesterDepartment: 'Phòng Kế toán',
    category: 'Hợp đồng Mua hàng',
    serviceProviderName: 'Công ty TNHH ABC Trade',
    serviceType: 'Thanh toán hợp đồng',
    contractId: 'HD-2024-001',
    paymentPurpose: 'Tạm ứng thanh toán theo hợp đồng mua hàng gạo',
    amount: 280000000,
    description: 'Thanh toán tạm ứng 50% giá trị hợp đồng mua hàng gạo theo thỏa thuận',
    bankAccount: {
      accountNumber: '1234567890',
      accountName: 'CÔNG TY TNHH ABC TRADE',
      bankName: 'Ngân hàng Vietcombank - Chi nhánh Hà Nội'
    },
    status: 'PENDING'
  };

  const approvalHistory: ApprovalHistory[] = [
    {
      id: '1',
      action: 'REQUESTED',
      date: new Date('2024-01-15T09:30:00'),
      approver: 'Nguyễn Văn A',
      approverTitle: 'Nhân viên Kế toán',
      notes: 'Tạo đề nghị thanh toán theo hợp đồng HD-2024-001'
    },
    {
      id: '2',
      action: 'REJECTED',
      date: new Date('2024-01-16T14:20:00'),
      approver: 'Trần Thị B',
      approverTitle: 'Trưởng phòng Kế toán',
      notes: 'Cần bổ sung thêm thông tin về hợp đồng và xác nhận từ phòng kinh doanh'
    },
    {
      id: '3',
      action: 'REQUESTED',
      date: new Date('2024-01-17T10:15:00'),
      approver: 'Nguyễn Văn A',
      approverTitle: 'Nhân viên Kế toán',
      notes: 'Đã bổ sung đầy đủ thông tin theo yêu cầu'
    }
  ];

  const handleApprovalClick = (action: 'APPROVED' | 'REJECTED') => {
    // Custom validation based on action
    let isValid = true;
    const errors: any = {};

    if (action === 'REJECTED' && !formik.values.notes.trim()) {
      errors.notes = 'Vui lòng nhập lý do từ chối';
      isValid = false;
    }

    if (action === 'APPROVED') {
      if (!formik.values.transactionCode.trim()) {
        errors.transactionCode = 'Vui lòng nhập mã giao dịch khi phê duyệt';
        isValid = false;
      }
      if (!formik.values.evidenceFiles || formik.values.evidenceFiles.length === 0) {
        errors.evidenceFiles = 'Vui lòng tải lên minh chứng (hình ảnh chuyển khoản/hóa đơn) khi phê duyệt';
        isValid = false;
      }
    }

    if (!isValid) {
      formik.setErrors(errors);
      formik.setTouched({
        notes: true,
        transactionCode: true,
        evidenceFiles: true
      });
      return;
    }

    setApprovalAction(action);
    formik.setFieldValue('action', action);
    formik.handleSubmit();
  };

  const handleBack = () => {
    navigate('/payment-request');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('vi-VN');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'APPROVED':
        return <CheckCircleOutlined style={{ color: theme.palette.success.main }} />;
      case 'REJECTED':
        return <CloseCircleOutlined style={{ color: theme.palette.error.main }} />;
      default:
        return <FileTextOutlined style={{ color: theme.palette.info.main }} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'info';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'APPROVED':
        return 'Đã phê duyệt';
      case 'REJECTED':
        return 'Từ chối';
      case 'REQUESTED':
        return 'Yêu cầu phê duyệt';
      default:
        return action;
    }
  };

  return (
    <MainCard content={false}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Button variant="outlined" startIcon={<ArrowLeftOutlined />} onClick={handleBack} sx={{ minWidth: 120 }}>
            Quay lại
          </Button>
          <Typography variant="h5" fontWeight="600">
            Phê duyệt đề nghị thanh toán #{paymentRequest.code}
          </Typography>
          <Chip
            label={paymentRequest.status === 'PENDING' ? 'Chờ duyệt' : paymentRequest.status}
            color={paymentRequest.status === 'PENDING' ? 'warning' : 'default'}
            variant="filled"
          />
        </Stack>

        <Grid container spacing={3}>
          {/* Left Column - Payment Request Details */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              {/* Basic Information */}
              <Card elevation={2}>
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.lighter} 0%, ${theme.palette.primary.light} 100%)`,
                    p: 3,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 50,
                        height: 50
                      }}
                    >
                      <FileTextOutlined style={{ fontSize: '24px' }} />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="600" color="primary.dark">
                        Thông tin đề nghị thanh toán
                      </Typography>
                      <Typography variant="body2" color="primary.dark" sx={{ opacity: 0.8 }}>
                        Mã đề nghị: {paymentRequest.code}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={1}>
                        <InputLabel sx={{ fontWeight: 600 }}>Người yêu cầu</InputLabel>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <UserOutlined style={{ color: theme.palette.text.secondary }} />
                          <Typography>{paymentRequest.requesterName}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {paymentRequest.requesterDepartment}
                        </Typography>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={1}>
                        <InputLabel sx={{ fontWeight: 600 }}>Ngày tạo</InputLabel>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarOutlined style={{ color: theme.palette.text.secondary }} />
                          <Typography>{formatDate(paymentRequest.requestDate)}</Typography>
                        </Stack>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={1}>
                        <InputLabel sx={{ fontWeight: 600 }}>Loại thanh toán</InputLabel>
                        <Typography>{paymentRequest.category}</Typography>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={1}>
                        <InputLabel sx={{ fontWeight: 600 }}>Nhà cung cấp</InputLabel>
                        <Typography>{paymentRequest.serviceProviderName}</Typography>
                      </Stack>
                    </Grid>

                    {paymentRequest.contractId && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack spacing={1}>
                          <InputLabel sx={{ fontWeight: 600 }}>Mã hợp đồng</InputLabel>
                          <Typography>{paymentRequest.contractId}</Typography>
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card elevation={2}>
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.success.lighter} 0%, ${theme.palette.success.light} 100%)`,
                    p: 3,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.success.main,
                        width: 50,
                        height: 50
                      }}
                    >
                      <DollarOutlined style={{ fontSize: '24px' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="600" color="success.dark">
                        Chi tiết thanh toán
                      </Typography>
                      <Typography variant="body2" color="success.dark" sx={{ opacity: 0.8 }}>
                        Thông tin số tiền và mục đích thanh toán
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Box>
                      <InputLabel sx={{ fontWeight: 600, mb: 1 }}>Mục đích thanh toán</InputLabel>
                      <Typography>{paymentRequest.paymentPurpose}</Typography>
                    </Box>

                    <Box>
                      <InputLabel sx={{ fontWeight: 600, mb: 1 }}>Số tiền</InputLabel>
                      <Typography variant="h5" color="success.main" fontWeight="600">
                        {formatCurrency(paymentRequest.amount)}
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mt: 1,
                          bgcolor: theme.palette.success.lighter,
                          border: `1px solid ${theme.palette.success.light}`,
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="body2" color="success.dark" fontWeight="600">
                          Số tiền bằng chữ: {currencyToWords(paymentRequest.amount)}
                        </Typography>
                      </Paper>
                    </Box>

                    <Box>
                      <InputLabel sx={{ fontWeight: 600, mb: 1 }}>Mô tả chi tiết</InputLabel>
                      <Typography>{paymentRequest.description}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Bank Information */}
              <Card elevation={2}>
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.info.lighter} 0%, ${theme.palette.info.light} 100%)`,
                    p: 3,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.info.main,
                        width: 50,
                        height: 50
                      }}
                    >
                      <BankOutlined style={{ fontSize: '24px' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="600" color="info.dark">
                        Thông tin ngân hàng
                      </Typography>
                      <Typography variant="body2" color="info.dark" sx={{ opacity: 0.8 }}>
                        Tài khoản nhận tiền
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={1}>
                        <InputLabel sx={{ fontWeight: 600 }}>Số tài khoản</InputLabel>
                        <Typography>{paymentRequest.bankAccount.accountNumber}</Typography>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={1}>
                        <InputLabel sx={{ fontWeight: 600 }}>Tên tài khoản</InputLabel>
                        <Typography>{paymentRequest.bankAccount.accountName}</Typography>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Stack spacing={1}>
                        <InputLabel sx={{ fontWeight: 600 }}>Ngân hàng</InputLabel>
                        <Typography>{paymentRequest.bankAccount.bankName}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Approval Actions */}
              <Card elevation={2}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                    Thao tác phê duyệt
                  </Typography>

                  <form onSubmit={formik.handleSubmit}>
                    <Stack spacing={3}>
                      <Box>
                        <InputLabel sx={{ fontWeight: 600, mb: 1 }}>Ghi chú phê duyệt</InputLabel>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          placeholder="Nhập ghi chú cho quyết định phê duyệt..."
                          name="notes"
                          value={formik.values.notes}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.notes && Boolean(formik.errors.notes)}
                          helperText={formik.touched.notes && formik.errors.notes}
                        />
                      </Box>

                      {/* Transaction Code Field */}
                      <Box>
                        <InputLabel sx={{ fontWeight: 600, mb: 1 }}>
                          Mã giao dịch *
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (Bắt buộc khi phê duyệt)
                          </Typography>
                        </InputLabel>
                        <TextField
                          fullWidth
                          placeholder="Nhập mã giao dịch chuyển khoản..."
                          name="transactionCode"
                          value={formik.values.transactionCode}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.transactionCode && Boolean(formik.errors.transactionCode)}
                          helperText={formik.touched.transactionCode && formik.errors.transactionCode}
                          InputProps={{
                            startAdornment: <NumberOutlined style={{ color: theme.palette.text.secondary, marginRight: 8 }} />
                          }}
                        />
                      </Box>

                      {/* Evidence Upload */}
                      <Box>
                        <InputLabel sx={{ fontWeight: 600, mb: 1 }}>
                          Minh chứng thanh toán *
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (Hình ảnh chuyển khoản/hóa đơn - Bắt buộc khi phê duyệt)
                          </Typography>
                        </InputLabel>
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
                            <Typography variant="body2" fontWeight="600">
                              Tải lên hình ảnh minh chứng
                            </Typography>
                          </Stack>
                          <UploadMultiFile
                            setFieldValue={(field, value) => formik.setFieldValue('evidenceFiles', value)}
                            files={formik.values.evidenceFiles}
                            error={formik.touched.evidenceFiles && Boolean(formik.errors.evidenceFiles)}
                            accept={{ 'image/*': [] }}
                            sx={{ minHeight: 120 }}
                          />
                          {formik.touched.evidenceFiles && formik.errors.evidenceFiles && (
                            <FormHelperText error sx={{ mt: 1 }}>
                              {formik.errors.evidenceFiles as string}
                            </FormHelperText>
                          )}
                        </Paper>
                      </Box>

                      <Divider />

                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          color="error"
                          size="large"
                          disabled={isProcessingApproval}
                          onClick={() => handleApprovalClick('REJECTED')}
                          startIcon={<CloseCircleOutlined />}
                          sx={{ minWidth: 140 }}
                        >
                          Từ chối
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          size="large"
                          disabled={isProcessingApproval}
                          onClick={() => handleApprovalClick('APPROVED')}
                          startIcon={<CheckCircleOutlined />}
                          sx={{ minWidth: 140 }}
                        >
                          {isProcessingApproval ? 'Đang xử lý...' : 'Phê duyệt'}
                        </Button>
                      </Stack>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column - Approval History */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card elevation={2} sx={{ height: 'fit-content', position: 'sticky', top: 24 }}>
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.warning.lighter} 0%, ${theme.palette.warning.light} 100%)`,
                  p: 3,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.warning.main,
                      width: 40,
                      height: 40
                    }}
                  >
                    <HistoryOutlined />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600" color="warning.dark">
                      Lịch sử phê duyệt
                    </Typography>
                    <Typography variant="body2" color="warning.dark" sx={{ opacity: 0.8 }}>
                      {approvalHistory.length} hoạt động
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 0 }}>
                <Stack divider={<Divider />}>
                  {approvalHistory.map((item, index) => (
                    <Box key={item.id} sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: `${getActionColor(item.action)}.light`,
                              color: `${getActionColor(item.action)}.dark`
                            }}
                          >
                            {getActionIcon(item.action)}
                          </Avatar>
                          <Box flex={1}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                              <Typography variant="body2" fontWeight="600">
                                {item.approver}
                              </Typography>
                              <Chip
                                label={getActionText(item.action)}
                                size="small"
                                color={getActionColor(item.action) as any}
                                variant="outlined"
                              />
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {item.approverTitle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatDate(item.date)}
                            </Typography>
                          </Box>
                        </Stack>

                        {item.notes && (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: theme.palette.grey[50],
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 1,
                              ml: 6
                            }}
                          >
                            <Typography variant="body2">{item.notes}</Typography>
                          </Paper>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
};

export default PaymentRequestApprove;
