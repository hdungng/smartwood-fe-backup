// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { PieChart } from '@mui/x-charts/PieChart';

interface ProductTypeChartProps {
  dataType: 'revenue' | 'volume' | 'orders';
  title?: string;
}

// Sample data for different product types
const productData = {
  revenue: [
    { name: 'Viên nén gỗ', value: 45600000, percentage: 35.2, color: '#1976d2' },
    { name: 'Dăm gỗ', value: 38200000, percentage: 29.5, color: '#2e7d32' },
    { name: 'Mùn cưa', value: 28800000, percentage: 22.2, color: '#ed6c02' },
    { name: 'Nhiên liệu sinh học khác', value: 17400000, percentage: 13.1, color: '#9c27b0' }
  ],
  volume: [
    { name: 'Mùn cưa', value: 58600, percentage: 42.1, color: '#ed6c02' },
    { name: 'Dăm gỗ', value: 34200, percentage: 24.6, color: '#2e7d32' },
    { name: 'Viên nén gỗ', value: 28900, percentage: 20.8, color: '#1976d2' },
    { name: 'Nhiên liệu sinh học khác', value: 17500, percentage: 12.5, color: '#9c27b0' }
  ],
  orders: [
    { name: 'Viên nén gỗ', value: 1245, percentage: 38.7, color: '#1976d2' },
    { name: 'Dăm gỗ', value: 967, percentage: 30.1, color: '#2e7d32' },
    { name: 'Mùn cưa', value: 623, percentage: 19.4, color: '#ed6c02' },
    { name: 'Nhiên liệu sinh học khác', value: 378, percentage: 11.8, color: '#9c27b0' }
  ]
};

// ==============================|| PRODUCT TYPE CHART ||============================== //

export default function ProductTypeChart({ dataType, title }: ProductTypeChartProps) {
  const theme = useTheme();

  const data = productData[dataType];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const getUnit = () => {
    switch (dataType) {
      case 'revenue':
        return '$';
      case 'volume':
        return 'MT';
      case 'orders':
        return 'đơn hàng';
      default:
        return '';
    }
  };

  const formatValue = (value: number) => {
    if (dataType === 'revenue') {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (dataType === 'volume') {
      return `${(value / 1000).toFixed(0)}K MT`;
    } else {
      return `${value.toLocaleString()} đơn`;
    }
  };

  const pieData = data.map((item, index) => ({
    id: index,
    value: item.value,
    label: item.name,
    color: item.color
  }));

  return (
    <Box>
      {/* Product Statistics */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title ||
            `Phân tích theo loại sản phẩm (${dataType === 'revenue' ? 'Doanh thu' : dataType === 'volume' ? 'Khối lượng' : 'Đơn hàng'})`}
        </Typography>

        {data.map((item, index) => (
          <Box key={index}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: item.color
                  }}
                />
                <Typography variant="body2" fontWeight="medium">
                  {item.name}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  {formatValue(item.value)}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: '45px', textAlign: 'right' }}>
                  {item.percentage.toFixed(1)}%
                </Typography>
              </Stack>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={item.percentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: item.color
                }
              }}
            />
          </Box>
        ))}
      </Stack>

      {/* Pie Chart */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <PieChart
          series={[
            {
              data: pieData,
              highlightScope: { highlight: 'item', fade: 'global' },
              valueFormatter: (value) => formatValue(value.value)
            }
          ]}
          height={200}
          margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
        />
      </Box>

      <Typography variant="caption" color="textSecondary" align="center" display="block">
        Tổng: {formatValue(total)}
      </Typography>
    </Box>
  );
}
