import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// third-party
import { Formik, Form, FormikProps } from 'formik';
import * as Yup from 'yup';

// project imports
import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';
import { formatCurrencyVND } from 'utils/currency';
import { openSnackbar } from 'api/snackbar';

// types
import { SnackbarProps } from 'types/snackbar';

// assets
import SaveOutlined from '@ant-design/icons/SaveOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import ArrowUpOutlined from '@ant-design/icons/ArrowUpOutlined';
import ArrowDownOutlined from '@ant-design/icons/ArrowDownOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';

// Cash flow transaction interface
interface CashFlowTransaction {
  id?: string;
  transactionDate: string;
  type: 'cash-in' | 'cash-out';
  category: string;
  amount: number;
  description: string;
  reference: string;
  paymentMethod: string;
  createdBy?: string;
  createdAt?: string;
}

// Mock cash flow data
const mockCashFlowTransactions: CashFlowTransaction[] = [
  {
    id: 'CF-001',
    transactionDate: '2024-01-25',
    type: 'cash-in',
    category: 'Thanh toán từ khách hàng',
    amount: 280000000,
    description: 'Thu tiền bán viên nén gỗ xuất khẩu sang Nhật Bản',
    reference: 'WP-2024-001',
    paymentMethod: 'Chuyển khoản',
    createdBy: 'Nguyễn Văn Phúc',
    createdAt: '2024-01-25T09:00:00Z'
  },
  {
    id: 'CF-002',
    transactionDate: '2024-01-25',
    type: 'cash-out',
    category: 'Thanh toán cho nhà cung cấp',
    amount: 120000000,
    description: 'Thanh toán mua gỗ eucalyptus từ HTX Lâm nghiệp',
    reference: 'RM-2024-001',
    paymentMethod: 'Chuyển khoản',
    createdBy: 'Phạm Văn Đức',
    createdAt: '2024-01-25T10:30:00Z'
  },
  {
    id: 'CF-003',
    transactionDate: '2024-01-26',
    type: 'cash-in',
    category: 'Thu tiền bán hàng',
    amount: 95000000,
    description: 'Thu tiền bán dăm gỗ cho nhà máy giấy',
    reference: 'WC-2024-001',
    paymentMethod: 'Chuyển khoản',
    createdBy: 'Trần Thị Mai',
    createdAt: '2024-01-26T14:20:00Z'
  },
  {
    id: 'CF-004',
    transactionDate: '2024-01-27',
    type: 'cash-out',
    category: 'Chi phí vận hành',
    amount: 45000000,
    description: 'Chi phí điện năng cho máy nghiền và ép viên',
    reference: 'EL-2024-001',
    paymentMethod: 'Chuyển khoản',
    createdBy: 'Nguyễn Văn Điện',
    createdAt: '2024-01-27T11:15:00Z'
  },
  {
    id: 'CF-005',
    transactionDate: '2024-01-28',
    type: 'cash-in',
    category: 'Thu tiền bán hàng',
    amount: 45000000,
    description: 'Thu tiền bán mùn cưa cho trang trại nấm',
    reference: 'SD-2024-001',
    paymentMethod: 'Tiền mặt',
    createdBy: 'Lê Hoài Nam',
    createdAt: '2024-01-28T16:45:00Z'
  }
];

// Validation schema
const validationSchema = Yup.object({
  transactionDate: Yup.date().required('Vui lòng chọn ngày giao dịch'),
  type: Yup.string().required('Vui lòng chọn loại giao dịch'),
  category: Yup.string().required('Vui lòng chọn danh mục'),
  amount: Yup.number().min(1, 'Số tiền phải lớn hơn 0').required('Vui lòng nhập số tiền'),
  description: Yup.string().required('Vui lòng nhập mô tả'),
  reference: Yup.string().required('Vui lòng nhập số tham chiếu'),
  paymentMethod: Yup.string().required('Vui lòng chọn phương thức thanh toán')
});

const cashInCategories = ['Thanh toán từ khách hàng', 'Thu tiền bán hàng', 'Thu lãi ngân hàng', 'Thu từ đầu tư', 'Thu khác'];

const cashOutCategories = [
  'Thanh toán cho nhà cung cấp',
  'Chi phí vận hành',
  'Chi phí nhân sự',
  'Chi phí vận chuyển',
  'Thuế và phí',
  'Chi phí khác'
];

const paymentMethods = ['Chuyển khoản ngân hàng', 'LC'];

// ==============================|| CASH FLOW MANAGEMENT ||============================== //

export default function CashFlowManagement() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<CashFlowTransaction[]>(mockCashFlowTransactions);

  const initialValues: CashFlowTransaction = {
    transactionDate: new Date().toISOString().split('T')[0],
    type: 'cash-in',
    category: '',
    amount: 0,
    description: '',
    reference: '',
    paymentMethod: 'Chuyển khoản ngân hàng'
  };

  const handleSubmit = (values: CashFlowTransaction, { resetForm }: any) => {
    const newTransaction: CashFlowTransaction = {
      ...values,
      id: `CF-${String(Date.now()).slice(-3)}`,
      createdBy: 'Current User',
      createdAt: new Date().toISOString()
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    openSnackbar({
      open: true,
      message: `Giao dịch ${values.type === 'cash-in' ? 'thu tiền' : 'chi tiền'} đã được thêm thành công`,
      variant: 'alert',
      alert: {
        color: 'success'
      }
    } as SnackbarProps);

    resetForm();
  };

  // Calculate totals
  const totalCashIn = transactions.filter((t) => t.type === 'cash-in').reduce((sum, t) => sum + t.amount, 0);

  const totalCashOut = transactions.filter((t) => t.type === 'cash-out').reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalCashIn - totalCashOut;

  return (
    <>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack>
                  <Typography variant="h6" color="success.main">
                    {formatCurrencyVND(totalCashIn)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tổng thu tiền
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'success.lighter',
                    color: 'success.main'
                  }}
                >
                  <ArrowUpOutlined style={{ fontSize: '24px' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack>
                  <Typography variant="h6" color="error.main">
                    {formatCurrencyVND(totalCashOut)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tổng chi tiền
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'error.lighter',
                    color: 'error.main'
                  }}
                >
                  <ArrowDownOutlined style={{ fontSize: '24px' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack>
                  <Typography variant="h6" color={netCashFlow >= 0 ? 'success.main' : 'error.main'}>
                    {formatCurrencyVND(netCashFlow)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Dòng tiền ròng
                  </Typography>
                </Stack>
                <Chip
                  label={netCashFlow >= 0 ? 'Dương' : 'Âm'}
                  color={netCashFlow >= 0 ? 'success' : 'error'}
                  variant="light"
                  size="small"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Add Transaction Form */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard title="Thêm giao dịch mới">
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
              {({ values, errors, touched, handleChange, handleBlur, setFieldValue }: FormikProps<CashFlowTransaction>) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Ngày giao dịch"
                        type="date"
                        name="transactionDate"
                        value={values.transactionDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.transactionDate && errors.transactionDate)}
                        helperText={touched.transactionDate && errors.transactionDate}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarOutlined />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="Loại giao dịch"
                        name="type"
                        value={values.type}
                        onChange={(e) => {
                          handleChange(e);
                          setFieldValue('category', ''); // Reset category when type changes
                        }}
                        onBlur={handleBlur}
                        error={Boolean(touched.type && errors.type)}
                        helperText={touched.type && errors.type}
                      >
                        <MenuItem value="cash-in">
                          <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
                            <ArrowUpOutlined style={{ color: theme.palette.success.main }} />
                            Thu tiền (Cash In)
                          </Stack>
                        </MenuItem>
                        <MenuItem value="cash-out">
                          <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
                            <ArrowDownOutlined style={{ color: theme.palette.error.main }} />
                            Chi tiền (Cash Out)
                          </Stack>
                        </MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        select
                        label="Danh mục"
                        name="category"
                        value={values.category}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.category && errors.category)}
                        helperText={touched.category && errors.category}
                      >
                        {(values.type === 'cash-in' ? cashInCategories : cashOutCategories).map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Số tiền"
                        type="number"
                        name="amount"
                        value={values.amount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.amount && errors.amount)}
                        helperText={touched.amount && errors.amount}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">VND</InputAdornment>
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="Phương thức thanh toán"
                        name="paymentMethod"
                        value={values.paymentMethod}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.paymentMethod && errors.paymentMethod)}
                        helperText={touched.paymentMethod && errors.paymentMethod}
                      >
                        {paymentMethods.map((method) => (
                          <MenuItem key={method} value={method}>
                            {method}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Số tham chiếu"
                        name="reference"
                        value={values.reference}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.reference && errors.reference)}
                        helperText={touched.reference && errors.reference}
                        placeholder="VD: CT-2024-001, HD-001/2024"
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Mô tả chi tiết"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.description && errors.description)}
                        helperText={touched.description && errors.description}
                        placeholder="Nhập mô tả chi tiết về giao dịch..."
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Stack direction="row" sx={{ gap: 2, justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" startIcon={<SaveOutlined />}>
                          Lưu giao dịch
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </MainCard>
        </Grid>

        {/* Recent Transactions */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard title="Giao dịch gần đây">
            <Stack spacing={2}>
              {transactions.slice(0, 5).map((transaction, index) => (
                <Card key={transaction.id || index} variant="outlined">
                  <CardContent sx={{ pb: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" sx={{ gap: 1, mb: 0.5 }}>
                          {transaction.type === 'cash-in' ? (
                            <ArrowUpOutlined style={{ color: theme.palette.success.main }} />
                          ) : (
                            <ArrowDownOutlined style={{ color: theme.palette.error.main }} />
                          )}
                          <Typography variant="body2" fontWeight={600}>
                            {transaction.category}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {transaction.description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {transaction.reference} • {transaction.paymentMethod}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" color={transaction.type === 'cash-in' ? 'success.main' : 'error.main'} fontWeight={600}>
                        {transaction.type === 'cash-in' ? '+' : '-'}
                        {formatCurrencyVND(transaction.amount)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}

              {transactions.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">Chưa có giao dịch nào</Typography>
                </Box>
              )}
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}
