import { Card, CardContent, CardHeader, Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

// Mock data - replace with actual data from your API
const mockData = {
  dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'],
  rates: [24500, 24600, 24550, 24700, 24650]
};

const ExchangeRateChart = () => {
  return (
    <Card>
      <CardHeader title="Tỷ giá USD/VND" />
      <CardContent>
        <Box sx={{ width: '100%', height: 300 }}>
          <LineChart
            xAxis={[
              {
                data: mockData.dates,
                scaleType: 'band',
                label: 'Ngày đặt hàng'
              }
            ]}
            yAxis={[
              {
                label: 'Tỷ giá (VND)',
                min: 24000,
                max: 25000
              }
            ]}
            series={[
              {
                data: mockData.rates,
                label: 'USD/VND',
                area: false,
                showMark: true
              }
            ]}
            height={300}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateChart;
