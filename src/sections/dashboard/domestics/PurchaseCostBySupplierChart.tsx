import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  MenuItem,
  TextField,
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
  productGroups: [
    { value: 'all', label: 'Tất cả nhóm hàng' },
    { value: 'group1', label: 'Nhóm hàng A' },
    { value: 'group2', label: 'Nhóm hàng B' },
    { value: 'group3', label: 'Nhóm hàng C' }
  ],
  suppliers: [
    { name: 'Nhà cung cấp A', totalCost: 150000000 },
    { name: 'Nhà cung cấp B', totalCost: 120000000 },
    { name: 'Nhà cung cấp C', totalCost: 95000000 },
    { name: 'Nhà cung cấp D', totalCost: 85000000 }
  ]
};

const PurchaseCostBySupplierChart = () => {
  const [startDate, setStartDate] = useState<DatePickerControl>(dateHelper.now());
  const [endDate, setEndDate] = useState<DatePickerControl>(dateHelper.now());
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const handleViewChange = (event: React.SyntheticEvent, newValue: 'chart' | 'table') => {
    setView(newValue);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardHeader title="Chi phí mua hàng nội địa theo nhà cung cấp" />
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <TextField select fullWidth label="Nhóm hàng" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                {mockData.productGroups.map((group) => (
                  <MenuItem key={group.value} value={group.value}>
                    {group.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
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
            <Tab label="Biểu đồ" value="chart" />
            <Tab label="Bảng" value="table" />
          </Tabs>
        </Box>

        {view === 'chart' ? (
          <Box sx={{ width: '100%', height: 400 }}>
            <BarChart
              layout="vertical"
              xAxis={[
                {
                  scaleType: 'band',
                  data: mockData.suppliers.map((s) => s.name),
                  label: 'Nhà cung cấp'
                }
              ]}
              yAxis={[
                {
                  scaleType: 'linear',
                  label: 'Tổng giá trị mua hàng (VND)',
                  valueFormatter: (value) => formatCurrency(value)
                }
              ]}
              series={[
                {
                  data: mockData.suppliers.map((s) => s.totalCost),
                  label: 'Chi phí mua hàng',
                  color: '#2196F3'
                }
              ]}
              height={400}
            />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nhà cung cấp</TableCell>
                  <TableCell align="right">Tổng giá trị mua hàng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockData.suppliers.map((supplier) => (
                  <TableRow key={supplier.name}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell align="right">{formatCurrency(supplier.totalCost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseCostBySupplierChart;
