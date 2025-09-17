import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { dateHelper, DatePickerControl } from '../../../utils';

// Mock data - replace with actual data from your API
const mockData = {
  suppliers: [
    { name: 'Nhà cung cấp A', errorRate: 15, totalInspections: 100 },
    { name: 'Nhà cung cấp B', errorRate: 8, totalInspections: 150 },
    { name: 'Nhà cung cấp C', errorRate: 12, totalInspections: 80 },
    { name: 'Nhà cung cấp D', errorRate: 5, totalInspections: 200 }
  ],
  commonErrors: [
    { name: 'Lỗi kích thước', count: 25 },
    { name: 'Lỗi màu sắc', count: 18 },
    { name: 'Lỗi chất liệu', count: 15 },
    { name: 'Lỗi đóng gói', count: 12 }
  ]
};

const QcInspectionStatusTableOrBar = () => {
  const [startDate, setStartDate] = useState<DatePickerControl>(dateHelper.now());
  const [endDate, setEndDate] = useState<DatePickerControl>(dateHelper.now());
  const [view, setView] = useState<'table' | 'chart'>('table');

  const handleViewChange = (event: React.SyntheticEvent, newValue: 'table' | 'chart') => {
    setView(newValue);
  };

  return (
    <Card>
      <CardHeader title="Tình trạng kiểm tra hàng" />
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <DatePicker
                label="Từ ngày"
                value={startDate}
                onChange={(newValue) => setStartDate(dateHelper.from(newValue))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <DatePicker
                label="Đến ngày"
                value={endDate}
                onChange={(newValue) => setEndDate(dateHelper.from(newValue))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={view} onChange={handleViewChange}>
            <Tab label="Bảng" value="table" />
            <Tab label="Biểu đồ" value="chart" />
          </Tabs>
        </Box>

        {view === 'table' ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nhà cung cấp</TableCell>
                  <TableCell align="right">Tổng số kiểm tra</TableCell>
                  <TableCell align="right">Tỷ lệ lỗi (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockData.suppliers.map((supplier) => (
                  <TableRow key={supplier.name}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell align="right">{supplier.totalInspections}</TableCell>
                    <TableCell align="right">{supplier.errorRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ width: '100%', height: 300 }}>
            <BarChart
              xAxis={[
                {
                  data: mockData.suppliers.map((s) => s.name),
                  scaleType: 'band',
                  label: 'Nhà cung cấp'
                }
              ]}
              yAxis={[
                {
                  label: 'Tỷ lệ lỗi (%)',
                  min: 0,
                  max: Math.max(...mockData.suppliers.map((s) => s.errorRate)) + 5
                }
              ]}
              series={[
                {
                  data: mockData.suppliers.map((s) => s.errorRate),
                  label: 'Tỷ lệ lỗi',
                  color: '#F44336'
                }
              ]}
              height={300}
            />
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <CardHeader title="Các lỗi phổ biến" />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Loại lỗi</TableCell>
                  <TableCell align="right">Số lượng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockData.commonErrors.map((error) => (
                  <TableRow key={error.name}>
                    <TableCell>{error.name}</TableCell>
                    <TableCell align="right">{error.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QcInspectionStatusTableOrBar;
