// material-ui
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { formatCurrencyVND } from 'utils/currency';

// Define interfaces for form data from previous steps
interface FactoryType {
  factoryName: string;
  quantity: string;
  price: string;
  loadingTimeFrom: Date | null;
  loadingTimeTo: Date | null;
  unit: string;
}

interface ProductType {
  goodsName: string;
  factories: FactoryType[];
}

interface ContractFormValues {
  contractNumber: string;
  taxCode: string;
  sellerName: string;
  sellerAddress: string;
  sellerRepresentative: string;
  sellerPhone: string;
  buyerName: string;
  buyerTaxCode: string;
  buyerAddress: string;
  buyerRepresentative: string;
  buyerPhone: string;
  contractDate: Date | null;
  goodsType: string;
  goodsDescription: string;
  paymentTerms: string;
  deliveryTerms: string;
  contractDetails: string;
  allowableError: string;
  powerPlantName: string;
  containerVolume: string;
  deliveryPort: string;
  receiptPort: string;
  currency: string;
  price: string;
  unit: string;
  totalVolume: string;
  saveContract: boolean;
  // Bank information
  sellerBeneficiary: string;
  sellerBankName: string;
  sellerBankAddress: string;
  sellerBankAccount: string;
  sellerSwiftCode: string;
  buyerBeneficiary: string;
  buyerBankName: string;
  buyerBankAddress: string;
  buyerBankAccount: string;
  buyerSwiftCode: string;
  // LC information
  lcNumber: string;
  lcDate: Date | null;
}

interface LogisticFormValues {
  bookingNumber: string;
  bookingCode: string;
  containerQuantity: string;
  etaDate: Date | null;
  etdDate: Date | null;
  shipName: string;
  forwarderName: string;
  shippingLineName: string;
  yardDate: Date | null;
  cutoffDate: Date | null;
  region: string;
  portName: string;
  cargoType: string;
  shippingNote: string;
  selectedBookingCode: string;
  products: ProductType[];
  totalQuantity: string;
  totalPrice: string;
  averagePrice: string;
}

interface FactoryPaymentType {
  factoryName: string;
  quantity: string;
  price: string;
  amount: string;
}

interface PaymentFormValues {
  contractNumber: string;
  bookingNumber: string;
  advanceDate: Date | null;
  paymentPurpose: string;
  factoryPayments: FactoryPaymentType[];
  totalQuantity: string;
  totalAmount: string;
  notes: string;
}

// Props interface
interface ReviewProps {
  contractData?: ContractFormValues;
  logisticData?: LogisticFormValues;
  paymentData?: PaymentFormValues;
}

// ==============================|| REVIEW COMPONENT ||============================== //

const Review = ({ contractData, logisticData, paymentData }: ReviewProps) => {
  const theme = useTheme();

  // Check if all units are consistent
  const checkUnitConsistency = () => {
    if (!logisticData?.products) return true;
    const firstUnit = logisticData.products[0]?.factories[0]?.unit;
    return logisticData.products.every((product) => product.factories.every((factory) => factory.unit === firstUnit));
  };

  // Calculate remaining quantity
  const calculateRemainingQuantity = () => {
    if (!contractData?.totalVolume || !logisticData?.totalQuantity) return 'N/A';
    const total = Number(contractData.totalVolume);
    const used = Number(logisticData.totalQuantity);
    return (total - used).toString();
  };

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Xác nhận hợp đồng
      </Typography>

      {/* Key Information Review */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: theme.palette.background.default }}>
        <Typography variant="h6" gutterBottom color="primary">
          Thông tin cần xác nhận
        </Typography>

        <Grid container spacing={2}>
          {/* Contract Basic Info */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2">Số hợp đồng:</Typography>
            <Typography variant="body2" color="text.secondary">
              {contractData?.contractNumber || 'N/A'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2">Loại hàng hóa:</Typography>
            <Typography variant="body2" color="text.secondary">
              {contractData?.goodsType || 'N/A'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2">Đơn vị:</Typography>
            <Typography
              variant="body2"
              sx={{
                color: checkUnitConsistency() ? 'success.main' : 'error.main',
                fontWeight: 'bold'
              }}
            >
              {contractData?.unit || 'N/A'}
              {!checkUnitConsistency() && ' (Không đồng nhất)'}
            </Typography>
          </Grid>

          {/* Quantity Information */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2">Tổng khối lượng hợp đồng:</Typography>
            <Typography variant="body2" color="text.secondary">
              {contractData?.totalVolume || 'N/A'} {contractData?.unit}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2">Khối lượng đã sử dụng:</Typography>
            <Typography variant="body2" color="text.secondary">
              {logisticData?.totalQuantity || '0'} {contractData?.unit}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2">Khối lượng còn lại:</Typography>
            <Typography
              variant="body2"
              sx={{
                color: Number(calculateRemainingQuantity()) >= 0 ? 'success.main' : 'error.main',
                fontWeight: 'bold'
              }}
            >
              {calculateRemainingQuantity()} {contractData?.unit}
            </Typography>
          </Grid>

          {/* Price Information */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2">Đơn giá hợp đồng:</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrencyVND(Number(contractData?.price || '0'))}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2">Đơn giá trung bình thực tế:</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrencyVND(Number(logisticData?.averagePrice || '0'))}
            </Typography>
          </Grid>
        </Grid>

        {/* Warning Messages */}
        {!checkUnitConsistency() && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            ⚠️ Cảnh báo: Đơn vị không đồng nhất giữa các xưởng
          </Typography>
        )}
        {Number(calculateRemainingQuantity()) < 0 && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            ⚠️ Cảnh báo: Khối lượng đã sử dụng vượt quá khối lượng hợp đồng
          </Typography>
        )}
      </Paper>

      {/* Loading Plan Summary */}
      {logisticData?.products && logisticData.products.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tóm tắt kế hoạch đóng hàng
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Hàng hóa</TableCell>
                  <TableCell align="right">Số lượng</TableCell>
                  <TableCell align="right">Đơn giá trung bình</TableCell>
                  <TableCell align="right">Thành tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logisticData.products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.goodsName}</TableCell>
                    <TableCell align="right">{product.factories.reduce((sum, f) => sum + Number(f.quantity), 0)}</TableCell>
                    <TableCell align="right">{formatCurrencyVND(Number(product.factories[0]?.price || '0'))}</TableCell>
                    <TableCell align="right">
                      {formatCurrencyVND(product.factories.reduce((sum, f) => sum + Number(f.quantity) * Number(f.price), 0))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Submission notice */}
      <Paper sx={{ p: 2, bgcolor: theme.palette.warning.light, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ color: theme.palette.warning.dark }}>
          Vui lòng kiểm tra kỹ thông tin trước khi gửi. Nhấn nút "Hoàn thành" để xác nhận và lưu hợp đồng.
        </Typography>
      </Paper>
    </>
  );
};

export default Review;
