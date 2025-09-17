import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';

// types
interface CustomerInfo {
  customerName: string;
  deliveryLocation: string;
  importCountry: string;
}

interface ProductInfo {
  productName: string;
  deliveryMethod: string;
  paymentMethod: string;
  currency: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  qualityType: string;
  expectedDelivery: string;
}

interface BookingConfirmation {
  contractNo: string;
  bookingCode: string;
  carPlate: string;
  containerNo: string;
  sealNo: string;
  weight: string;
  adjustedWeight: string;
}

interface BookingOption {
  value: string;
  label: string;
}

interface WeightSlip {
  id: string;
  bookingCode: string;
  contractNo: string;
  carPlate: string;
  containerNo: string;
  sealNo: string;
  weight: string;
  adjustedWeight: string;
  date: string;
  status: 'completed' | 'pending';
}

const deliveryMethods = [
  { value: 'FAS', label: 'FAS' },
  { value: 'FOB', label: 'FOB' },
  { value: 'CIF', label: 'CIF' },
  { value: 'CFR', label: 'CFR' }
];

const paymentMethods = [
  { value: 'LC', label: 'Letter of Credit' },
  { value: 'TT', label: 'Telegraphic Transfer' },
  { value: 'DP', label: 'Documents against Payment' }
];

const currencies = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'VND', label: 'VND' }
];

const units = [
  { value: 'ton', label: 'Tấn' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'piece', label: 'Cái' }
];

const qualityTypes = [
  { value: 'type1', label: 'Loại 1' },
  { value: 'type2', label: 'Loại 2' },
  { value: 'type3', label: 'Loại 3' }
];

// Add table columns definition
const columns = [
  { id: 'bookingCode', label: 'Mã booking', minWidth: 120 },
  { id: 'contractNo', label: 'Số hợp đồng', minWidth: 120 },
  { id: 'carPlate', label: 'Biển số xe', minWidth: 120 },
  { id: 'containerNo', label: 'Số container', minWidth: 150 },
  { id: 'sealNo', label: 'Số chì', minWidth: 100 },
  { id: 'weight', label: 'Khối lượng', minWidth: 120 },
  { id: 'adjustedWeight', label: 'Khối lượng điều chỉnh', minWidth: 150 },
  { id: 'date', label: 'Ngày', minWidth: 120 },
  { id: 'status', label: 'Trạng thái', minWidth: 120 },
  { id: 'actions', label: 'Thao tác', minWidth: 100 }
];

export default function WeightSlipFormDetail() {
  const navigate = useNavigate();
  const [weightSlips, setWeightSlips] = useState<WeightSlip[]>([
    {
      id: 'WS001',
      bookingCode: 'BK001',
      contractNo: 'HD001',
      carPlate: '51F-12345',
      containerNo: 'CMAU1234567',
      sealNo: 'SEAL001',
      weight: '25.5',
      adjustedWeight: '25.5',
      date: '2024-03-15',
      status: 'completed'
    },
    {
      id: 'WS002',
      bookingCode: 'BK002',
      contractNo: 'HD002',
      carPlate: '51F-67890',
      containerNo: 'CMAU7654321',
      sealNo: 'SEAL002',
      weight: '28.3',
      adjustedWeight: '27.8',
      date: '2024-03-16',
      status: 'completed'
    },
    {
      id: 'WS003',
      bookingCode: 'BK003',
      contractNo: 'HD001',
      carPlate: '51F-24680',
      containerNo: 'CMAU9876543',
      sealNo: 'SEAL003',
      weight: '30.0',
      adjustedWeight: '30.0',
      date: '2024-03-17',
      status: 'pending'
    }
  ]);

  const [selectedSlip, setSelectedSlip] = useState<WeightSlip | null>(null);

  const handleAdjustedWeightChange = (slipId: string, value: string) => {
    setWeightSlips((prevSlips) => prevSlips.map((slip) => (slip.id === slipId ? { ...slip, adjustedWeight: value } : slip)));
  };

  const handleSave = () => {
    // Here you would typically make an API call to save the changes
    // console.log('Saving weight slips:', weightSlips);
    // For now, we'll just show a success message
    alert('Đã lưu thành công!');
  };

  return (
    <MainCard title="">
      <Box component="form" noValidate autoComplete="off">
        <Grid container spacing={3}>
          {/* Chốt book của phòng kế toán */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                {/* Weight Slips Table */}
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table stickyHeader aria-label="weight slips table">
                    <TableHead>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell key={column.id} style={{ minWidth: column.minWidth }}>
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {weightSlips.map((slip) => (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={slip.id}
                          onClick={() => setSelectedSlip(slip)}
                          sx={{
                            cursor: 'pointer',
                            backgroundColor: selectedSlip?.id === slip.id ? 'action.selected' : 'inherit'
                          }}
                        >
                          <TableCell>{slip.bookingCode}</TableCell>
                          <TableCell>{slip.contractNo}</TableCell>
                          <TableCell>{slip.carPlate}</TableCell>
                          <TableCell>{slip.containerNo}</TableCell>
                          <TableCell>{slip.sealNo}</TableCell>
                          <TableCell>{slip.weight} tấn</TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={slip.adjustedWeight || slip.weight}
                              onChange={(e) => handleAdjustedWeightChange(slip.id, e.target.value)}
                              placeholder="Nhập khối lượng điều chỉnh"
                              onClick={(e) => e.stopPropagation()}
                              InputProps={{
                                endAdornment: 'tấn'
                              }}
                            />
                          </TableCell>
                          <TableCell>{slip.date}</TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                color: slip.status === 'completed' ? 'success.main' : 'warning.main'
                              }}
                            >
                              {slip.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Lưu">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle edit
                                  }}
                                >
                                  <SaveOutlined />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle delete
                                  }}
                                >
                                  <DeleteOutlined />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="contained" onClick={handleSave}>
            Phê duyệt
          </Button>
        </Stack>
      </Box>
    </MainCard>
  );
}
