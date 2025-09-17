import { useState } from 'react';
import { Card, CardContent, CardHeader, Box, Grid, MenuItem, TextField } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { dateHelper, DatePickerControl } from '../../../utils';

// Mock data - replace with actual data from your API
const mockData = {
  suppliers: [
    { value: 'all', label: 'Tất cả nhà cung cấp' },
    { value: 'supplier1', label: 'Nhà cung cấp A' },
    { value: 'supplier2', label: 'Nhà cung cấp B' },
    { value: 'supplier3', label: 'Nhà cung cấp C' }
  ],
  qcData: {
    passed: 75,
    failed: 25
  }
};

const QcRateDonutChart = () => {
  const [startDate, setStartDate] = useState<DatePickerControl>(dateHelper.now());
  const [endDate, setEndDate] = useState<DatePickerControl>(dateHelper.now());
  const [selectedSupplier, setSelectedSupplier] = useState('all');

  const chartData = [
    { id: 0, value: mockData.qcData.passed, label: 'Đạt QC', color: '#4CAF50' },
    { id: 1, value: mockData.qcData.failed, label: 'Không đạt QC', color: '#F44336' }
  ];

  return (
    <Card>
      <CardHeader title="Tỷ lệ đơn hàng đạt / không đạt QC" />
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label="Nhà cung cấp"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                {mockData.suppliers.map((supplier) => (
                  <MenuItem key={supplier.value} value={supplier.value}>
                    {supplier.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <DatePicker
                label="Từ ngày"
                value={startDate}
                onChange={(newValue) => setStartDate(dateHelper.from(newValue))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <DatePicker
                label="Đến ngày"
                value={endDate}
                onChange={(newValue) => setEndDate(dateHelper.from(newValue))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
          <PieChart
            series={[
              {
                data: chartData,
                innerRadius: 60,
                outerRadius: 80,
                paddingAngle: 5,
                cornerRadius: 5,
                startAngle: -90,
                endAngle: 270,
                cx: 150,
                cy: 150
              }
            ]}
            width={300}
            height={300}
            slotProps={{
              legend: {
                direction: 'horizontal',
                position: { vertical: 'bottom', horizontal: 'center' }
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default QcRateDonutChart;
