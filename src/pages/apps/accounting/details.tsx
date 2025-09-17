// Trả về nhãn trạng thái giao dịch
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    confirmed: 'Đã xác nhận',
    draft: 'Nháp',
    cancelled: 'Đã hủy',
    paid: 'Đã thanh toán',
    '5': 'Đã thanh toán'
  };
  return labels[status] || status;
};
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import Tooltip from '@mui/material/Tooltip';
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
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';
import numberHelper from 'utils/numberHelper';

// types
import { AccountingTransaction } from 'types/accounting';

// assets
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';

import { getAccountingTransactions } from 'api/accounting';
import { updateAccountingTransaction } from 'api/accounting';

// Utility functions
const formatCurrency = (amount: number, currency?: string) => {
  return numberHelper.formatCurrency(amount, {
    currency: currency || 'VND'
  });
};

const formatDate = (dateString: string) => {
  if (!dateString) return '--';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '--';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};


const getTransactionTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    SALE: 'Bán hàng',
    PURCHASE: 'Mua hàng',
    payment: 'Thanh toán',
    receipt: 'Thu tiền',
    expense: 'Chi phí',
    OTHER: 'Dịch vụ'
  };
  return labels[type] || type;
};
const getServiceLabel = (category: string) => {
  const labels: Record<string, string> = {
    SALE: 'Hợp đồng bán',
    PURCHASE: 'Hợp đồng mua',
    CUSTOMS: 'Dịch vụ hải quan',
    INSURANCE: 'Dịch vụ bảo hiểm',
    INSPECTION: 'Dịch vụ kiểm định',
    WAREHOUSE: 'Dịch vụ kho bãi',
    TRANSPORTATION: 'Dịch vụ vận chuyển',
    LOGISTICS: 'Dịch vụ logistics'
  };
  return labels[category.toUpperCase()] || category;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'draft':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getTypeColor = (type: string) => {
  switch (type.toUpperCase()) {
    case 'SALE':
      return 'success';   // xanh lá
    case 'PURCHASE':
      return 'info';      // xanh dương
    case 'OTHER':
      return 'warning';   // cam
    default:
      return 'default';
  }
};


// ==============================|| ACCOUNTING DETAILS ||============================== //

export default function AccountingDetails() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<AccountingTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState<AccountingTransaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

    // Add local loading state for direction update
    const [directionLoading, setDirectionLoading] = useState<'income' | 'expense' | null>(null);

  // Đã import updateAccountingTransaction ở đầu file

    // Handler to update transaction direction
    const handleDirectionChange = async (direction: 'income' | 'expense') => {
      if (!transaction) {
        console.error('Không có transaction để cập nhật!');
        return;
      }
      setDirectionLoading(direction);
      try {
        // Prepare update payload
        const updatePayload = {
          ...transaction,
          transactionDirection: direction,
          accountingStatus: direction === 'income' ? 'paid_in' : 'paid_out',
        };
        console.log('Gửi updateAccountingTransaction:', transaction.id, updatePayload);
        // Call API
        await updateAccountingTransaction(transaction.id, updatePayload);
        // Chuyển về trang danh sách sau khi cập nhật
        navigate('/accounting');
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái dòng tiền:', error);
      }
      setDirectionLoading(null);
    };

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        if (id) {
          const all = await getAccountingTransactions();
          console.log('Danh sách giao dịch lấy về:', all);
          // id có thể là string hoặc number, nên so sánh lỏng
          const found = all.find((item) => String(item.id) === String(id));
          console.log('Giao dịch tìm thấy:', found);
          setTransaction(found || null);
          setEditValues(found || null);
        } else {
          setTransaction(null);
          setEditValues(null);
        }
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết giao dịch:', error);
        setTransaction(null);
        setEditValues(null);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <MainCard>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Đang tải...</Typography>
        </Box>
      </MainCard>
    );
  }
                {/* Trạng thái giao dịch */}
                {/* Đoạn này đã nằm trong hàm component phía dưới, không cần lặp lại ngoài hàm */}

  if (!transaction) {
    return (
      <MainCard>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6">
            Không tìm thấy giao dịch với ID: {id}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
            Có thể giao dịch không tồn tại hoặc đã bị xóa.
          </Typography>
          <Button variant="contained" startIcon={<ArrowLeftOutlined />} onClick={() => navigate('/accounting')}>
            Quay lại danh sách
          </Button>
        </Box>
      </MainCard>
    );
  }

const breadcrumbLinks = [
  { title: 'Trang chủ', to: '/' },
  { title: '7. Kế toán', to: '/accounting' },
  { title: 'Danh sách', to: '/accounting' },
  { title: 'Chi tiết giao dịch' }
];

  // Sửa tiêu đề: ưu tiên requestPaymentCode, nếu không có thì dùng id
  const transactionTitle = transaction
  ? (transaction.requestPaymentCode || transaction.id)
  : '...';

   return (
  <>
    <Breadcrumbs
      custom
      heading={`Chi tiết giao dịch ${transactionTitle}`}
      links={breadcrumbLinks}
    />

    <Grid
      container
      spacing={3}
      alignItems="flex-start"
      sx={{ flexWrap: 'nowrap' }}
    >
      {/* Main Information Card - bên trái */}
      <Grid size={{ xs: 8 }}>
        <MainCard>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h5" fontWeight={700}>
                  Thông tin giao dịch
                </Typography>
                {transaction?.transactionDirection ? (
                  <Chip
                    label={
                      transaction.transactionDirection?.toLowerCase() === 'income'
                        ? 'Thu tiền'
                        : transaction.transactionDirection?.toLowerCase() === 'expense'
                        ? 'Chi tiền'
                        : transaction.transactionDirection || '--'
                    }
                    color={
                      transaction.transactionDirection?.toLowerCase() === 'income'
                        ? 'info'
                        : transaction.transactionDirection?.toLowerCase() === 'expense'
                        ? 'warning'
                        : 'default'
                    }
                    variant="filled"
                    sx={{
                      minWidth: 120,
                      fontWeight: 600,
                      fontSize: 16,
                      height: 36,
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ minWidth: 120, fontWeight: 600 }}
                      disabled={directionLoading === 'income'}
                      onClick={() => handleDirectionChange('income')}
                    >
                      {directionLoading === 'income' ? 'Đang xử lý...' : 'Thu tiền'}
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      sx={{ minWidth: 120, fontWeight: 600 }}
                      disabled={directionLoading === 'expense'}
                      onClick={() => handleDirectionChange('expense')}
                    >
                      {directionLoading === 'expense' ? 'Đang xử lý...' : 'Chi tiền'}
                    </Button>
                  </Stack>
                )}
              </Stack>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              {/* Các field dạng 2 cột */}
              {transaction?.requestPaymentCode && (
                <Grid size={{ xs: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="textSecondary" fontWeight={500} fontSize={14}>
                      Mã đề nghị thanh toán
                    </Typography>
                    <Tooltip title={transaction.requestPaymentCode}>
                      <Typography
                        variant="body1"
                        fontSize={18}
                        fontWeight={600}
                        noWrap
                        sx={{
                          maxWidth: 250,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer'
                        }}
                      >
                        {transaction.requestPaymentCode}
                      </Typography>
                    </Tooltip>
                  </Stack>
                </Grid>
              )}

              {transaction?.transactionDate && (
                <Grid size={{ xs: 6}}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="textSecondary" fontWeight={500} fontSize={14}>
                      Ngày giao dịch
                    </Typography>
                    <Typography variant="body1" fontSize={18} fontWeight={600}>
                      {formatDate(transaction.transactionDate)}
                    </Typography>
                  </Stack>
                </Grid>
              )}

              {transaction?.transactionType && (
                <Grid size={{ xs: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="textSecondary" fontWeight={500} fontSize={14}>
                      Loại đề nghị
                    </Typography>
                    <Chip
                      label={getTransactionTypeLabel(transaction.transactionType)}
                      color={getTypeColor(transaction.transactionType)}
                      variant="light"
                      size="small"
                      sx={{
                        fontSize: 16,
                        fontWeight: 600,
                        height: 32,
                        borderRadius: '6px'
                      }}
                    />
                  </Stack>
                </Grid>
              )}

              {transaction?.category && (
                <Grid size={{ xs: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="textSecondary" fontWeight={500}>
                      Loại dịch vụ
                    </Typography>
                    <Typography variant="body1" fontSize={18} fontWeight={600}>
                      {transaction.category}
                    </Typography>
                  </Stack>
                </Grid>
              )}

              <Grid size={{ xs: 6 }}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="textSecondary" fontWeight={500} fontSize={14}>
                    Số tiền
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight={700} fontSize={22}>
                    {transaction.amount ? formatCurrency(transaction.amount, transaction.currency) : '--'}
                  </Typography>
                </Stack>
              </Grid>

              {transaction?.currency && (
                <Grid size={{ xs: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="textSecondary" fontWeight={500} fontSize={14}>
                      Tiền tệ
                    </Typography>
                    <Typography variant="body1" fontSize={18} fontWeight={600}>
                      {transaction.currency}
                    </Typography>
                  </Stack>
                </Grid>
              )}

              {transaction?.reason && (
  <Grid size={{ xs: 12 }}>
    <Stack spacing={1}>
      <Typography variant="body2" color="textSecondary" fontWeight={500} fontSize={14}>
        Lý do thanh toán
      </Typography>
      <Typography
        variant="body1"
        fontSize={18}
        fontWeight={600}
        sx={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      >
        {transaction.reason}
      </Typography>
    </Stack>
  </Grid>
)}

              {transaction?.note && (
  <Grid size={{ xs: 12 }}>
    <Stack spacing={1}>
      <Typography variant="body2" color="textSecondary" fontWeight={500} fontSize={14}>
        Ghi chú
      </Typography>
      <Typography
        variant="body1"
        fontSize={18}
        fontWeight={600}
        sx={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      >
        {transaction.note}
      </Typography>
    </Stack>
  </Grid>
)}
            </Grid>
          </CardContent>
        </MainCard>
      </Grid>

      {/* Status and System Info - bên phải */}
      <Grid size={{ xs: 4 }}>
        <Stack spacing={3}>
          {/* Status Card */}
          <Card>
            <CardHeader title={<Typography variant="h6" fontWeight={700}>Trạng thái</Typography>} />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="flex-start" alignItems="center">
                  <Chip
                    label={getStatusLabel(transaction.accountingStatus || 'draft')}
                    color={
                      getStatusLabel(transaction.accountingStatus || 'draft') === 'Đã thanh toán'
                        ? 'success'
                        : getStatusColor(transaction.accountingStatus || 'draft')
                    }
                    variant="light"
                    size="small"
                    sx={{
                      fontSize: 16,
                      fontWeight: 600,
                      height: 32,
                      borderRadius: '6px'
                    }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* System Info Card */}
          <Card>
            <CardHeader title={<Typography variant="h6" fontWeight={700}>Thông tin hệ thống</Typography>} />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Stack>
                  <Typography variant="body2" color="textSecondary" fontWeight={500}>
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1" fontSize={16} fontWeight={600}>
                    {transaction.createdAt ? formatDate(transaction.createdAt) : '--'}
                  </Typography>
                </Stack>
                <Stack>
                  <Typography variant="body2" color="textSecondary" fontWeight={500}>
                    Ngày cập nhật cuối
                  </Typography>
                  <Typography variant="body1" fontSize={16} fontWeight={600}>
                    {transaction.lastUpdatedAt ? formatDate(transaction.lastUpdatedAt) : '--'}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/accounting')}
                  fullWidth
                  sx={{ fontWeight: 600, fontSize: 16 }}
                >
                  Quay lại danh sách
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  </>
);
}
